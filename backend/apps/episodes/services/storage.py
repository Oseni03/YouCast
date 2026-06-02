import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings

logger = logging.getLogger('apps.episodes.storage')

cloudinary.config(
    cloud_name = settings.CLOUDINARY_CLOUD_NAME,
    api_key    = settings.CLOUDINARY_API_KEY,
    api_secret = settings.CLOUDINARY_API_SECRET,
    secure     = True,
)


class AudioStorageService:
    """Handles upload and URL generation for audio files via Cloudinary."""

    FOLDER = "opticast/audio"

    def upload_audio(self, filepath: str, s3_key: str, content_type: str = "audio/mpeg") -> str:
        """
        Uploads audio file to Cloudinary.
        s3_key is kept as the parameter name for interface compatibility —
        it's used as the Cloudinary public_id so existing call sites don't change.
        Returns the public_id for permanent reference.
        """
        public_id = self._key_to_public_id(s3_key)

        logger.info('Uploading audio to Cloudinary for key=%s filepath=%s', s3_key, filepath)
        cloudinary.uploader.upload(
            filepath,
            resource_type = "video",   # Cloudinary uses "video" for all audio types
            public_id     = public_id,
            type          = "private",  # requires signed URLs to access
            overwrite     = True,
            format        = self._content_type_to_format(content_type),
        )
        logger.debug('Upload complete for key=%s public_id=%s', s3_key, public_id)
        return s3_key  # return original key — callers store this as audio_s3_key

    def generate_signed_url(self, s3_key: str, expiry_hours: int = 24) -> str:
        """
        Generates a time-limited signed URL for serving audio.
        This URL is what goes in the RSS <enclosure> tag.
        """
        public_id = self._key_to_public_id(s3_key)

        logger.info('Generating signed audio URL for key=%s expiry_hours=%s', s3_key, expiry_hours)
        url = cloudinary.utils.private_download_url(
            public_id,
            resource_type = "video",
            expires_at    = int(__import__("time").time()) + (expiry_hours * 3600),
            attachment    = False,
        )
        logger.debug('Signed URL generated for key=%s url=%s', s3_key, url)
        return url

    def delete_audio(self, s3_key: str):
        public_id = self._key_to_public_id(s3_key)
        logger.info('Deleting Cloudinary audio resource for key=%s public_id=%s', s3_key, public_id)
        cloudinary.api.delete_resources(
            [public_id],
            resource_type = "video",
            type          = "private",
        )

    def build_s3_key(self, channel_id: str, episode_id: str, fmt: str) -> str:
        """
        Kept identical to the original — callers use this to build the key
        before passing it to upload_audio / generate_signed_url.
        """
        return f"audio/{channel_id}/{episode_id}.{fmt}"

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _key_to_public_id(self, s3_key: str) -> str:
        """
        Converts an S3-style key (audio/channel-id/episode-id.mp3) into a
        Cloudinary public_id (opticast/audio/channel-id/episode-id).
        Cloudinary derives the format from the file itself, so the extension
        is stripped from the public_id.
        """
        without_ext = s3_key.rsplit(".", 1)[0]           # strip .mp3 / .aac
        return f"{self.FOLDER}/{without_ext}"

    def _content_type_to_format(self, content_type: str) -> str:
        mapping = {
            "audio/mpeg": "mp3",
            "audio/aac":  "aac",
            "audio/mp4":  "m4a",
            "audio/ogg":  "ogg",
        }
        return mapping.get(content_type, "mp3")