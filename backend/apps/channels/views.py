from django.utils import timezone
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .models import Channel
from .serializers import ChannelSerializer, ChannelCreateSerializer, ChannelUpdateSerializer
from .services.youtube import YouTubeService
from .services.websub import WebSubService
from tasks.monitor import schedule_channel_polling


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
        # Enforce plan channel limits
        current_count = Channel.objects.filter(creator=request.user).count()
        if current_count >= request.user.channel_limit:
            return Response(
                {'error': f'Your plan allows a maximum of {request.user.channel_limit} channels.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not request.user.has_accepted_tos:
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
        WebSubService.subscribe(channel)

        # Also schedule polling fallback
        schedule_channel_polling.delay(str(channel.id))

        return Response(ChannelSerializer(channel).data, status=status.HTTP_201_CREATED)


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
        from tasks.pipeline import schedule_channel_cleanup
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
        from tasks.pipeline import process_new_video_notification
        process_new_video_notification.delay(request.body.decode('utf-8'))
        # Return 200 quickly — all processing happens async
        return Response(status=status.HTTP_200_OK)