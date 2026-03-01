from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import Creator
from .serializers import CreatorSerializer, CreatorUpdateSerializer, TOSAcceptSerializer


class GoogleOAuthCallbackView(APIView):
    """
    POST /api/auth/google/callback/
    Receives the Google ID token from the frontend after the OAuth consent
    screen redirect. Verifies the token, creates or retrieves the Creator
    record, then returns a JWT pair for all subsequent API calls.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_str = request.data.get('id_token')
        if not id_token_str:
            return Response({'error': 'id_token is required'}, status=400)

        try:
            payload = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )
        except ValueError as e:
            return Response({'error': f'Invalid token: {str(e)}'}, status=401)

        google_user_id = payload['sub']
        email          = payload['email']
        display_name   = payload.get('name', '')
        avatar_url     = payload.get('picture', '')

        creator, created = Creator.objects.get_or_create(
            google_user_id=google_user_id,
            defaults={
                'email':        email,
                'display_name': display_name,
                'avatar_url':   avatar_url,
            }
        )

        # Update profile fields on every login
        if not created:
            creator.display_name = display_name
            creator.avatar_url   = avatar_url
            creator.save(update_fields=['display_name', 'avatar_url'])

        refresh = RefreshToken.for_user(creator)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'creator': CreatorSerializer(creator).data,
            'is_new':  created,
        }, status=201 if created else 200)


class GoogleOAuthTokenExchangeView(APIView):
    """
    POST /api/auth/google/token/
    Exchanges a one-time authorization code for access + refresh tokens.
    Stores encrypted tokens on the Creator for server-side YouTube API calls
    (channel monitoring, video metadata fetching).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        auth_code = request.data.get('code')
        if not auth_code:
            return Response({'error': 'code is required'}, status=400)

        # Exchange code for tokens using google-auth-oauthlib
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_config(
            settings.GOOGLE_OAUTH_CLIENT_CONFIG,
            scopes=['https://www.googleapis.com/auth/youtube.readonly'],
        )
        flow.redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI
        flow.fetch_token(code=auth_code)

        creds = flow.credentials
        creator = request.user
        creator.google_access_token  = creds.token
        creator.google_refresh_token = creds.refresh_token or creator.google_refresh_token
        creator.token_expiry         = creds.expiry
        creator.save(update_fields=[
            'google_access_token', 'google_refresh_token', 'token_expiry'
        ])

        return Response({'status': 'tokens_stored'})


class MeView(APIView):
    """GET/PATCH /api/auth/me/ — retrieve or update the authenticated creator's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CreatorSerializer(request.user).data)

    def patch(self, request):
        serializer = CreatorUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CreatorSerializer(request.user).data)


class TOSAcceptView(APIView):
    """POST /api/auth/tos/ — creator accepts Terms of Service during onboarding."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TOSAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        creator = request.user
        if creator.has_accepted_tos:
            return Response({'status': 'already_accepted'})

        creator.tos_accepted_at = timezone.now()
        creator.save(update_fields=['tos_accepted_at'])
        return Response({'status': 'accepted', 'tos_accepted_at': creator.tos_accepted_at})


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except Exception:
            pass  # Token already invalid — that's fine
        return Response({'status': 'logged_out'})