from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncWeek
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta, date

from channels.models import Channel
from episodes.models import Episode
from .models import AnalyticsEvent


class OverviewStatsView(APIView):
    """
    GET /api/analytics/overview/
    Returns aggregated stats for the creator's dashboard header:
    total episodes, total downloads, active directories.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        channels = Channel.objects.filter(creator=request.user)
        episodes = Episode.objects.filter(channel__in=channels)

        total_downloads = episodes.aggregate(
            total=Sum('download_count')
        )['total'] or 0

        return Response({
            'total_channels': channels.count(),
            'total_episodes': episodes.count(),
            'total_downloads': total_downloads,
        })


class DownloadTimeseriesView(APIView):
    """
    GET /api/analytics/timeseries/?channel=<id>&days=30
    Returns daily download counts for charting.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        creator_channels = Channel.objects.filter(creator=request.user)
        channel_id       = request.query_params.get('channel')
        days             = int(request.query_params.get('days', 30))
        since            = date.today() - timedelta(days=days)

        events = AnalyticsEvent.objects.filter(
            channel__in=creator_channels,
            timestamp__date__gte=since,
            is_bot=False,
        )

        if channel_id:
            events = events.filter(channel_id=channel_id)

        timeseries = (
            events
            .annotate(day=TruncDate('timestamp'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )

        return Response(list(timeseries))


class GeographicBreakdownView(APIView):
    """GET /api/analytics/geo/?channel=<id> — downloads by country."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        creator_channels = Channel.objects.filter(creator=request.user)
        channel_id       = request.query_params.get('channel')

        events = AnalyticsEvent.objects.filter(
            channel__in=creator_channels, is_bot=False
        )
        if channel_id:
            events = events.filter(channel_id=channel_id)

        breakdown = (
            events
            .values('country_code')
            .annotate(count=Count('id'))
            .order_by('-count')[:20]
        )

        return Response(list(breakdown))


class PodcastAppBreakdownView(APIView):
    """GET /api/analytics/apps/?channel=<id> — downloads by podcast app."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        creator_channels = Channel.objects.filter(creator=request.user)
        channel_id       = request.query_params.get('channel')

        events = AnalyticsEvent.objects.filter(
            channel__in=creator_channels, is_bot=False
        )
        if channel_id:
            events = events.filter(channel_id=channel_id)

        breakdown = (
            events
            .values('podcast_app')
            .annotate(count=Count('id'))
            .order_by('-count')[:15]
        )

        return Response(list(breakdown))


class EpisodeStatsView(APIView):
    """GET /api/analytics/episodes/?channel=<id> — per-episode download stats."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        creator_channels = Channel.objects.filter(creator=request.user)
        channel_id       = request.query_params.get('channel')

        episodes = Episode.objects.filter(channel__in=creator_channels)
        if channel_id:
            episodes = episodes.filter(channel_id=channel_id)

        data = episodes.values(
            'id', 'title', 'pub_date', 'download_count'
        ).order_by('-download_count')[:50]

        return Response(list(data))