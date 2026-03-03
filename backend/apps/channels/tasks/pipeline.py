# from celery import shared_task, chain
from django.utils import timezone

# @shared_task(bind=True, max_retries=3)
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


# @shared_task(bind=True, max_retries=3)
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


# @shared_task
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


# @shared_task
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