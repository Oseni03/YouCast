import logging
from polar_sdk import Polar
from polar_sdk.models import CheckoutCreate, CustomerSessionCreate
from django.conf import settings

logger = logging.getLogger(__name__)


def get_polar_client() -> Polar:
    """
    Returns a configured Polar SDK client.
    Uses the sandbox server when DEBUG=True, production otherwise.
    """
    return Polar(
        access_token = settings.POLAR_ACCESS_TOKEN,
        server       = 'sandbox' if settings.DEBUG else 'production',
    )


class PolarService:
    """
    Thin wrapper around the Polar SDK for all billing operations.
    All methods are synchronous — intended for use in Django views and Celery tasks.
    """

    def __init__(self):
        self.client = get_polar_client()

    # ------------------------------------------------------------------
    # Customers
    # ------------------------------------------------------------------

    def get_or_create_customer(self, creator) -> str:
        """
        Returns the Polar customer ID for a creator, creating one if needed.
        Uses the creator's UUID as external_id so lookups are idempotent.
        """
        if creator.polar_customer_id:
            return creator.polar_customer_id

        try:
            customer = self.client.customers.get_external(
                external_id=str(creator.id)
            )
            polar_customer_id = customer.id
        except Exception:
            customer = self.client.customers.create(
                request={
                    'email':       creator.email,
                    'name':        creator.display_name or creator.email,
                    'external_id': str(creator.id),
                }
            )
            polar_customer_id = customer.id

        creator.polar_customer_id = polar_customer_id
        creator.save(update_fields=['polar_customer_id'])
        return polar_customer_id

    # ------------------------------------------------------------------
    # Checkout
    # ------------------------------------------------------------------

    def create_checkout_session(self, creator, product_price_id: str,
                                success_url: str, cancel_url: str = None) -> str:
        """
        Creates a Polar checkout session and returns the checkout URL.
        Creator UUID is embedded in metadata so webhooks can look them up.
        """
        polar_customer_id = self.get_or_create_customer(creator)

        checkout = self.client.checkouts.create(
            request=CheckoutCreate(
                product_price_id = product_price_id,
                customer_id      = polar_customer_id,
                success_url      = success_url,
                metadata         = {'creator_id': str(creator.id)},
            )
        )
        return checkout.url

    # ------------------------------------------------------------------
    # Customer portal
    # ------------------------------------------------------------------

    def create_customer_session(self, creator) -> str:
        """
        Creates a Polar customer session and returns the hosted portal URL.
        This lets the creator manage their subscription, payment methods,
        and orders without us building a custom UI.
        """
        polar_customer_id = self.get_or_create_customer(creator)

        session = self.client.customer_sessions.create(
            request=CustomerSessionCreate(
                customer_id=polar_customer_id,
            )
        )
        # customer_portal_url is the fully-formed redirect URL
        return session.customer_portal_url

    # ------------------------------------------------------------------
    # Subscriptions
    # ------------------------------------------------------------------

    def get_subscription(self, polar_subscription_id: str):
        return self.client.subscriptions.get(id=polar_subscription_id)

    def cancel_subscription(self, polar_subscription_id: str):
        """Cancel at period end — the subscription stays active until period_end."""
        return self.client.subscriptions.revoke(id=polar_subscription_id)

    # ------------------------------------------------------------------
    # Orders
    # ------------------------------------------------------------------

    def list_orders(self, polar_customer_id: str) -> list:
        """Fetches all pages of orders for a customer from the Polar API."""
        result = self.client.orders.list(customer_id=polar_customer_id)
        orders = []
        while result is not None:
            orders.extend(result.items or [])
            result = result.next()
        return orders
