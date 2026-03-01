from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid


class Channel(models.Model):
    """
    Represents one YouTube channel connected by a creator.
    One creator can own multiple channels (up to their plan limit).
    Each channel maps to exactly one podcast RSS feed.
    """
    id                    = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator               = models.ForeignKey(
        'accounts.Creator', on_delete=models.CASCADE, related_name='channels'
    )

    # YouTube identity
    youtube_channel_id    = models.CharField(max_length=255, unique=True)
    channel_title         = models.CharField(max_length=500)
    channel_description   = models.TextField(blank=True)
    channel_thumbnail_url = models.URLField(blank=True)
    youtube_uploads_playlist_id = models.CharField(max_length=255, blank=True)

    # Podcast identity (creator-customizable)
    podcast_title         = models.CharField(max_length=500, blank=True)
    podcast_description   = models.TextField(blank=True)
    artwork_url           = models.URLField(blank=True)  # defaults to channel_thumbnail_url
    rss_slug              = models.SlugField(max_length=255, unique=True)
    custom_domain         = models.CharField(max_length=255, blank=True)  # Pro+ only

    # Podcast metadata
    language              = models.CharField(max_length=10, default='en')
    category              = models.CharField(max_length=100, default='Technology')
    explicit              = models.BooleanField(default=False)
    episode_prefix        = models.TextField(blank=True)  # prepended to episode descriptions
    episode_suffix        = models.TextField(blank=True)  # appended to episode descriptions

    # Filter configuration — stored as JSON for flexibility
    filter_config         = models.JSONField(default=dict)
    # Shape: {
    #   "min_duration_seconds": 60,
    #   "title_include_keywords": ["podcast", "interview"],
    #   "title_exclude_keywords": ["#shorts"],
    #   "include_playlist_ids": [],
    #   "exclude_playlist_ids": [],
    # }

    # Monitoring state
    monitoring_active     = models.BooleanField(default=True)
    websub_subscribed_at  = models.DateTimeField(null=True, blank=True)
    websub_expires_at     = models.DateTimeField(null=True, blank=True)
    last_polled_at        = models.DateTimeField(null=True, blank=True)
    last_video_published_at = models.DateTimeField(null=True, blank=True)

    created_at            = models.DateTimeField(auto_now_add=True)
    updated_at            = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'channels'
        ordering  = ['-created_at']

    def __str__(self):
        return f'{self.channel_title} ({self.youtube_channel_id})'

    @property
    def effective_artwork_url(self):
        return self.artwork_url or self.channel_thumbnail_url

    @property
    def effective_podcast_title(self):
        return self.podcast_title or self.channel_title

    @property
    def rss_feed_url(self):
        if self.custom_domain:
            return f'https://{self.custom_domain}/feed'
        return f'https://podcastifyyt.com/feed/{self.rss_slug}'