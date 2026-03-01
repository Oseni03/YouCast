from django.urls import path
from . import views

urlpatterns = [
    path('overview/',    views.OverviewStatsView.as_view(),        name='analytics_overview'),
    path('timeseries/',  views.DownloadTimeseriesView.as_view(),   name='analytics_timeseries'),
    path('geo/',         views.GeographicBreakdownView.as_view(),  name='analytics_geo'),
    path('apps/',        views.PodcastAppBreakdownView.as_view(),  name='analytics_apps'),
    path('episodes/',    views.EpisodeStatsView.as_view(),         name='analytics_episodes'),
]