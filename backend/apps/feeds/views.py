from django.http import HttpResponse, Http404
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as drf_status
from django.utils import timezone

from channels.models import Channel
from .models import PodcastDirectory
from .services.builder import RSSFeedBuilder
from .serializers import PodcastDirectorySerializer


class RSSFeedView(View):
    """
    GET /feed/<slug>/
    Public endpoint — serves the live RSS feed XML.
    Analytics middleware intercepts this request to log downloads.
    Cache-Control: no-cache ensures podcast apps always get the freshest feed.
    """
    @method_decorator(cache_control(no_cache=True, must_revalidate=True))
    def get(self, request, slug):
        try:
            channel = Channel.objects.select_related('creator').get(
                rss_slug=slug, monitoring_active=True
            )
        except Channel.DoesNotExist:
            raise Http404('Feed not found')

        builder  = RSSFeedBuilder()
        rss_feed = builder.build(channel)

        return HttpResponse(
            rss_feed,
            content_type='application/rss+xml; charset=utf-8',
        )


class DirectoryListView(APIView):
    """
    GET  /api/feeds/directories/                   — list all directory submissions
    POST /api/feeds/directories/                   — log a new submission
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        channel_id = request.query_params.get('channel')
        creator_channels = Channel.objects.filter(creator=request.user)

        directories = PodcastDirectory.objects.filter(channel__in=creator_channels)
        if channel_id:
            directories = directories.filter(channel_id=channel_id)

        return Response(PodcastDirectorySerializer(directories, many=True).data)

    def post(self, request):
        serializer = PodcastDirectorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        channel_id = request.data.get('channel')
        try:
            channel = Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return Response({'error': 'Channel not found.'}, status=drf_status.HTTP_404_NOT_FOUND)

        directory, created = PodcastDirectory.objects.update_or_create(
            channel  = channel,
            platform = serializer.validated_data['platform'],
            defaults = {
                'status':      'pending',
                'feed_url':    channel.rss_feed_url,
                'submit_date': timezone.now(),
            }
        )
        return Response(
            PodcastDirectorySerializer(directory).data,
            status=drf_status.HTTP_201_CREATED if created else drf_status.HTTP_200_OK,
        )


class DirectoryDetailView(APIView):
    """PATCH /api/feeds/directories/<id>/ — update submission status (e.g. mark approved)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, directory_id):
        creator_channels = Channel.objects.filter(creator=request.user)
        try:
            directory = PodcastDirectory.objects.get(
                id=directory_id, channel__in=creator_channels
            )
        except PodcastDirectory.DoesNotExist:
            return Response(status=drf_status.HTTP_404_NOT_FOUND)

        allowed_fields = ['status', 'notes']
        for field in allowed_fields:
            if field in request.data:
                setattr(directory, field, request.data[field])
        directory.save()

        return Response(PodcastDirectorySerializer(directory).data)


class FeedPreviewView(APIView):
    """
    GET /api/feeds/preview/<channel_id>/
    Returns the first 1000 chars of the RSS feed for in-dashboard preview.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, channel_id):
        try:
            channel = Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return Response(status=drf_status.HTTP_404_NOT_FOUND)

        builder  = RSSFeedBuilder()
        rss_feed = builder.build(channel).decode('utf-8')

        return Response({
            'feed_url':     channel.rss_feed_url,
            'preview_xml':  rss_feed[:2000],
            'episode_count': channel.episodes.filter(processing_status='complete').count(),
        })