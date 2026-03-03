import logging
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from polar_sdk.webhooks import validate_event, WebhookVerificationError

# from .models import Subscription, OrderHistory          # (in real file)
# from .serializers import SubscriptionSerializer, ...   # (in real file)
# from .services import PolarService                      # (in real file)

logger = logging.getLogger(__name__)


class CreateCheckoutSessionView(APIView):
    """
    POST /api/billing/checkout/
    Creates a Polar checkout session and returns the redirect URL.

    Body: { "product_price_id": "polar_price_..." }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_price_id = request.data.get('product_price_id')
        if not product_price_id:
            return Response(
                {'error': 'product_price_id is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            svc          = PolarService()
            checkout_url = svc.create_checkout_session(
                creator          = request.user,
                product_price_id = product_price_id,
                success_url      = f'{settings.FRONTEND_URL}/billing?checkout=success',
            )
        except Exception as e:
            logger.error('Polar checkout creation failed: %s', str(e))
            return Response(
                {'error': 'Failed to create checkout session. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({'checkout_url': checkout_url})


class CreateCustomerPortalView(APIView):
    """
    POST /api/billing/portal/
    Creates a Polar customer session and returns the hosted portal URL.
    Redirect the creator here to manage their plan, payment methods, and orders.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            svc        = PolarService()
            portal_url = svc.create_customer_session(request.user)
        except Exception as e:
            logger.error('Polar customer session creation failed: %s', str(e))
            return Response(
                {'error': 'Failed to open billing portal. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({'portal_url': portal_url})


class SubscriptionStatusView(APIView):
    """GET /api/billing/subscription/ — current subscription from local cache."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            subscription = request.user.subscription
            return Response(SubscriptionSerializer(subscription).data)
        except Subscription.DoesNotExist:
            return Response({'plan_tier': 'free', 'status': 'none'})


class OrderHistoryView(APIView):
    """GET /api/billing/orders/ — list past orders from local cache."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = OrderHistory.objects.filter(creator=request.user)
        return Response(OrderHistorySerializer(orders, many=True).data)


@method_decorator(csrf_exempt, name='dispatch')
class PolarWebhookView(APIView):
    """
    POST /api/billing/webhook/
    Receives and processes Polar webhook events.

    Polar signs every delivery with HMAC-SHA256. The SDK's validate_event()
    raises WebhookVerificationError if the signature doesn't match — we return
    403 immediately without touching the payload.

    Events handled:
      subscription.created  → upsert Subscription, activate plan tier
      subscription.updated  → sync plan/status changes (upgrades, renewals, past_due)
      subscription.revoked  → downgrade creator to free tier
      order.created         → record payment in OrderHistory
      checkout.updated      → link Polar customer ID to Creator on first checkout
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            event = validate_event(
                payload = request.body,
                headers = request.headers,
                secret  = settings.POLAR_WEBHOOK_SECRET,
            )
        except WebhookVerificationError:
            logger.warning('Polar webhook: signature verification failed')
            return Response(
                {'error': 'Invalid webhook signature'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            self._dispatch(event)
        except Exception:
            logger.exception('Error processing Polar webhook: %s', event.type)

        return Response({'received': True}, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # Dispatcher
    # ------------------------------------------------------------------

    def _dispatch(self, event):
        handlers = {
            'subscription.created': self._handle_subscription_created,
            'subscription.updated': self._handle_subscription_updated,
            'subscription.revoked': self._handle_subscription_revoked,
            'order.created':        self._handle_order_created,
            'checkout.updated':     self._handle_checkout_updated,
        }
        handler = handlers.get(event.type)
        if handler:
            logger.info('Polar webhook received: %s', event.type)
            handler(event.data)
        else:
            logger.debug('Unhandled Polar webhook: %s', event.type)

    # ------------------------------------------------------------------
    # Subscription handlers
    # ------------------------------------------------------------------

    def _handle_subscription_created(self, data):
        creator = self._get_creator_by_polar_customer(data.customer_id)
        if not creator:
            logger.warning('subscription.created: no creator for customer %s', data.customer_id)
            return
        self._upsert_subscription(creator, data)

    def _handle_subscription_updated(self, data):
        """
        Handles plan upgrades, downgrades, renewals, and payment failures.
        status field will be 'active', 'past_due', 'canceled', etc.
        """
        creator = self._get_creator_by_polar_customer(data.customer_id)
        if not creator:
            logger.warning('subscription.updated: no creator for customer %s', data.customer_id)
            return
        self._upsert_subscription(creator, data)

    def _handle_subscription_revoked(self, data):
        """
        Fired when access ends (after cancel_at_period_end period expires).
        Downgrades the creator to the free tier.
        """
        from apps.accounts.models import PlanTier

        creator = self._get_creator_by_polar_customer(data.customer_id)
        if not creator:
            return

        Subscription.objects.filter(
            polar_subscription_id=data.id
        ).update(status='revoked', cancel_at_period_end=False)

        creator.plan_tier = PlanTier.FREE
        creator.save(update_fields=['plan_tier'])
        logger.info('Creator %s downgraded to free (subscription revoked)', creator.email)

    # ------------------------------------------------------------------
    # Order handler
    # ------------------------------------------------------------------

    def _handle_order_created(self, data):
        """
        Fired on every successful payment — both initial checkout and renewals.
        `data.amount` is in the smallest currency unit (cents for USD).
        """
        creator = self._get_creator_by_polar_customer(data.customer_id)
        if not creator:
            logger.warning('order.created: no creator for customer %s', data.customer_id)
            return

        OrderHistory.objects.update_or_create(
            polar_order_id = data.id,
            defaults = {
                'creator':           creator,
                'polar_product_id':  data.product_id,
                'polar_customer_id': data.customer_id,
                'amount_cents':      data.amount,
                'tax_amount_cents':  getattr(data, 'tax_amount', 0) or 0,
                'currency':          data.currency,
                'status':            data.status,
                'billing_reason':    getattr(data, 'billing_reason', '') or '',
                'invoice_url':       getattr(data, 'invoice_url', '') or '',
            }
        )
        logger.info('Order recorded for %s: %d %s', creator.email, data.amount, data.currency)

    # ------------------------------------------------------------------
    # Checkout handler
    # ------------------------------------------------------------------

    def _handle_checkout_updated(self, data):
        """
        On completed checkout, ensure the Polar customer ID is stored on
        the Creator so all future webhook lookups resolve immediately.
        The subscription.created event handles plan provisioning.
        """
        if data.status != 'succeeded':
            return

        creator_id = (data.metadata or {}).get('creator_id')
        if not creator_id:
            return

        from apps.accounts.models import Creator
        try:
            creator = Creator.objects.get(id=creator_id)
        except Creator.DoesNotExist:
            return

        if data.customer_id and not creator.polar_customer_id:
            creator.polar_customer_id = data.customer_id
            creator.save(update_fields=['polar_customer_id'])

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _upsert_subscription(self, creator, data):
        from apps.accounts.models import PlanTier
        from django.utils.dateparse import parse_datetime

        plan_tier    = self._resolve_plan_tier(data.product_id)
        period_start = getattr(data, 'current_period_start', None)
        period_end   = getattr(data, 'current_period_end', None)

        if isinstance(period_start, str):
            period_start = parse_datetime(period_start)
        if isinstance(period_end, str):
            period_end = parse_datetime(period_end)

        Subscription.objects.update_or_create(
            polar_subscription_id = data.id,
            defaults = {
                'creator':              creator,
                'polar_customer_id':    data.customer_id,
                'polar_product_id':     data.product_id,
                'polar_price_id':       getattr(data, 'price_id', '') or '',
                'plan_tier':            plan_tier,
                'status':               data.status,
                'current_period_start': period_start,
                'current_period_end':   period_end,
                'cancel_at_period_end': getattr(data, 'cancel_at_period_end', False),
                'canceled_at':          getattr(data, 'canceled_at', None),
            }
        )

        creator.plan_tier = plan_tier
        creator.save(update_fields=['plan_tier'])
        logger.info('Subscription upserted for %s → %s (%s)', creator.email, plan_tier, data.status)

    def _get_creator_by_polar_customer(self, polar_customer_id: str):
        """
        Look up a Creator by their Polar customer ID.
        Falls back to scanning the Subscription table on first-ever webhook
        delivery before the Creator row has been updated.
        """
        from apps.accounts.models import Creator

        try:
            return Creator.objects.get(polar_customer_id=polar_customer_id)
        except Creator.DoesNotExist:
            sub = Subscription.objects.filter(
                polar_customer_id=polar_customer_id
            ).select_related('creator').first()
            return sub.creator if sub else None

    def _resolve_plan_tier(self, polar_product_id: str) -> str:
        from apps.accounts.models import PlanTier

        mapping = {
            settings.POLAR_PRODUCT_STARTER: PlanTier.STARTER,
            settings.POLAR_PRODUCT_PRO:     PlanTier.PRO,
            settings.POLAR_PRODUCT_AGENCY:  PlanTier.AGENCY,
        }
        return mapping.get(polar_product_id, PlanTier.FREE)
