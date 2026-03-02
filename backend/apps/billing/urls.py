from django.urls import path
from . import views

urlpatterns = [
    path('checkout/',     views.CreateCheckoutSessionView.as_view(), name='billing_checkout'),
    path('portal/',       views.CreateCustomerPortalView.as_view(),  name='billing_portal'),
    path('subscription/', views.SubscriptionStatusView.as_view(),    name='billing_subscription'),
    path('orders/',       views.OrderHistoryView.as_view(),          name='billing_orders'),
    path('webhook/',      views.PolarWebhookView.as_view(),          name='billing_webhook'),
]