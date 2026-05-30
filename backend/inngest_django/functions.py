import inngest
import inngest.django

from .client import inngest_client

from django.db.models import F
from django.conf import settings
from apps.analytics.models import AnalyticsEvent
from apps.channels.models import Channel
from apps.episodes.models import Episode

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

@inngest_client.create_function(
    fn_id="log-analytics-event",
    trigger=inngest.TriggerEvent(event="analytics/event.logged"),
)
def log_analytics_event_workflow(ctx: inngest.Context):
    slug = ctx.event.data["slug"]
    ip_hash = ctx.event.data["ip_hash"]
    user_agent = ctx.event.data["user_agent"]
    bytes_served = ctx.event.data["bytes_served"]

    try:
        channel = Channel.objects.get(rss_slug=slug)
    except Channel.DoesNotExist:
        return

    ua_lower = user_agent.lower()
    is_bot = any(sig in ua_lower for sig in BOT_SIGNATURES)
    podcast_app = ''
    for signature, app_name in KNOWN_PODCAST_APPS.items():
        if signature.lower() in ua_lower:
            podcast_app = app_name
            break

    AnalyticsEvent.objects.create(
        episode_id=None,
        channel=channel,
        ip_hash=ip_hash,
        user_agent=user_agent[:500],
        podcast_app=podcast_app,
        bytes_served=bytes_served,
        is_bot=is_bot,
    )

@inngest_client.create_function(
    fn_id="send-weekly-digest",
    trigger=inngest.TriggerCron(cron="0 9 * * 1"), # Monday at 9am UTC
)
def send_weekly_digest_workflow(ctx: inngest.Context):
    from django.core.mail import send_mail
    from apps.accounts.models import Creator
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
            from_email     = f'hello@{settings.APP_DOMAIN}',
            recipient_list = [creator.email],
        )


@inngest_client.create_function(
    fn_id="log-episode-download",
    trigger=inngest.TriggerEvent(event="analytics/episode.downloaded"),
)
def log_episode_download_workflow(ctx: inngest.Context):
    episode_id = ctx.event.data["episode_id"]
    channel_id = ctx.event.data["channel_id"]
    ip_hash    = ctx.event.data["ip_hash"]
    user_agent = ctx.event.data["user_agent"]

    # 1. Increment the denormalized download_count on the Episode model
    Episode.objects.filter(id=episode_id).update(download_count=F('download_count') + 1)

    # 2. Extract metadata and log the detailed event
    ua_lower = user_agent.lower()
    is_bot   = any(sig in ua_lower for sig in BOT_SIGNATURES)

    podcast_app = ''
    for signature, app_name in KNOWN_PODCAST_APPS.items():
        if signature.lower() in ua_lower:
            podcast_app = app_name
            break

    AnalyticsEvent.objects.create(
        episode_id  = episode_id,
        channel_id  = channel_id,
        ip_hash     = ip_hash,
        user_agent  = user_agent[:500],
        podcast_app = podcast_app,
        is_bot      = is_bot,
    )

from django.utils import timezone
import xml.etree.ElementTree as ET
import isodate

@inngest_client.create_function(
    fn_id="process-new-video-notification",
    trigger=inngest.TriggerEvent(event="youtube/video.notified"),
)
def process_new_video_notification(ctx: inngest.Context):
    atom_xml = ctx.event.data["atom_xml"]
    root = ET.fromstring(atom_xml)
    ns = {'yt': 'http://www.youtube.com/xml/schemas/2015', 'atom': 'http://www.w3.org/2005/Atom'}
    video_id = root.find('.//yt:videoId', ns).text
    channel_id = root.find('.//yt:channelId', ns).text

    from apps.channels.models import Channel
    from apps.episodes.models import Episode
    try:
        channel = Channel.objects.get(youtube_channel_id=channel_id, monitoring_active=True)
    except Channel.DoesNotExist:
        return

    if Episode.objects.filter(youtube_video_id=video_id).exists():
        return  # Already processed

    # Apply creator filters
    from apps.channels.services.youtube import YouTubeService
    yt = YouTubeService(channel.creator)
    video_data = yt.get_video_details(video_id)
    if not video_data:
        return

    if not _passes_filters(channel, video_data):
        _create_skipped_episode(channel, video_data)
        return

    episode = _create_queued_episode(channel, video_data)
    
    inngest_client.send_sync(
        inngest.Event(
            name="youtube/audio.extract",
            data={"episode_id": str(episode.id)}
        )
    )

def _passes_filters(channel, video_data):
    """
    Validates a YouTube video against the channel's filter configuration.
    video_data is a snippet/contentDetails item from YouTube API.
    """
    config = channel.filter_config
    if not config:
        return True

    # 1. Duration filter
    min_duration = config.get('min_duration_seconds')
    duration_str = video_data.get('contentDetails', {}).get('duration', 'PT0S')
    # Simple ISO 8601 duration parser (e.g. PT12M45S)
    import isodate
    duration_seconds = isodate.parse_duration(duration_str).total_seconds()
    if min_duration and duration_seconds < min_duration:
        return False

    title = video_data.get('snippet', {}).get('title', '').lower()

    # 2. Exclude keywords (strongest filter)
    exclude_keywords = config.get('title_exclude_keywords', [])
    for kw in exclude_keywords:
        if kw.lower() in title:
            return False

    # 3. Include keywords (if present, title MUST contain one)
    include_keywords = config.get('title_include_keywords', [])
    if include_keywords:
        found = False
        for kw in include_keywords:
            if kw.lower() in title:
                found = True
                break
        if not found:
            return False

    return True


def _create_skipped_episode(channel, video_data):
    """Logs a video that was detected but filtered out."""
    from apps.episodes.models import Episode, ProcessingStatus
    snippet = video_data.get('snippet', {})
    Episode.objects.create(
        channel=channel,
        youtube_video_id=video_data['id'],
        youtube_url=f"https://www.youtube.com/watch?v={video_data['id']}",
        title=snippet.get('title', ''),
        description=snippet.get('description', ''),
        youtube_pub_date=snippet.get('publishedAt'),
        thumbnail_url=snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
        processing_status=ProcessingStatus.SKIPPED,
        pub_date=snippet.get('publishedAt'),  # Skipped episodes don't really need a pub_date, but it's required
    )


def _create_queued_episode(channel, video_data):
    """Creates an Episode record and returns it, ready for audio extraction."""
    from apps.episodes.models import Episode, ProcessingStatus
    snippet = video_data.get('snippet', {})
    import isodate
    duration_seconds = isodate.parse_duration(video_data.get('contentDetails', {}).get('duration', 'PT0S')).total_seconds()

    return Episode.objects.create(
        channel=channel,
        youtube_video_id=video_data['id'],
        youtube_url=f"https://www.youtube.com/watch?v={video_data['id']}",
        title=snippet.get('title', ''),
        description=snippet.get('description', ''),
        youtube_pub_date=snippet.get('publishedAt'),
        duration_seconds=int(duration_seconds),
        thumbnail_url=snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
        processing_status=ProcessingStatus.QUEUED,
        pub_date=snippet.get('publishedAt'),
    )


def _build_fake_atom(video_id, youtube_channel_id):
    """Helper for polling fallback - mimics the WebSub XML structure."""
    return f"""<?xml version='1.0' encoding='UTF-8'?>
    <feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">
        <entry>
            <yt:videoId>{video_id}</yt:videoId>
            <yt:channelId>{youtube_channel_id}</yt:channelId>
        </entry>
    </feed>
    """


@inngest_client.create_function(
    fn_id="extract-audio",
    trigger=inngest.TriggerEvent(event="youtube/audio.extract"),
)
def extract_audio_workflow(ctx: inngest.Context):
    episode_id = ctx.event.data["episode_id"]
    from apps.episodes.models import Episode, ProcessingStatus
    from apps.episodes.services.extractor import AudioExtractor
    from apps.episodes.services.storage import AudioStorageService

    episode = Episode.objects.get(id=episode_id)
    episode.processing_status = ProcessingStatus.PROCESSING
    episode.processing_started_at = timezone.now()
    episode.save(update_fields=['processing_status', 'processing_started_at'])

    try:
        def _extract():
            extractor = AudioExtractor()
            return extractor.extract(episode.youtube_url, episode.audio_format)

        result = ctx.step.run("extract-audio", _extract)

        def _upload():
            storage = AudioStorageService()
            s3_key = storage.build_s3_key(str(episode.channel_id), str(episode.id), episode.audio_format)
            storage.upload_audio(result['filepath'], s3_key)
            return s3_key

        s3_key = ctx.step.run("upload-to-s3", _upload)

        def _complete():
            storage = AudioStorageService()
            signed_url = storage.generate_signed_url(s3_key)
            episode.audio_s3_key = s3_key
            episode.audio_url = signed_url
            episode.audio_size_bytes = result['size_bytes']
            episode.duration_seconds = result['duration_seconds']
            episode.processing_status = ProcessingStatus.COMPLETE
            episode.processing_completed_at = timezone.now()
            episode.save()

        ctx.step.run("update-episode-status", _complete)

    except Exception as exc:
        def _fail():
            episode.retry_count += 1
            episode.processing_error = str(exc)
            episode.processing_status = ProcessingStatus.FAILED
            episode.save(update_fields=['retry_count', 'processing_error', 'processing_status'])
        
        ctx.step.run("mark-as-failed", _fail)
        raise exc

@inngest_client.create_function(
    fn_id="schedule-channel-polling",
    trigger=inngest.TriggerCron(cron="*/15 * * * *"),
)
def schedule_channel_polling_workflow(ctx: inngest.Context):
    from apps.channels.models import Channel
    from apps.episodes.models import Episode
    from apps.channels.services.youtube import YouTubeService

    channels = Channel.objects.filter(monitoring_active=True)
    for channel in channels:
        yt = YouTubeService(channel.creator)
        videos = yt.get_latest_videos(channel.youtube_uploads_playlist_id, max_results=10)

        for item in videos:
            video_id = item['contentDetails']['videoId']
            if not Episode.objects.filter(youtube_video_id=video_id).exists():
                inngest_client.send_sync(
                    inngest.Event(
                        name="youtube/video.notified",
                        data={"atom_xml": _build_fake_atom(video_id, channel.youtube_channel_id)}
                    )
                )

        channel.last_polled_at = timezone.now()
        channel.save(update_fields=['last_polled_at'])

@inngest_client.create_function(
    fn_id="schedule-channel-cleanup",
    trigger=inngest.TriggerEvent(event="channel/cleanup"),
)
def schedule_channel_cleanup_workflow(ctx: inngest.Context):
    channel_id = ctx.event.data["channel_id"]
    from apps.episodes.models import Episode
    from apps.episodes.services.storage import AudioStorageService

    episodes = Episode.objects.filter(channel_id=channel_id, audio_s3_key__isnull=False)
    storage = AudioStorageService()
    for episode in episodes:
        if episode.audio_s3_key:
            storage.delete_audio(episode.audio_s3_key)
    episodes.delete()
