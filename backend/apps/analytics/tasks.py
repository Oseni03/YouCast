# from celery import shared_task
import geoip2.database
from .models import AnalyticsEvent
from channels.models import Channel
from episodes.models import Episode


KNOWN_PODCAST_APPS = {
    'AppleCoreMedia':      'Apple Podcasts',
    'Spotify':             'Spotify',
    'Overcast':            'Overcast',
    'PocketCasts':         'Pocket Casts',
    'Castro':              'Castro',
    'Downcast':            'Downcast',
    'AntennaPod':          'AntennaPod',
    'Amazon Music':        'Amazon Music',
}

BOT_SIGNATURES = [
    'bot', 'crawler', 'spider', 'feedfetcher',
    'googlebot', 'bingbot', 'python-requests',
]


# @shared_task
def log_analytics_event(slug: str, ip_hash: str, user_agent: str, bytes_served: int):
    """
    Called asynchronously by RSSAnalyticsMiddleware after each RSS feed response.
    Parses user agent, resolves country, determines if bot, saves AnalyticsEvent.
    """
    try:
        channel = Channel.objects.get(rss_slug=slug)
    except Channel.DoesNotExist:
        return

    ua_lower   = user_agent.lower()
    is_bot     = any(sig in ua_lower for sig in BOT_SIGNATURES)
    podcast_app = ''
    for signature, app_name in KNOWN_PODCAST_APPS.items():
        if signature.lower() in ua_lower:
            podcast_app = app_name
            break

    AnalyticsEvent.objects.create(
        episode_id   = None,  # Feed-level event; episode attribution requires byte-range analysis
        channel      = channel,
        ip_hash      = ip_hash,
        user_agent   = user_agent[:500],
        podcast_app  = podcast_app,
        bytes_served = bytes_served,
        is_bot       = is_bot,
    )


# @shared_task
def send_weekly_digest():
    """
    Scheduled via Celery Beat — runs every Monday at 9am UTC.
    Sends each creator a summary email with last week's download stats.
    """
    from django.core.mail import send_mail
    from accounts.models import Creator
    from django.template.loader import render_to_string
    from datetime import date, timedelta

    week_ago = date.today() - timedelta(days=7)

    for creator in Creator.objects.filter(is_active=True):
        channels = Channel.objects.filter(creator=creator)
        total_downloads = AnalyticsEvent.objects.filter(
            channel__in=channels,
            timestamp__date__gte=week_ago,
            is_bot=False,
        ).count()

        if total_downloads == 0:
            continue

        body = render_to_string('analytics/weekly_digest_email.txt', {
            'creator':         creator,
            'total_downloads': total_downloads,
            'week_start':      week_ago,
        })

        send_mail(
            subject        = f'Your PodcastifyYT weekly stats: {total_downloads} downloads',
            message        = body,
            from_email     = 'hello@podcastifyyt.com',
            recipient_list = [creator.email],
        )