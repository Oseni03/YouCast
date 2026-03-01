from rest_framework import serializers
from .models import Creator

class CreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Creator
        fields = [
            'id', 'email', 'display_name', 'avatar_url',
            'plan_tier', 'tos_accepted_at', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'plan_tier', 'created_at']


class CreatorUpdateSerializer(serializers.ModelSerializer):
    """For profile updates — only mutable fields."""
    class Meta:
        model  = Creator
        fields = ['display_name', 'avatar_url']


class TOSAcceptSerializer(serializers.Serializer):
    accepted = serializers.BooleanField()

    def validate_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the Terms of Service.")
        return value