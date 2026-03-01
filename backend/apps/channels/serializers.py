from rest_framework import serializers
from .models import Channel


class FilterConfigSerializer(serializers.Serializer):
    min_duration_seconds      = serializers.IntegerField(default=60, min_value=0)
    title_include_keywords    = serializers.ListField(child=serializers.CharField(), default=list)
    title_exclude_keywords    = serializers.ListField(child=serializers.CharField(), default=list)
    include_playlist_ids      = serializers.ListField(child=serializers.CharField(), default=list)
    exclude_playlist_ids      = serializers.ListField(child=serializers.CharField(), default=list)


class ChannelSerializer(serializers.ModelSerializer):
    rss_feed_url        = serializers.ReadOnlyField()
    effective_artwork_url = serializers.ReadOnlyField()
    episode_count       = serializers.SerializerMethodField()

    class Meta:
        model  = Channel
        fields = [
            'id', 'youtube_channel_id', 'channel_title', 'channel_thumbnail_url',
            'podcast_title', 'podcast_description', 'artwork_url',
            'effective_artwork_url', 'rss_slug', 'rss_feed_url',
            'language', 'category', 'explicit',
            'episode_prefix', 'episode_suffix',
            'filter_config', 'monitoring_active',
            'websub_subscribed_at', 'last_polled_at', 'last_video_published_at',
            'episode_count', 'created_at',
        ]
        read_only_fields = [
            'id', 'youtube_channel_id', 'channel_title', 'channel_thumbnail_url',
            'rss_slug', 'rss_feed_url', 'websub_subscribed_at',
            'last_polled_at', 'last_video_published_at', 'created_at',
        ]

    def get_episode_count(self, obj):
        return obj.episodes.count()


class ChannelCreateSerializer(serializers.Serializer):
    """Used during onboarding to connect a YouTube channel."""
    youtube_channel_id = serializers.CharField()

    def validate_youtube_channel_id(self, value):
        if Channel.objects.filter(youtube_channel_id=value).exists():
            raise serializers.ValidationError("This channel is already connected.")
        return value


class ChannelUpdateSerializer(serializers.ModelSerializer):
    """Mutable fields only — for feed settings & filter config."""
    filter_config = FilterConfigSerializer(required=False)

    class Meta:
        model  = Channel
        fields = [
            'podcast_title', 'podcast_description', 'artwork_url',
            'language', 'category', 'explicit',
            'episode_prefix', 'episode_suffix',
            'filter_config', 'monitoring_active',
        ]

    def update(self, instance, validated_data):
        filter_config = validated_data.pop('filter_config', None)
        if filter_config is not None:
            instance.filter_config = filter_config
        return super().update(instance, validated_data)