import hmac
import logging
import hashlib
import requests
from urllib.parse import urlparse, parse_qs

from django.conf import settings
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger('apps.channels.websub')


class WebSubService:
    HUB_URL = 'https://pubsubhubbub.appspot.com/subscribe'

    @classmethod
    def _callback_url(cls):
        # Read lazily so test overrides to settings work correctly
        return settings.WEBSUB_CALLBACK_URL

    @classmethod
    def _topic_url(cls, youtube_channel_id):
        return f'https://www.youtube.com/feeds/videos.xml?channel_id={youtube_channel_id}'

    @classmethod
    def _hub_secret(cls, channel):
        """
        Per-channel HMAC secret derived from a global secret + channel ID.
        Lets us verify YouTube's X-Hub-Signature on incoming notifications.
        Requires WEBSUB_HUB_SECRET in settings.
        """
        return hmac.new(
            settings.WEBSUB_HUB_SECRET.encode(),
            channel.youtube_channel_id.encode(),
            hashlib.sha256,
        ).hexdigest()

    # ------------------------------------------------------------------ #
    #  Subscription management                                             #
    # ------------------------------------------------------------------ #

    @classmethod
    def subscribe(cls, channel):
        topic = cls._topic_url(channel.youtube_channel_id)
        logger.info('Subscribing to WebSub topic for channel %s', channel.youtube_channel_id)
        try:
            response = requests.post(
                cls.HUB_URL,
                data={
                    'hub.callback':      cls._callback_url(),
                    'hub.topic':         topic,
                    'hub.verify':        'async',   # sync risks deadlocks on single-threaded dev servers
                    'hub.mode':          'subscribe',
                    'hub.lease_seconds': 864000,    # 10 days; renewed by periodic task before expiry
                    'hub.secret':        cls._hub_secret(channel),
                },
                timeout=10,
            )
        except requests.RequestException as exc:
            logger.error(
                'WebSub subscribe request failed for channel %s: %s',
                channel.youtube_channel_id, exc,
            )
            return False

        logger.debug(
            'WebSub subscribe response status=%s body=%s',
            response.status_code, response.text[:500],
        )
        success = response.status_code in (200, 202, 204)
        if not success:
            logger.warning(
                'Failed to subscribe to WebSub topic %s for channel %s (status=%s)',
                topic, channel.youtube_channel_id, response.status_code,
            )
        return success

    @classmethod
    def unsubscribe(cls, channel):
        topic = cls._topic_url(channel.youtube_channel_id)
        logger.info('Unsubscribing from WebSub topic for channel %s', channel.youtube_channel_id)
        try:
            response = requests.post(
                cls.HUB_URL,
                data={
                    'hub.callback': cls._callback_url(),
                    'hub.topic':    topic,
                    'hub.verify':   'async',
                    'hub.mode':     'unsubscribe',
                },
                timeout=10,
            )
        except requests.RequestException as exc:
            logger.error(
                'WebSub unsubscribe request failed for channel %s: %s',
                channel.youtube_channel_id, exc,
            )
            return False

        logger.debug(
            'WebSub unsubscribe response status=%s body=%s',
            response.status_code, response.text[:500],
        )
        success = response.status_code in (202, 204)
        if not success:
            logger.warning(
                'Failed to unsubscribe from WebSub topic %s for channel %s (status=%s)',
                topic, channel.youtube_channel_id, response.status_code,
            )
        return success

    # ------------------------------------------------------------------ #
    #  Callback handlers (called from your webhook view)                  #
    # ------------------------------------------------------------------ #

    @classmethod
    def confirm_subscription(cls, topic_url, lease_seconds):
        """
        Called when the YouTube hub confirms a subscription via GET challenge.
        Updates the channel's subscription timestamps.
        """
        from apps.channels.models import Channel

        channel_id = cls._extract_channel_id(topic_url)
        if not channel_id:
            logger.warning(
                'Could not extract channel_id from topic URL: %s', topic_url,
            )
            return False

        now = timezone.now()
        updated = Channel.objects.filter(youtube_channel_id=channel_id).update(
            websub_subscribed_at=now,
            websub_expires_at=now + timedelta(seconds=lease_seconds),
        )
        if updated:
            logger.info(
                'Confirmed WebSub subscription for channel %s lease_seconds=%s',
                channel_id, lease_seconds,
            )
        else:
            logger.warning(
                'No channel found to confirm WebSub subscription for channel_id=%s',
                channel_id,
            )
        return bool(updated)

    @classmethod
    def verify_notification_signature(cls, channel, body: bytes, signature_header: str) -> bool:
        """
        Validates the X-Hub-Signature header on incoming POST notifications.
        Always call this before processing any notification payload.

        Usage in your view:
            if not WebSubService.verify_notification_signature(channel, request.body, request.headers.get('X-Hub-Signature', '')):
                return HttpResponse(status=403)
        """
        if not signature_header:
            logger.warning(
                'Missing X-Hub-Signature for channel %s', channel.youtube_channel_id,
            )
            return False

        try:
            method, provided_digest = signature_header.split('=', 1)
        except ValueError:
            logger.warning('Malformed X-Hub-Signature header: %s', signature_header)
            return False

        hash_fn = {'sha1': hashlib.sha1, 'sha256': hashlib.sha256}.get(method)
        if not hash_fn:
            logger.warning('Unsupported X-Hub-Signature method: %s', method)
            return False

        expected_digest = hmac.new(
            cls._hub_secret(channel).encode(),
            body,
            hash_fn,
        ).hexdigest()

        if not hmac.compare_digest(expected_digest, provided_digest):
            logger.warning(
                'X-Hub-Signature mismatch for channel %s', channel.youtube_channel_id,
            )
            return False

        return True

    # ------------------------------------------------------------------ #
    #  Helpers                                                             #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _extract_channel_id(topic_url: str):
        """Safely parse channel_id out of a YouTube feed URL."""
        params = parse_qs(urlparse(topic_url).query)
        ids = params.get('channel_id', [])
        return ids[0] if ids else None