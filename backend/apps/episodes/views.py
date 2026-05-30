from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.shortcuts import redirect
import hashlib
import inngest
from inngest_django.client import inngest_client

from .models import Episode, ProcessingStatus
from .serializers import EpisodeSerializer, EpisodeListSerializer, EpisodeCreateSerializer
from apps.channels.models import Channel
from apps.channels.services.youtube import YouTubeService
from inngest_django.functions import _create_queued_episode


class EpisodeListView(APIView):
    """
    GET /api/episodes/
    List episodes across all of the creator's channels.
    Supports filtering by channel, status, and search query.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        creator_channel_ids = Channel.objects.filter(
            creator=request.user
        ).values_list('id', flat=True)

        episodes = Episode.objects.filter(channel_id__in=creator_channel_ids)

        # Optional filters
        channel_id = request.query_params.get('channel')
        if channel_id:
            episodes = episodes.filter(channel_id=channel_id)

        proc_status = request.query_params.get('status')
        if proc_status:
            episodes = episodes.filter(processing_status=proc_status)

        search = request.query_params.get('search')
        if search:
            episodes = episodes.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        # Pagination
        page      = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start     = (page - 1) * page_size
        end       = start + page_size

        total   = episodes.count()
        episodes = episodes[start:end]

        return Response({
            'count':   total,
            'page':    page,
            'results': EpisodeListSerializer(episodes, many=True).data,
        })

    def post(self, request):
        serializer = EpisodeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        channel_id = serializer.validated_data['channel_id']
        video_id = serializer.validated_data['youtube_video_id']

        try:
            channel = Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return Response({'error': 'Channel not found.'}, status=status.HTTP_404_NOT_FOUND)

        if Episode.objects.filter(youtube_video_id=video_id).exists():
            return Response({'error': 'Episode already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        yt = YouTubeService(request.user)
        video_data = yt.get_video_details(video_id)
        if not video_data:
            return Response({'error': 'YouTube video not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Reuse the same logic as the automatic pipeline
        episode = _create_queued_episode(channel, video_data)
        inngest_client.send_sync(
            inngest.Event(
                name="youtube/audio.extract",
                data={"episode_id": str(episode.id)}
            )
        )

        return Response(EpisodeSerializer(episode).data, status=status.HTTP_201_CREATED)


class EpisodeDetailView(APIView):
    """GET /api/episodes/<id>/ — full episode detail including processing history."""
    permission_classes = [IsAuthenticated]

    def get(self, request, episode_id):
        creator_channel_ids = Channel.objects.filter(
            creator=request.user
        ).values_list('id', flat=True)

        try:
            episode = Episode.objects.get(id=episode_id, channel_id__in=creator_channel_ids)
        except Episode.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response(EpisodeSerializer(episode).data)


class EpisodeRetryView(APIView):
    """POST /api/episodes/<id>/retry/ — re-queue a failed episode for processing."""
    permission_classes = [IsAuthenticated]

    def post(self, request, episode_id):
        creator_channel_ids = Channel.objects.filter(
            creator=request.user
        ).values_list('id', flat=True)

        try:
            episode = Episode.objects.get(id=episode_id, channel_id__in=creator_channel_ids)
        except Episode.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if episode.processing_status != ProcessingStatus.FAILED:
            return Response(
                {'error': 'Only failed episodes can be retried.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if episode.retry_count >= 3:
            return Response(
                {'error': 'Maximum retry limit (3) reached.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        episode.processing_status = ProcessingStatus.QUEUED
        episode.processing_error  = ''
        episode.save(update_fields=['processing_status', 'processing_error'])

        inngest_client.send_sync(
            inngest.Event(
                name="youtube/audio.extract",
                data={"episode_id": str(episode.id)}
            )
        )
        return Response({'status': 'queued'})


class ChannelEpisodeListView(APIView):
    """GET /api/channels/<channel_id>/episodes/ — episodes scoped to a single channel."""
    permission_classes = [IsAuthenticated]

    def get(self, request, channel_id):
        try:
            channel = Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        episodes  = channel.episodes.all()
        page      = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start     = (page - 1) * page_size
        end       = start + page_size
        total     = episodes.count()

        return Response({
            'count':   total,
            'page':    page,
            'results': EpisodeListSerializer(episodes[start:end], many=True).data,
        })


class EpisodeAudioRedirectView(APIView):
    """
    GET /audio/<episode_id>/
    Public endpoint — records a download event and redirects to the signed audio URL.
    """
    permission_classes = []  # Publicly accessible

    def get(self, request, episode_id):
        try:
            episode = Episode.objects.get(id=episode_id)
        except Episode.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if not episode.audio_url:
            return Response({'error': 'Audio not ready yet.'}, status=status.HTTP_400_BAD_REQUEST)

        # Hash the IP immediately — never log the raw value
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        raw_ip = x_forwarded_for.split(',')[0].strip() if x_forwarded_for else request.META.get('REMOTE_ADDR', '')
        ip_hash = hashlib.sha256(raw_ip.encode()).hexdigest()

        # Send analytics event
        inngest_client.send_sync(
            inngest.Event(
                name="analytics/episode.downloaded",
                data={
                    "episode_id":  str(episode.id),
                    "channel_id":  str(episode.channel_id),
                    "ip_hash":     ip_hash,
                    "user_agent":  request.META.get('HTTP_USER_AGENT', ''),
                }
            )
        )

        return redirect(episode.audio_url)