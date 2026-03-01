from django.urls import path
from . import views

urlpatterns = [
    path('checkout/',     views.CreateCheckoutSessionView.as_view(), name='billing_checkout'),
    path('portal/',       views.CreatePortalSessionView.as_view(),   name='billing_portal'),
    path('subscription/', views.SubscriptionStatusView.as_view(),    name='billing_subscription'),
    path('invoices/',     views.InvoiceHistoryView.as_view(),        name='billing_invoices'),
    path('webhook/',      views.StripeWebhookView.as_view(),         name='billing_webhook'),
]