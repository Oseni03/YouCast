from rest_framework import serializers
from .models import Episode


class EpisodeSerializer(serializers.ModelSerializer):
    duration_formatted = serializers.ReadOnlyField()
    channel_title = serializers.CharField(source='channel.channel_title', read_only=True)

    class Meta:
        model  = Episode
        fields = [
            'id', 'channel', 'channel_title',
            'youtube_video_id', 'youtube_url', 'title', 'description',
            'youtube_pub_date', 'duration_seconds', 'duration_formatted',
            'thumbnail_url', 'youtube_chapters',
            'audio_url', 'audio_size_bytes', 'audio_format',
            'processing_status', 'processing_started_at', 'processing_completed_at',
            'processing_error', 'retry_count',
            'pub_date', 'transcript_url', 'download_count',
            'created_at',
        ]
        read_only_fields = fields  # Episodes are managed by the pipeline, not user edits


class EpisodeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for table/list views."""
    duration_formatted = serializers.ReadOnlyField()

    class Meta:
        model  = Episode
        fields = [
            'id', 'title', 'thumbnail_url', 'youtube_pub_date',
            'duration_formatted', 'processing_status', 'audio_format',
            'download_count', 'pub_date', 'audio_url',
        ]


class EpisodeCreateSerializer(serializers.Serializer):
    """Input for manual episode creation."""
    channel_id = serializers.UUIDField()
    youtube_video_id = serializers.CharField(max_length=50)