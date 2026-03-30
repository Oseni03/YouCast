from django.db import models
from django.conf import settings
import uuid


class ProcessingStatus(models.TextChoices):
    QUEUED     = 'queued',     'Queued'
    PROCESSING = 'processing', 'Processing'
    COMPLETE   = 'complete',   'Complete'
    FAILED     = 'failed',     'Failed'
    SKIPPED    = 'skipped',    'Skipped'  # filtered out by creator rules


class Episode(models.Model):
    """
    One podcast episode = one YouTube video that passed the creator's filters.
    Tracks the full lifecycle from detection through audio processing to RSS inclusion.
    """
    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    channel           = models.ForeignKey(
        'channels.Channel', on_delete=models.CASCADE, related_name='episodes'
    )

    # YouTube source
    youtube_video_id  = models.CharField(max_length=50, unique=True)
    youtube_url       = models.URLField()
    title             = models.CharField(max_length=500)
    description       = models.TextField(blank=True)
    youtube_pub_date  = models.DateTimeField()
    duration_seconds  = models.IntegerField(default=0)
    thumbnail_url     = models.URLField(blank=True)
    youtube_chapters  = models.JSONField(default=list)
    # Shape: [{"title": "Intro", "start_seconds": 0}, ...]

    # Audio output
    audio_url         = models.URLField(blank=True)     # signed S3/R2 URL
    audio_s3_key      = models.CharField(max_length=500, blank=True)  # permanent reference
    audio_size_bytes  = models.BigIntegerField(default=0)
    audio_format      = models.CharField(max_length=10, default='mp3')  # mp3 | aac

    # Processing state
    processing_status = models.CharField(
        max_length=20, choices=ProcessingStatus.choices, default=ProcessingStatus.QUEUED
    )
    processing_started_at   = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    processing_error        = models.TextField(blank=True)
    retry_count             = models.IntegerField(default=0)

    # RSS metadata
    episode_number    = models.IntegerField(null=True, blank=True)
    season_number     = models.IntegerField(null=True, blank=True)
    pub_date          = models.DateTimeField()  # When it appears in RSS (= youtube_pub_date)
    transcript_url    = models.URLField(blank=True)  # Podcasting 2.0 transcript

    # Analytics summary (denormalized for dashboard queries)
    download_count    = models.BigIntegerField(default=0)

    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'episodes'
        ordering  = ['-pub_date']

    def __str__(self):
        return f'{self.title} ({self.youtube_video_id})'

    @property
    def duration_formatted(self):
        h = self.duration_seconds // 3600
        m = (self.duration_seconds % 3600) // 60
        s = self.duration_seconds % 60
        return f'{h:02}:{m:02}:{s:02}'

    @property
    def audio_redirect_url(self):
        """
        Returns the backend URL that tracks the download and then redirects to S3.
        Used in the RSS feed enclosure tag.
        """
        if self.channel.custom_domain:
            return f'https://{self.channel.custom_domain}/episodes/audio/{self.id}/'
        return f'https://{settings.APP_DOMAIN}/episodes/audio/{self.id}/'