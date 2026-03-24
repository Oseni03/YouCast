import logging
from django.utils import timezone
from django.utils.text import slugify
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .models import Channel
from .serializers import ChannelSerializer, ChannelCreateSerializer, ChannelUpdateSerializer
from .services.youtube import YouTubeService
from .services.websub import WebSubService
from .tasks.pipeline import schedule_channel_polling

from apps.episodes.models import Episode


@method_decorator(csrf_exempt, name='dispatch')
class ChannelListCreateView(APIView):
    """
    GET  /api/channels/        — list all channels for the authenticated creator
    POST /api/channels/        — connect a new YouTube channel
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        channels = Channel.objects.filter(creator=request.user)
        return Response(ChannelSerializer(channels, many=True).data)

    def post(self, request):
        logger = logging.getLogger('apps.channels')
        try:
            # Enforce plan channel limits
            limit = request.user.channel_limit
            current_count = Channel.objects.filter(creator=request.user).count()
            if current_count >= limit:
                return Response(
                    {'error': f'Your plan allows a maximum of {limit} channels.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

            has_tos = request.user.has_accepted_tos
            if not has_tos:
                return Response(
                    {'error': 'You must accept the Terms of Service before connecting a channel.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = ChannelCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            youtube_channel_id = serializer.validated_data['youtube_channel_id']

            # Verify the creator actually owns this channel via YouTube API
            yt = YouTubeService(request.user)
            channel_data = yt.verify_channel_ownership(youtube_channel_id)
            if not channel_data:
                return Response(
                    {'error': 'Channel not found or you do not own this channel.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Generate a unique RSS slug
            base_slug = slugify(channel_data['title'])
            slug      = base_slug
            counter   = 1
            while Channel.objects.filter(rss_slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1

            channel = Channel.objects.create(
                creator                      = request.user,
                youtube_channel_id           = youtube_channel_id,
                channel_title                = channel_data['title'],
                channel_description          = channel_data['description'],
                channel_thumbnail_url        = channel_data['thumbnail_url'],
                youtube_uploads_playlist_id  = channel_data['uploads_playlist_id'],
                rss_slug                     = slug,
            )

            # Subscribe to WebSub for real-time new-video notifications
            try:
                WebSubService.subscribe(channel)
            except Exception as e:
                logger.warning(f"WebSub subscription failed for channel {channel.id}: {e}")

            # Also schedule polling fallback
            try:
                schedule_channel_polling.delay(str(channel.id))
            except Exception as e:
                logger.error(f"Failed to schedule polling for channel {channel.id}: {e}")

            return Response(ChannelSerializer(channel).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception(f"Unhandled error in ChannelListCreateView.post: {e}")
            return Response(
                {'error': 'An internal server error occurred while connecting the channel.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class YouTubeChannelListView(APIView):
    """
    GET /api/channels/youtube/
    Lists all YouTube channels owned by the authenticated user.
    Requires that the user has already connected their Google account (tokens stored).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.google_refresh_token:
            return Response(
                {'error': 'YouTube account not connected.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        yt = YouTubeService(request.user)
        try:
            channels = yt.list_my_channels()
            return Response(channels)
        except Exception as e:
            logger = logging.getLogger('django')
            logger.error(f"Failed to fetch YouTube channels: {e}")
            return Response(
                {'error': f'Failed to fetch YouTube channels: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChannelDetailView(APIView):
    """
    GET    /api/channels/<id>/   — retrieve channel detail
    PATCH  /api/channels/<id>/   — update feed settings / filter config
    DELETE /api/channels/<id>/   — disconnect channel (schedules file deletion)
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, request, channel_id):
        try:
            return Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return None

    def get(self, request, channel_id):
        channel = self.get_object(request, channel_id)
        if not channel:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(ChannelSerializer(channel).data)

    def patch(self, request, channel_id):
        channel = self.get_object(request, channel_id)
        if not channel:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ChannelUpdateSerializer(channel, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ChannelSerializer(channel).data)

    def delete(self, request, channel_id):
        channel = self.get_object(request, channel_id)
        if not channel:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Unsubscribe from WebSub
        WebSubService.unsubscribe(channel)

        # Schedule audio file deletion (within 30 days per ToS)
        from .tasks.pipeline import schedule_channel_cleanup
        schedule_channel_cleanup.apply_async(
            args=[str(channel.id)], countdown=60 * 60 * 24 * 30  # 30 days
        )

        channel.monitoring_active = False
        channel.save(update_fields=['monitoring_active'])
        channel.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ChannelRefreshMetadataView(APIView):
    """POST /api/channels/<id>/refresh/ — pull latest metadata from YouTube."""
    permission_classes = [IsAuthenticated]

    def post(self, request, channel_id):
        try:
            channel = Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        yt = YouTubeService(request.user)
        channel_data = yt.get_channel_metadata(channel.youtube_channel_id)
        if channel_data:
            channel.channel_title         = channel_data['title']
            channel.channel_description   = channel_data['description']
            channel.channel_thumbnail_url = channel_data['thumbnail_url']
            channel.save(update_fields=[
                'channel_title', 'channel_description', 'channel_thumbnail_url'
            ])

        return Response(ChannelSerializer(channel).data)


class WebSubCallbackView(APIView):
    """
    GET  /api/channels/websub/callback/ — WebSub subscription verification (hub challenges)
    POST /api/channels/websub/callback/ — Receive new-video push notification from YouTube
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """YouTube hub sends a GET with hub.challenge to verify the subscription endpoint."""
        challenge    = request.query_params.get('hub.challenge')
        mode         = request.query_params.get('hub.mode')
        topic        = request.query_params.get('hub.topic')
        lease_seconds = request.query_params.get('hub.lease_seconds', 0)

        if mode == 'subscribe' and challenge:
            # Update subscription expiry on the channel
            WebSubService.confirm_subscription(topic, int(lease_seconds))
            return Response(int(challenge), status=status.HTTP_200_OK,
                            content_type='text/plain')

        return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        """YouTube pushes an Atom feed entry when a new video is published."""
        from .tasks.pipeline import process_new_video_notification
        process_new_video_notification.delay(request.body.decode('utf-8'))
        # Return 200 quickly — all processing happens async
        return Response(status=status.HTTP_200_OK)


class EligibleVideoListView(APIView):
    """
    GET /api/channels/<id>/eligible-videos/
    Fetch videos from the channel's YouTube uploads playlist and filter out those already processed.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, channel_id):
        try:
            channel = Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if not channel.youtube_uploads_playlist_id:
            return Response({'error': 'Channel upload playlist ID not found.'}, status=status.HTTP_400_BAD_REQUEST)

        yt = YouTubeService(request.user)
        videos = yt.get_latest_videos(channel.youtube_uploads_playlist_id, max_results=50)

        # Filter out videos that already have Episode records
        video_ids = [v['contentDetails']['videoId'] for v in videos]
        existing_video_ids = set(
            Episode.objects.filter(youtube_video_id__in=video_ids).values_list('youtube_video_id', flat=True)
        )

        eligible_videos = []
        for v in videos:
            vid = v['contentDetails']['videoId']
            if vid not in existing_video_ids:
                snippet = v.get('snippet', {})
                eligible_videos.append({
                    'id': vid,
                    'title': snippet.get('title', ''),
                    'thumbnail': (snippet.get('thumbnails', {}).get('high') or snippet.get('thumbnails', {}).get('default') or {}).get('url', ''),
                    'uploadedAt': snippet.get('publishedAt', ''),
                    # Duration is not in playlistItems.list by default, would need another call to videos().list
                    # For now, we'll keep it simple or fetch details if needed.
                })

        return Response(eligible_videos)