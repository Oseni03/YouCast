import subprocess
import os
import tempfile
from pathlib import Path


class AudioExtractor:
    """
    Wraps yt-dlp + FFmpeg to download and normalize audio for a YouTube video.
    All calls are synchronous — intended to be run inside a Celery worker.
    """
    DEFAULT_FORMAT = 'mp3'
    TARGET_LUFS    = -16  # IAB podcast standard

    def extract(self, youtube_url: str, output_format: str = 'mp3') -> dict:
        """
        Downloads audio from youtube_url, normalizes loudness, returns file info.
        Returns: { 'filepath': str, 'duration_seconds': int, 'size_bytes': int }
        """
        with tempfile.TemporaryDirectory() as tmpdir:
            raw_path    = os.path.join(tmpdir, 'raw.%(ext)s')
            output_path = os.path.join(tmpdir, f'episode.{output_format}')

            # Step 1: Download best audio stream via yt-dlp
            yt_dlp_cmd = [
                'yt-dlp',
                '--format', 'bestaudio',
                '--output', raw_path,
                '--no-playlist',
                '--quiet',
                youtube_url,
            ]
            subprocess.run(yt_dlp_cmd, check=True, timeout=600)

            # Find the downloaded file (extension is dynamic)
            raw_files = list(Path(tmpdir).glob('raw.*'))
            if not raw_files:
                raise FileNotFoundError('yt-dlp did not produce an output file')
            raw_file = str(raw_files[0])

            # Step 2: Normalize to -16 LUFS using FFmpeg two-pass loudnorm
            self._normalize(raw_file, output_path, output_format)

            size_bytes = os.path.getsize(output_path)
            duration   = self._get_duration(output_path)

            return {
                'filepath':         output_path,
                'duration_seconds': duration,
                'size_bytes':       size_bytes,
            }

    def _normalize(self, input_path: str, output_path: str, fmt: str):
        codec = 'libmp3lame' if fmt == 'mp3' else 'aac'
        bitrate = '320k' if fmt == 'mp3' else '256k'

        subprocess.run([
            'ffmpeg', '-i', input_path,
            '-af', f'loudnorm=I={self.TARGET_LUFS}:TP=-1.5:LRA=11',
            '-ar', '44100',
            '-ac', '2',
            '-c:a', codec,
            '-b:a', bitrate,
            output_path,
            '-y',  # overwrite
        ], check=True, timeout=600, capture_output=True)

    def _get_duration(self, filepath: str) -> int:
        result = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
             '-of', 'default=noprint_wrappers=1:nokey=1', filepath],
            capture_output=True, text=True, check=True,
        )
        return int(float(result.stdout.strip()))