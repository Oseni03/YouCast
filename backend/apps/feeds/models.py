from django.db import models
import uuid


class DirectoryStatus(models.TextChoices):
    NOT_SUBMITTED = 'not_submitted', 'Not Submitted'
    PENDING       = 'pending',       'Pending Review'
    APPROVED      = 'approved',      'Approved'
    REJECTED      = 'rejected',      'Rejected'


class PodcastDirectory(models.Model):
    """
    Tracks submission status for each podcast platform per channel.
    Created by creators via the Directory Submission Wizard.
    """
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    channel     = models.ForeignKey(
        'channels.Channel', on_delete=models.CASCADE, related_name='directories'
    )
    platform    = models.CharField(max_length=50, choices=[
        ('spotify', 'Spotify'),
        ('apple',   'Apple Podcasts'),
        ('amazon',  'Amazon Music'),
        ('google',  'Google Podcasts'),
        ('pocket_casts', 'Pocket Casts'),
    ])
    status      = models.CharField(
        max_length=20, choices=DirectoryStatus.choices, default=DirectoryStatus.NOT_SUBMITTED
    )
    feed_url    = models.URLField(blank=True)  # The RSS URL submitted to the platform
    submit_date = models.DateTimeField(null=True, blank=True)
    notes       = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = 'podcast_directories'
        unique_together = [('channel', 'platform')]

    def __str__(self):
        return f'{self.channel.channel_title} → {self.platform} ({self.status})'