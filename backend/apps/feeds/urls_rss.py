from django.urls import path
from .views import RSSFeedView

urlpatterns = [
    path("feed/<slug:slug>/", RSSFeedView.as_view(), name="rss_feed"),
]