from rest_framework import serializers
# from .models import Subscription, OrderHistory  # (imported above in real files)


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Subscription
        fields = [
            'id', 'plan_tier', 'status',
            'polar_subscription_id', 'polar_product_id',
            'current_period_start', 'current_period_end',
            'cancel_at_period_end', 'canceled_at', 'created_at',
        ]


class OrderHistorySerializer(serializers.ModelSerializer):
    amount_dollars = serializers.SerializerMethodField()

    class Meta:
        model  = OrderHistory
        fields = [
            'id', 'polar_order_id', 'polar_product_id',
            'amount_cents', 'amount_dollars', 'tax_amount_cents',
            'currency', 'status', 'billing_reason',
            'invoice_url', 'created_at',
        ]

    def get_amount_dollars(self, obj):
        return round(obj.amount_cents / 100, 2)
