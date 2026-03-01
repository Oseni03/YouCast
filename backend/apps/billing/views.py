import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .models import Subscription, InvoiceHistory
from .serializers import SubscriptionSerializer, InvoiceHistorySerializer
from .services import StripeService

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(APIView):
    """
    POST /api/billing/checkout/
    Creates a Stripe Checkout session and returns the redirect URL.
    The frontend redirects the user to Stripe's hosted checkout page.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        price_id = request.data.get('price_id')
        if not price_id:
            return Response({'error': 'price_id is required'}, status=400)

        creator = request.user
        svc     = StripeService(creator)
        session = svc.create_checkout_session(
            price_id    = price_id,
            success_url = f'{settings.FRONTEND_URL}/billing?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url  = f'{settings.FRONTEND_URL}/billing',
        )

        return Response({'checkout_url': session.url})


class CreatePortalSessionView(APIView):
    """
    POST /api/billing/portal/
    Creates a Stripe Customer Portal session for managing subscriptions,
    updating payment methods, and viewing invoices.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        creator = request.user
        if not creator.stripe_customer_id:
            return Response({'error': 'No billing account found.'}, status=400)

        session = stripe.billing_portal.Session.create(
            customer   = creator.stripe_customer_id,
            return_url = f'{settings.FRONTEND_URL}/billing',
        )

        return Response({'portal_url': session.url})


class SubscriptionStatusView(APIView):
    """GET /api/billing/subscription/ — current subscription state."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            subscription = request.user.subscription
            return Response(SubscriptionSerializer(subscription).data)
        except Subscription.DoesNotExist:
            return Response({'plan_tier': 'free', 'status': 'none'})


class InvoiceHistoryView(APIView):
    """GET /api/billing/invoices/ — list past invoices."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invoices = InvoiceHistory.objects.filter(creator=request.user)
        return Response(InvoiceHistorySerializer(invoices, many=True).data)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    POST /api/billing/webhook/
    Receives Stripe webhook events. This is how we learn about:
    - Successful payments (subscription activated)
    - Failed payments (subscription past_due)
    - Cancellations
    Stripe signature is verified before processing anything.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        payload   = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        handler = StripeWebhookHandler()
        handler.handle(event)

        return Response({'status': 'received'})


class StripeWebhookHandler:
    def handle(self, event):
        handlers = {
            'checkout.session.completed':       self.handle_checkout_completed,
            'customer.subscription.updated':    self.handle_subscription_updated,
            'customer.subscription.deleted':    self.handle_subscription_deleted,
            'invoice.payment_succeeded':        self.handle_invoice_paid,
            'invoice.payment_failed':           self.handle_invoice_failed,
        }
        handler = handlers.get(event['type'])
        if handler:
            handler(event['data']['object'])

    def handle_checkout_completed(self, session):
        from accounts.models import Creator
        creator = Creator.objects.filter(
            stripe_customer_id=session['customer']
        ).first()
        if not creator:
            creator = Creator.objects.get(email=session['customer_details']['email'])
            creator.stripe_customer_id = session['customer']
            creator.save(update_fields=['stripe_customer_id'])

        sub_data = stripe.Subscription.retrieve(session['subscription'])
        self._upsert_subscription(creator, sub_data)

    def handle_subscription_updated(self, subscription):
        from accounts.models import Creator
        creator = Creator.objects.filter(
            stripe_customer_id=subscription['customer']
        ).first()
        if creator:
            self._upsert_subscription(creator, subscription)

    def handle_subscription_deleted(self, subscription):
        from accounts.models import Creator, PlanTier
        creator = Creator.objects.filter(
            stripe_customer_id=subscription['customer']
        ).first()
        if creator:
            Subscription.objects.filter(creator=creator).update(status='canceled')
            creator.plan_tier = PlanTier.FREE
            creator.save(update_fields=['plan_tier'])

    def handle_invoice_paid(self, invoice):
        from accounts.models import Creator
        from datetime import datetime, timezone as tz
        creator = Creator.objects.filter(
            stripe_customer_id=invoice['customer']
        ).first()
        if creator:
            InvoiceHistory.objects.update_or_create(
                stripe_invoice_id = invoice['id'],
                defaults = {
                    'creator':          creator,
                    'amount_paid_cents': invoice['amount_paid'],
                    'currency':         invoice['currency'],
                    'status':           invoice['status'],
                    'invoice_url':      invoice.get('hosted_invoice_url', ''),
                    'invoice_pdf':      invoice.get('invoice_pdf', ''),
                    'period_start':     datetime.fromtimestamp(invoice['period_start'], tz=tz.utc),
                    'period_end':       datetime.fromtimestamp(invoice['period_end'], tz=tz.utc),
                }
            )

    def handle_invoice_failed(self, invoice):
        Subscription.objects.filter(
            stripe_subscription_id=invoice.get('subscription')
        ).update(status='past_due')

    def _upsert_subscription(self, creator, stripe_sub):
        from datetime import datetime, timezone as tz
        from accounts.models import PlanTier

        PRICE_TO_PLAN = {
            settings.STRIPE_PRICE_STARTER: PlanTier.STARTER,
            settings.STRIPE_PRICE_PRO:     PlanTier.PRO,
            settings.STRIPE_PRICE_AGENCY:  PlanTier.AGENCY,
        }
        price_id  = stripe_sub['items']['data'][0]['price']['id']
        plan_tier = PRICE_TO_PLAN.get(price_id, PlanTier.FREE)

        Subscription.objects.update_or_create(
            creator = creator,
            defaults = {
                'stripe_subscription_id': stripe_sub['id'],
                'stripe_price_id':        price_id,
                'plan_tier':              plan_tier,
                'status':                 stripe_sub['status'],
                'current_period_start':   datetime.fromtimestamp(stripe_sub['current_period_start'], tz=tz.utc),
                'current_period_end':     datetime.fromtimestamp(stripe_sub['current_period_end'], tz=tz.utc),
                'cancel_at_period_end':   stripe_sub['cancel_at_period_end'],
            }
        )

        creator.plan_tier = plan_tier
        creator.save(update_fields=['plan_tier'])