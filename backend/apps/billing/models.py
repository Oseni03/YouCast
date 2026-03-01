from django.db import models
import uuid


class Subscription(models.Model):
    """
    Mirrors the Stripe subscription state for a creator.
    Source of truth is always Stripe — this is a local cache for fast queries.
    """
    id                      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator                 = models.OneToOneField(
        'accounts.Creator', on_delete=models.CASCADE, related_name='subscription'
    )
    stripe_subscription_id  = models.CharField(max_length=255, unique=True)
    stripe_price_id         = models.CharField(max_length=255)
    plan_tier               = models.CharField(max_length=20)
    status                  = models.CharField(max_length=50)  # active | past_due | canceled | trialing
    current_period_start    = models.DateTimeField()
    current_period_end      = models.DateTimeField()
    cancel_at_period_end    = models.BooleanField(default=False)
    created_at              = models.DateTimeField(auto_now_add=True)
    updated_at              = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions'


class InvoiceHistory(models.Model):
    """Stores key invoice data for the billing history UI."""
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator             = models.ForeignKey(
        'accounts.Creator', on_delete=models.CASCADE, related_name='invoices'
    )
    stripe_invoice_id   = models.CharField(max_length=255, unique=True)
    amount_paid_cents   = models.IntegerField()
    currency            = models.CharField(max_length=10, default='usd')
    status              = models.CharField(max_length=50)  # paid | open | void | uncollectible
    invoice_url         = models.URLField(blank=True)   # Stripe hosted invoice URL
    invoice_pdf         = models.URLField(blank=True)
    period_start        = models.DateTimeField()
    period_end          = models.DateTimeField()
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoice_history'
        ordering = ['-created_at']