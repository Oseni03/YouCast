from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Creator

class CreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Creator
        fields = [
            'id', 'email', 'username', 'avatar_url', 'bio',
            'plan_tier', 'tos_accepted_at', 'has_youtube_connected', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'plan_tier', 'created_at']


class CreatorUpdateSerializer(serializers.ModelSerializer):
    """For profile updates — only mutable fields."""
    class Meta:
        model  = Creator
        fields = ['username', 'avatar_url', 'bio']


class TOSAcceptSerializer(serializers.Serializer):
    accepted = serializers.BooleanField()

    def validate_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the Terms of Service.")
        return value


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model  = Creator
        fields = ['email', 'password', 'username']

    def create(self, validated_data):
        return Creator.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data['username']
        )