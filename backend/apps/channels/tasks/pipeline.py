from celery import shared_task, chain
from django.utils import timezone

@shared_task(bind=True, max_retries=3)
def process_new_video_notification(self, atom_xml: str):
    """Entry point — parses WebSub Atom payload, validates against filters, queues pipeline."""
    import xml.etree.ElementTree as ET
    root       = ET.fromstring(atom_xml)
    ns         = {'yt': 'http://www.youtube.com/xml/schemas/2015', 'atom': 'http://www.w3.org/2005/Atom'}
    video_id   = root.find('.//yt:videoId', ns).text
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
    yt          = YouTubeService(channel.creator)
    video_data  = yt.get_video_details(video_id)
    if not video_data:
        return

    if not _passes_filters(channel, video_data):
        _create_skipped_episode(channel, video_data)
        return

    episode = _create_queued_episode(channel, video_data)
    extract_audio.delay(str(episode.id))


@shared_task(bind=True, max_retries=3)
def extract_audio(self, episode_id: str):
    from apps.episodes.models import Episode, ProcessingStatus
    from apps.episodes.services.extractor import AudioExtractor
    from apps.episodes.services.storage import AudioStorageService

    episode = Episode.objects.get(id=episode_id)
    episode.processing_status    = ProcessingStatus.PROCESSING
    episode.processing_started_at = timezone.now()
    episode.save(update_fields=['processing_status', 'processing_started_at'])

    try:
        extractor = AudioExtractor()
        result    = extractor.extract(episode.youtube_url, episode.audio_format)

        storage   = AudioStorageService()
        s3_key    = storage.build_s3_key(str(episode.channel_id), str(episode.id), episode.audio_format)
        storage.upload_audio(result['filepath'], s3_key)
        signed_url = storage.generate_signed_url(s3_key)

        episode.audio_s3_key      = s3_key
        episode.audio_url         = signed_url
        episode.audio_size_bytes  = result['size_bytes']
        episode.duration_seconds  = result['duration_seconds']
        episode.processing_status = ProcessingStatus.COMPLETE
        episode.processing_completed_at = timezone.now()
        episode.save()

    except Exception as exc:
        episode.retry_count      += 1
        episode.processing_error  = str(exc)
        episode.processing_status = ProcessingStatus.FAILED
        episode.save(update_fields=['retry_count', 'processing_error', 'processing_status'])
        raise self.retry(exc=exc, countdown=2 ** episode.retry_count * 60)


@shared_task
def schedule_channel_polling(channel_id: str):
    """Fallback polling — called every 15 min by Celery Beat for all active channels."""
    from apps.channels.models import Channel
    from apps.episodes.models import Episode
    from apps.channels.services.youtube import YouTubeService

    channel  = Channel.objects.get(id=channel_id)
    yt       = YouTubeService(channel.creator)
    videos   = yt.get_latest_videos(channel.youtube_uploads_playlist_id, max_results=10)

    for item in videos:
        video_id = item['contentDetails']['videoId']
        if not Episode.objects.filter(youtube_video_id=video_id).exists():
            process_new_video_notification.delay(
                _build_fake_atom(video_id, channel.youtube_channel_id)
            )

    channel.last_polled_at = timezone.now()
    channel.save(update_fields=['last_polled_at'])


@shared_task
def schedule_channel_cleanup(channel_id: str):
    """Deletes all audio files from S3 for a disconnected channel."""
    from apps.episodes.models import Episode
    from apps.episodes.services.storage import AudioStorageService

    episodes = Episode.objects.filter(channel_id=channel_id, audio_s3_key__isnull=False)
    storage  = AudioStorageService()
    for episode in episodes:
        if episode.audio_s3_key:
            storage.delete_audio(episode.audio_s3_key)
    episodes.delete()


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