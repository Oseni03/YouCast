from django.db import models
import uuid


class AnalyticsEvent(models.Model):
    """
    One row per RSS feed request that results in audio being served.
    IABv2 compliant — raw IPs are never stored, only SHA-256 hashes.
    """
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    episode      = models.ForeignKey(
        'episodes.Episode', on_delete=models.CASCADE, related_name='analytics_events'
    )
    channel      = models.ForeignKey(
        'channels.Channel', on_delete=models.CASCADE, related_name='analytics_events'
    )

    timestamp    = models.DateTimeField(auto_now_add=True)
    ip_hash      = models.CharField(max_length=64)       # SHA-256 of raw IP, never raw IP
    country_code = models.CharField(max_length=2, blank=True)  # ISO 3166-1 alpha-2
    user_agent   = models.TextField(blank=True)
    podcast_app  = models.CharField(max_length=100, blank=True)  # parsed from user_agent
    bytes_served = models.BigIntegerField(default=0)
    is_bot       = models.BooleanField(default=False)

    class Meta:
        db_table = 'analytics_events'
        indexes  = [
            models.Index(fields=['episode', 'timestamp']),
            models.Index(fields=['channel', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f'AnalyticsEvent {self.id} — {self.episode_id} @ {self.timestamp}'