from django.urls import path
from . import views

urlpatterns = [
    path('',                        views.ChannelListCreateView.as_view(),   name='channel_list_create'),
    path('<uuid:channel_id>/',      views.ChannelDetailView.as_view(),       name='channel_detail'),
    path('<uuid:channel_id>/refresh/', views.ChannelRefreshMetadataView.as_view(), name='channel_refresh'),

    # WebSub endpoint — must be public, not behind auth
    path('websub/callback/',        views.WebSubCallbackView.as_view(),      name='websub_callback'),

    path('<uuid:channel_id>/eligible-videos/', views.EligibleVideoListView.as_view(), name='eligible_videos'),
]

# Mounted at: /api/channels/