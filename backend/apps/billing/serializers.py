from rest_framework import serializers
from .models import Subscription, InvoiceHistory


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Subscription
        fields = [
            'id', 'plan_tier', 'status', 'stripe_subscription_id',
            'current_period_start', 'current_period_end',
            'cancel_at_period_end', 'created_at',
        ]


class InvoiceHistorySerializer(serializers.ModelSerializer):
    amount_paid_dollars = serializers.SerializerMethodField()

    class Meta:
        model  = InvoiceHistory
        fields = [
            'id', 'stripe_invoice_id', 'amount_paid_cents', 'amount_paid_dollars',
            'currency', 'status', 'invoice_url', 'invoice_pdf',
            'period_start', 'period_end', 'created_at',
        ]

    def get_amount_paid_dollars(self, obj):
        return round(obj.amount_paid_cents / 100, 2)