import logging
import inngest

from config import settings

inngest_client = inngest.Inngest(
    app_id="opticast-backend",
    logger=logging.getLogger("inngest"),
    event_key=settings.INNGEST_EVENT_KEY,
    signing_key=settings.INNGEST_SIGNING_KEY,
)