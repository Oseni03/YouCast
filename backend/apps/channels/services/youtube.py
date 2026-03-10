import logging
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger('apps.channels')


class YouTubeService:
    """
    Thin wrapper around the YouTube Data API v3.
    Automatically refreshes expired OAuth tokens.
    """
    def __init__(self, creator):
        self.creator = creator
        self._client = None

    @property
    def client(self):
        if self._client is None:
            logger.debug(f"Initializing YouTube client for creator {self.creator.email}")
            try:
                creds = Credentials(
                    token         = self.creator.google_access_token,
                    refresh_token = self.creator.google_refresh_token,
                    token_uri     = 'https://oauth2.googleapis.com/token',
                    client_id     = settings.GOOGLE_OAUTH_CLIENT_ID,
                    client_secret = settings.GOOGLE_OAUTH_CLIENT_SECRET,
                )
                if not creds.token:
                    logger.warning(f"No access token for creator {self.creator.email}")

                if creds.expired:
                    logger.info(f"Token expired for creator {self.creator.email}, attempting refresh")
                    if not creds.refresh_token:
                        logger.error(f"Cannot refresh token for {self.creator.email}: missing refresh token")
                    creds.refresh(Request())
                    self.creator.google_access_token = creds.token
                    self.creator.token_expiry        = creds.expiry
                    self.creator.save(update_fields=['google_access_token', 'token_expiry'])
                    logger.info(f"Token refreshed successfully for {self.creator.email}")

                self._client = build('youtube', 'v3', credentials=creds)
            except Exception as e:
                logger.exception(f"Failed to initialize YouTube client for {self.creator.email}: {e}")
                raise
        return self._client

    def verify_channel_ownership(self, youtube_channel_id):
        """Returns channel metadata only if the authenticated creator owns the channel."""
        logger.debug(f"Verifying ownership for channel {youtube_channel_id}")
        try:
            response = self.client.channels().list(
                part='snippet,contentDetails',
                mine=True,
            ).execute()

            for item in response.get('items', []):
                if item['id'] == youtube_channel_id:
                    logger.info(f"Ownership verified for channel {youtube_channel_id}")
                    return self._parse_channel_item(item)
            
            logger.warning(f"Ownership NOT verified for channel {youtube_channel_id}. Channel not in user's list.")
            return None
        except Exception as e:
            logger.exception(f"YouTube API error during verify_channel_ownership: {e}")
            raise

    def list_my_channels(self):
        """Returns all channels owned by the authenticated creator."""
        logger.debug(f"Listing channels for creator {self.creator.email}")
        try:
            response = self.client.channels().list(
                part='snippet,contentDetails',
                mine=True,
            ).execute()

            channels = []
            for item in response.get('items', []):
                channels.append(self._parse_channel_item(item))
            logger.info(f"Retrieved {len(channels)} channels for {self.creator.email}")
            return channels
        except Exception as e:
            logger.exception(f"YouTube API error during list_my_channels for {self.creator.email}: {e}")
            raise

    def get_channel_metadata(self, youtube_channel_id):
        response = self.client.channels().list(
            part='snippet,contentDetails',
            id=youtube_channel_id,
        ).execute()
        items = response.get('items', [])
        return self._parse_channel_item(items[0]) if items else None

    def get_latest_videos(self, uploads_playlist_id, max_results=50):
        """Used by polling fallback task."""
        response = self.client.playlistItems().list(
            part='snippet,contentDetails',
            playlistId=uploads_playlist_id,
            maxResults=max_results,
        ).execute()
        return response.get('items', [])

    def get_video_details(self, video_id):
        response = self.client.videos().list(
            part='snippet,contentDetails,status',
            id=video_id,
        ).execute()
        items = response.get('items', [])
        return items[0] if items else None

    def _parse_channel_item(self, item):
        snippet         = item['snippet']
        content_details = item.get('contentDetails', {})
        thumbnails      = snippet.get('thumbnails', {})
        thumbnail_url   = (thumbnails.get('high') or thumbnails.get('default') or {}).get('url', '')

        return {
            'id':                  item['id'],
            'title':               snippet['title'],
            'description':         snippet.get('description', ''),
            'thumbnail_url':       thumbnail_url,
            'uploads_playlist_id': content_details.get('relatedPlaylists', {}).get('uploads', ''),
        }