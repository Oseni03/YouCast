import os
import logging
from django.conf import settings
from django.utils import timezone
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from google.auth.transport import requests as google_requests
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from django.contrib.auth import authenticate

from .models import Creator
from .serializers import CreatorSerializer, CreatorUpdateSerializer, TOSAcceptSerializer, SignupSerializer


class GoogleOAuthAuthorizeView(APIView):
    """
    GET /api/auth/google/authorize/
    Generates the Google OAuth consent URL and returns it to the frontend.
    Frontend redirects the browser to this URL.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        flow = Flow.from_client_config(
            settings.GOOGLE_OAUTH_CLIENT_CONFIG,
            scopes=[
                'https://www.googleapis.com/auth/youtube.readonly',
                'openid',
                'email',
                'profile',
            ],
        )
        flow.redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI

        authorization_url, state = flow.authorization_url(
            access_type='offline',      # gets a refresh token
            include_granted_scopes='true',
            prompt='consent',           # forces refresh token on every login
        )

        # Store state, PKCE verifier, and optional token in session to verify on callback
        request.session['oauth_state'] = state
        request.session['code_verifier'] = getattr(flow, 'code_verifier', None)
        
        token = request.query_params.get('token')
        if token:
            request.session['auth_token'] = token

        return redirect(authorization_url)


class GoogleOAuthCallbackView(APIView):
    """
    GET /api/auth/google/callback/
    Google redirects here with ?code=...&state=...
    Backend exchanges the code for tokens, creates/retrieves the Creator,
    issues JWTs, then redirects the browser back to the frontend.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        logger = logging.getLogger('django')
        code  = request.query_params.get('code')
        state = request.query_params.get('state')

        # Verify state to prevent CSRF
        if state != request.session.get('oauth_state'):
            return Response({'error': 'Invalid state'}, status=400)

        flow = Flow.from_client_config(
            settings.GOOGLE_OAUTH_CLIENT_CONFIG,
            scopes=[
                'https://www.googleapis.com/auth/youtube.readonly',
                'openid',
                'email',
                'profile',
            ],
            state=state,
        )
        flow.redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI

        # Allow Google to return different scopes than requested (e.g. if the user previously granted more scopes)
        os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

        try:
            code_verifier = request.session.get('code_verifier')
            if code_verifier:
                flow.fetch_token(code=code, code_verifier=code_verifier)
            else:
                flow.fetch_token(code=code)
        except Exception as e:
            logger.error(f"Token exchange failed: {e}")
            return redirect(f'{settings.FRONTEND_URL}/auth/error?message=token_exchange_failed')

        creds = flow.credentials

        # Decode the ID token to get user profile info
        id_info = google_id_token.verify_oauth2_token(
            creds.id_token,
            google_requests.Request(),
            settings.GOOGLE_OAUTH_CLIENT_ID,
        )

        google_user_id = id_info['sub']
        email          = id_info['email']
        username       = email.split('@')[0]
        avatar_url     = id_info.get('picture', '')

        # 1. Resolve Creator mapping: Link Account flow vs Login flow
        creator = None
        created = False
        
        if auth_token := request.session.pop('auth_token', None):
            try:
                user_id = AccessToken(auth_token)['user_id']
                creator = Creator.objects.get(id=user_id)
                
                # Verify this Google account isn't already assigned to another creator
                existing = Creator.objects.filter(google_user_id=google_user_id).exclude(id=creator.id).first()
                if existing:
                    logger.warning(f"Google ID {google_user_id} is already linked to creator {existing.id}")
                    return redirect(f'{settings.FRONTEND_URL}/auth/error?message=already_linked')

                creator.google_user_id = google_user_id
                logger.info(f"Linking Google ID {google_user_id} to creator {creator.id}")
            except Exception as e:
                logger.warning(f"Account linking failed: {e}")

        if not creator:
            creator, created = Creator.objects.get_or_create(
                google_user_id=google_user_id,
                defaults={
                    'email':      email,
                    'username':   username,
                    'avatar_url': avatar_url,
                }
            )

        # 2. Sync profile and store tokens
        creator.username             = username
        creator.avatar_url           = avatar_url
        creator.google_access_token  = creds.token
        creator.google_refresh_token = creds.refresh_token or creator.google_refresh_token
        creator.token_expiry         = creds.expiry
        creator.save()

        # 3. Generate tokens and redirect to frontend
        refresh = RefreshToken.for_user(creator)
        access  = str(refresh.access_token)

        frontend_redirect = (
            f'{settings.FRONTEND_URL}/auth/callback'
            f'?access={access}'
            f'&refresh={str(refresh)}'
            f'&is_new={str(created).lower()}'
        )
        return redirect(frontend_redirect)


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


class DeactivateAccountView(APIView):
    """POST /api/auth/deactivate/ — deactivate the authenticated creator's account."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        creator = request.user
        creator.is_active = False
        creator.save(update_fields=['is_active'])

        # Optional: blacklist the refresh token if provided to immediately terminate current session
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        return Response({'status': 'account_deactivated'}, status=status.HTTP_200_OK)


class SignupView(APIView):
    """POST /api/auth/signup/ — create a new user with email and password."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        creator = serializer.save()
        refresh = RefreshToken.for_user(creator)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'creator': CreatorSerializer(creator).data,
            'is_new': True,
        }, status=status.HTTP_201_CREATED)


class EmailLoginView(APIView):
    """POST /api/auth/login/ — authenticate with email and password."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        creator = authenticate(request, username=email, password=password)

        if creator is not None:
            refresh = RefreshToken.for_user(creator)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'creator': CreatorSerializer(creator).data,
                'is_new': False,
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)