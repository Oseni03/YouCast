from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from django.utils import timezone
from django.conf import settings


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
            creds = Credentials(
                token         = self.creator.google_access_token,
                refresh_token = self.creator.google_refresh_token,
                token_uri     = 'https://oauth2.googleapis.com/token',
                client_id     = settings.GOOGLE_OAUTH_CLIENT_ID,
                client_secret = settings.GOOGLE_OAUTH_CLIENT_SECRET,
            )
            if creds.expired:
                creds.refresh(Request())
                self.creator.google_access_token = creds.token
                self.creator.token_expiry        = creds.expiry
                self.creator.save(update_fields=['google_access_token', 'token_expiry'])

            self._client = build('youtube', 'v3', credentials=creds)
        return self._client

    def verify_channel_ownership(self, youtube_channel_id):
        """Returns channel metadata only if the authenticated creator owns the channel."""
        response = self.client.channels().list(
            part='snippet,contentDetails',
            mine=True,
        ).execute()

        for item in response.get('items', []):
            if item['id'] == youtube_channel_id:
                return self._parse_channel_item(item)
        return None

    def list_my_channels(self):
        """Returns all channels owned by the authenticated creator."""
        response = self.client.channels().list(
            part='snippet,contentDetails',
            mine=True,
        ).execute()

        channels = []
        for item in response.get('items', []):
            channels.append(self._parse_channel_item(item))
        return channels

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