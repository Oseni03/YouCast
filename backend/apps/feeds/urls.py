from django.urls import path
from . import views

# Public RSS feed routes — no /api/ prefix, mounted at root
rss_urlpatterns = [
    path('feed/<slug:slug>/', views.RSSFeedView.as_view(), name='rss_feed'),
]

# Private API routes
api_urlpatterns = [
    path('directories/',             views.DirectoryListView.as_view(),       name='directory_list'),
    path('directories/<uuid:directory_id>/', views.DirectoryDetailView.as_view(), name='directory_detail'),
    path('preview/<uuid:channel_id>/',       views.FeedPreviewView.as_view(),      name='feed_preview'),
]

# rss_urlpatterns mounted at / in root urls.py
# api_urlpatterns mounted at /api/feeds/ in root urls.py