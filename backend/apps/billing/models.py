from django.db import models
import uuid


class Subscription(models.Model):
    """
    Local mirror of a Polar subscription.
    Source of truth is always Polar — this is a cache for fast plan-tier queries
    without hitting the Polar API on every request.
    """
    id                      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator                 = models.OneToOneField(
        'accounts.Creator', on_delete=models.CASCADE, related_name='subscription'
    )

    # Polar identifiers
    polar_subscription_id   = models.CharField(max_length=255, unique=True)
    polar_customer_id       = models.CharField(max_length=255)
    polar_product_id        = models.CharField(max_length=255)
    polar_price_id          = models.CharField(max_length=255)

    plan_tier               = models.CharField(max_length=20)

    # Mirrors Polar's subscription status values:
    # active | canceled | incomplete | incomplete_expired | past_due | trialing | unpaid | revoked
    status                  = models.CharField(max_length=50)

    current_period_start    = models.DateTimeField()
    current_period_end      = models.DateTimeField()
    cancel_at_period_end    = models.BooleanField(default=False)
    canceled_at             = models.DateTimeField(null=True, blank=True)

    created_at              = models.DateTimeField(auto_now_add=True)
    updated_at              = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions'

    def __str__(self):
        return f'{self.creator.email} — {self.plan_tier} ({self.status})'


class OrderHistory(models.Model):
    """
    Polar uses 'orders' rather than invoices.
    Stores key order data for the billing history UI.
    """
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator             = models.ForeignKey(
        'accounts.Creator', on_delete=models.CASCADE, related_name='orders'
    )

    polar_order_id      = models.CharField(max_length=255, unique=True)
    polar_product_id    = models.CharField(max_length=255)
    polar_customer_id   = models.CharField(max_length=255)

    amount_cents        = models.IntegerField()
    tax_amount_cents    = models.IntegerField(default=0)
    currency            = models.CharField(max_length=10, default='usd')

    # paid | refunded | partially_refunded
    status              = models.CharField(max_length=50)

    billing_reason      = models.CharField(max_length=100, blank=True)
    invoice_url         = models.URLField(blank=True)

    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'order_history'
        ordering = ['-created_at']

