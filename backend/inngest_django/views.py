import inngest
import inngest.django

from .client import inngest_client
from .functions import (
    process_new_video_notification,
    extract_audio_workflow,
    schedule_channel_cleanup_workflow,
    send_weekly_digest_workflow,
    log_episode_download_workflow,
)

inngest_view_path = inngest.django.serve(inngest_client, [
    process_new_video_notification,
    extract_audio_workflow,
    schedule_channel_cleanup_workflow,
    send_weekly_digest_workflow,
    log_episode_download_workflow,
])