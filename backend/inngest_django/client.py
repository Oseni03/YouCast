import logging
import inngest

inngest_client = inngest.Inngest(
    app_id="opticast-backend",
    logger=logging.getLogger("inngest"),
)