import logging
from django.utils.text import slugify
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

import inngest
from inngest_django.client import inngest_client

from .models import Channel
from .serializers import ChannelSerializer, ChannelCreateSerializer, ChannelUpdateSerializer
from .services.youtube import YouTubeService
from .services.websub import WebSubService
from apps.episodes.models import Episode

logger = logging.getLogger('apps.channels')


# --------------------------------------------------------------------------- #
#  Channel CRUD                                                                #
# --------------------------------------------------------------------------- #

@method_decorator(csrf_exempt, name='dispatch')
class ChannelListCreateView(APIView):
    """
    GET  /api/channels/   — list all channels for the authenticated creator
    POST /api/channels/   — connect a new YouTube channel
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        channels = Channel.objects.filter(creator=request.user)
        return Response(ChannelSerializer(channels, many=True).data)

    def post(self, request):
        # --- plan / ToS guards -------------------------------------------
        limit = request.user.channel_limit
        if Channel.objects.filter(creator=request.user).count() >= limit:
            return Response(
                {'error': f'Your plan allows a maximum of {limit} channels.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not request.user.has_accepted_tos:
            return Response(
                {'error': 'You must accept the Terms of Service before connecting a channel.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # --- validate input -----------------------------------------------
        serializer = ChannelCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        youtube_channel_id = serializer.validated_data['youtube_channel_id']

        # --- verify ownership via YouTube API -----------------------------
        yt = YouTubeService(request.user)
        channel_data = yt.verify_channel_ownership(youtube_channel_id)
        if not channel_data:
            return Response(
                {'error': 'Channel not found or you do not own this channel.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- generate unique RSS slug -------------------------------------
        base_slug = slugify(channel_data['title'])
        slug, counter = base_slug, 1
        while Channel.objects.filter(rss_slug=slug).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1

        # --- persist -------------------------------------------------------
        channel = Channel.objects.create(
            creator=request.user,
            youtube_channel_id=youtube_channel_id,
            channel_title=channel_data['title'],
            channel_description=channel_data['description'],
            channel_thumbnail_url=channel_data['thumbnail_url'],
            youtube_uploads_playlist_id=channel_data['uploads_playlist_id'],
            rss_slug=slug,
        )

        # --- WebSub subscription (non-fatal) ------------------------------
        if not WebSubService.subscribe(channel):
            logger.warning(
                'WebSub subscription failed for channel %s; polling fallback still active',
                channel.id,
            )

        # --- Inngest polling fallback -------------------------------------
        try:
            inngest_client.send_sync(
                inngest.Event(
                    name='channel/poll',
                    id=f'channel-poll-{channel.id}',
                    data={'channel_id': str(channel.id)}
                )
            )
        except Exception:
            # Non-fatal: polling can be retried; don't roll back channel creation
            logger.exception('Failed to schedule polling for channel %s', channel.id)

        return Response(ChannelSerializer(channel).data, status=status.HTTP_201_CREATED)


# --------------------------------------------------------------------------- #

class YouTubeChannelListView(APIView):
    """
    GET /api/channels/youtube/
    Lists all YouTube channels owned by the authenticated user.
    Requires the user to have a connected Google account (tokens stored).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.google_refresh_token:
            return Response(
                {'error': 'YouTube account not connected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        yt = YouTubeService(request.user)
        try:
            return Response(yt.list_my_channels())
        except Exception:
            logger.exception('Failed to fetch YouTube channels for user %s', request.user.id)
            return Response(
                {'error': 'Failed to fetch YouTube channels.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# --------------------------------------------------------------------------- #

class ChannelDetailView(APIView):
    """
    GET    /api/channels/<id>/   — retrieve channel detail
    PATCH  /api/channels/<id>/   — update feed settings / filter config
    DELETE /api/channels/<id>/   — disconnect channel (schedules file deletion)
    """
    permission_classes = [IsAuthenticated]

    def _get_channel(self, request, channel_id):
        try:
            return Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return None

    def get(self, request, channel_id):
        channel = self._get_channel(request, channel_id)
        if not channel:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(ChannelSerializer(channel).data)

    def patch(self, request, channel_id):
        channel = self._get_channel(request, channel_id)
        if not channel:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ChannelUpdateSerializer(channel, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ChannelSerializer(channel).data)

    def delete(self, request, channel_id):
        channel = self._get_channel(request, channel_id)
        if not channel:
            return Response(status=status.HTTP_404_NOT_FOUND)

        WebSubService.unsubscribe(channel)

        try:
            inngest_client.send_sync(
                inngest.Event(
                    name='channel/cleanup',
                    id=f'channel-cleanup-{channel.id}',
                    data={'channel_id': str(channel.id)}
                )
            )
        except Exception:
            # Log but don't block deletion — cleanup can be retried via admin
            logger.exception('Failed to schedule cleanup for channel %s', channel.id)

        channel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------------------------------- #

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
            channel.channel_title = channel_data['title']
            channel.channel_description = channel_data['description']
            channel.channel_thumbnail_url = channel_data['thumbnail_url']
            channel.save(update_fields=[
                'channel_title', 'channel_description', 'channel_thumbnail_url',
            ])

        return Response(ChannelSerializer(channel).data)


# --------------------------------------------------------------------------- #
#  WebSub callback                                                             #
# --------------------------------------------------------------------------- #

@method_decorator(csrf_exempt, name='dispatch')
class WebSubCallbackView(APIView):
    """
    GET  /api/channels/websub/callback/ — hub challenge verification
    POST /api/channels/websub/callback/ — incoming video-published notification
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """
        YouTube hub sends a GET with hub.challenge to verify the endpoint.
        We must echo the challenge back as plain text with a 200.
        """
        mode      = request.query_params.get('hub.mode')
        topic     = request.query_params.get('hub.topic')
        challenge = request.query_params.get('hub.challenge')
        lease_str = request.query_params.get('hub.lease_seconds', '0')

        if not (mode == 'subscribe' and challenge and topic):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            lease_seconds = int(lease_str)
        except (ValueError, TypeError):
            lease_seconds = 0

        WebSubService.confirm_subscription(topic, lease_seconds)

        # The hub requires the raw challenge string as the response body, not JSON
        from django.http import HttpResponse
        return HttpResponse(challenge, content_type='text/plain', status=200)

    def post(self, request):
        """
        YouTube pushes an Atom feed entry when a new video is published.
        Verify the HMAC signature before forwarding to Inngest.
        """
        # Resolve channel from topic so we can look up its secret
        topic = request.headers.get('X-Hub-Topic') or request.query_params.get('hub.topic', '')
        channel_id = WebSubService._extract_channel_id(topic)
        channel = Channel.objects.filter(youtube_channel_id=channel_id).first() if channel_id else None

        if channel:
            sig_header = request.headers.get('X-Hub-Signature', '')
            if not WebSubService.verify_notification_signature(channel, request.body, sig_header):
                logger.warning(
                    'Rejected WebSub notification with invalid signature for channel %s',
                    channel_id,
                )
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            # Channel not found — could be a replay for a deleted channel; log and discard
            logger.warning('WebSub POST received for unknown channel_id=%s', channel_id)
            return Response(status=status.HTTP_200_OK)

        try:
            inngest_client.send_sync(
                inngest.Event(
                    name='youtube/video.notified',
                    id=f'websub-notification-{channel_id}',
                    data={'atom_xml': request.body.decode('utf-8')},
                )
            )
        except Exception:
            logger.exception('Failed to forward WebSub notification to Inngest')
            # Return 200 anyway — returning 5xx causes the hub to retry aggressively
        
        return Response(status=status.HTTP_200_OK)


# --------------------------------------------------------------------------- #
#  Eligible videos                                                             #
# --------------------------------------------------------------------------- #

class EligibleVideoListView(APIView):
    """
    GET /api/channels/<id>/eligible-videos/
    Fetch up to 50 videos from the channel's uploads playlist,
    excluding those that already have an Episode record.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, channel_id):
        try:
            channel = Channel.objects.get(id=channel_id, creator=request.user)
        except Channel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if not channel.youtube_uploads_playlist_id:
            return Response(
                {'error': 'Channel upload playlist ID not found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        yt = YouTubeService(request.user)
        videos = yt.get_latest_videos(channel.youtube_uploads_playlist_id, max_results=50)

        video_ids = [v['contentDetails']['videoId'] for v in videos]
        existing_ids = set(
            Episode.objects.filter(youtube_video_id__in=video_ids)
            .values_list('youtube_video_id', flat=True)
        )

        eligible = []
        for v in videos:
            vid = v['contentDetails']['videoId']
            if vid in existing_ids:
                continue
            snippet = v.get('snippet', {})
            thumbnails = snippet.get('thumbnails', {})
            thumbnail_url = (
                (thumbnails.get('high') or thumbnails.get('default') or {}).get('url', '')
            )
            eligible.append({
                'id': vid,
                'title': snippet.get('title', ''),
                'thumbnail': thumbnail_url,
                'uploadedAt': snippet.get('publishedAt', ''),
            })

        return Response(eligible)