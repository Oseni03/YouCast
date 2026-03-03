import requests
import hashlib
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class WebSubService:
    HUB_URL   = 'https://pubsubhubbub.appspot.com/subscribe'
    CALLBACK  = settings.WEBSUB_CALLBACK_URL  # e.g. https://podcastifyyt.com/api/channels/websub/callback/

    @classmethod
    def _topic_url(cls, youtube_channel_id):
        return f'https://www.youtube.com/xml/feeds/videos.xml?channel_id={youtube_channel_id}'

    @classmethod
    def subscribe(cls, channel):
        response = requests.post(cls.HUB_URL, data={
            'hub.callback':     cls.CALLBACK,
            'hub.topic':        cls._topic_url(channel.youtube_channel_id),
            'hub.verify':       'sync',
            'hub.mode':         'subscribe',
            'hub.lease_seconds': 864000,  # 10 days; we re-subscribe before expiry
        })
        # Subscription confirmation happens via GET callback
        return response.status_code == 204

    @classmethod
    def unsubscribe(cls, channel):
        requests.post(cls.HUB_URL, data={
            'hub.callback': cls.CALLBACK,
            'hub.topic':    cls._topic_url(channel.youtube_channel_id),
            'hub.verify':   'sync',
            'hub.mode':     'unsubscribe',
        })

    @classmethod
    def confirm_subscription(cls, topic_url, lease_seconds):
        """Called when YouTube hub confirms subscription via GET challenge."""
        from apps.channels.models import Channel
        # Extract channel ID from topic URL
        channel_id = topic_url.split('channel_id=')[-1]
        Channel.objects.filter(youtube_channel_id=channel_id).update(
            websub_subscribed_at = timezone.now(),
            websub_expires_at    = timezone.now() + timedelta(seconds=lease_seconds),
        )