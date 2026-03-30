from django.urls import path
from . import views

urlpatterns = [
    # Cross-channel episode list (for dashboard overview)
    path('',                          views.EpisodeListView.as_view(),        name='episode_list'),
    path('<uuid:episode_id>/',        views.EpisodeDetailView.as_view(),      name='episode_detail'),
    path('<uuid:episode_id>/retry/',  views.EpisodeRetryView.as_view(),       name='episode_retry'),
    path('audio/<uuid:episode_id>/',  views.EpisodeAudioRedirectView.as_view(), name='episode_audio_redirect'),
]

# Mounted at: /api/episodes/
# Channel-scoped route: /api/channels/<id>/episodes/ → ChannelEpisodeListView (in channels/urls.py)