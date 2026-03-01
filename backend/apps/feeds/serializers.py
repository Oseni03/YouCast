from rest_framework import serializers
from .models import PodcastDirectory


class PodcastDirectorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = PodcastDirectory
        fields = [
            'id', 'channel', 'platform', 'status',
            'feed_url', 'submit_date', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'feed_url', 'submit_date', 'created_at']