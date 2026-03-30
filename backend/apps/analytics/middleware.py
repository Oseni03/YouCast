import hashlib
from django.utils.deprecation import MiddlewareMixin
import inngest
from django_inngest.client import inngest_client
# from .tasks import log_analytics_event


class RSSAnalyticsMiddleware(MiddlewareMixin):
    """
    Intercepts requests to /feed/<slug>/ and asynchronously logs an analytics event.
    Runs AFTER the response is generated to avoid adding latency to feed delivery.
    """

    def process_response(self, request, response):
        if not request.path.startswith('/feed/'):
            return response

        if response.status_code != 200:
            return response

        slug = request.path.split('/feed/')[-1].rstrip('/')

        # Hash the IP immediately — never log the raw value
        raw_ip  = self._get_client_ip(request)
        ip_hash = hashlib.sha256(raw_ip.encode()).hexdigest()

        inngest_client.send_sync(
            inngest.Event(
                name="analytics/event.logged",
                data={
                    "slug": slug,
                    "ip_hash": ip_hash,
                    "user_agent": request.META.get('HTTP_USER_AGENT', ''),
                    "bytes_served": len(response.content),
                }
            )
        )

        return response

    def _get_client_ip(self, request):
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')