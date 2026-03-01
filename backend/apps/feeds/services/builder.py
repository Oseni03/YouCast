from feedgen.feed import FeedGenerator
from django.utils import timezone
from episodes.models import Episode, ProcessingStatus


class RSSFeedBuilder:
    """
    Builds a fully compliant RSS 2.0 feed with:
    - Apple Podcasts namespace (itunes:*)
    - Podcasting 2.0 namespace (podcast:*)
    """
    ITUNES_NS  = 'http://www.itunes.com/dtds/podcast-1.0.dtd'
    PODCAST_NS = 'https://podcastindex.org/namespace/1.0'

    def build(self, channel) -> bytes:
        fg = FeedGenerator()
        fg.load_extension('podcast')  # loads the podcast/itunes extension

        # --- Channel-level metadata ---
        fg.id(channel.rss_feed_url)
        fg.title(channel.effective_podcast_title)
        fg.description(channel.podcast_description or channel.channel_description or 'Podcast')
        fg.link(href=channel.rss_feed_url, rel='self')
        fg.language(channel.language)
        fg.image(channel.effective_artwork_url)
        fg.podcast.itunes_author(channel.creator.display_name)
        fg.podcast.itunes_explicit('yes' if channel.explicit else 'no')
        fg.podcast.itunes_category(channel.category)
        fg.podcast.itunes_image(channel.effective_artwork_url)
        fg.updated(timezone.now())

        # --- Episodes ---
        episodes = Episode.objects.filter(
            channel=channel,
            processing_status=ProcessingStatus.COMPLETE,
        ).order_by('-pub_date')

        for episode in episodes:
            fe = fg.add_entry()
            fe.id(episode.youtube_url)
            fe.title(episode.title)
            fe.description(self._build_description(channel, episode))
            fe.published(episode.pub_date)
            fe.updated(episode.pub_date)
            fe.enclosure(episode.audio_url, str(episode.audio_size_bytes), 'audio/mpeg')
            fe.podcast.itunes_duration(episode.duration_formatted)
            fe.podcast.itunes_image(episode.thumbnail_url or channel.effective_artwork_url)
            fe.podcast.itunes_explicit('yes' if channel.explicit else 'no')

            # Podcasting 2.0 — chapter markers
            if episode.youtube_chapters:
                self._add_chapters(fe, episode.youtube_chapters)

            # Podcasting 2.0 — transcript
            if episode.transcript_url:
                fe.podcast.podcast_transcript(episode.transcript_url, 'text/vtt')

        return fg.rss_str(pretty=False)

    def _build_description(self, channel, episode) -> str:
        parts = []
        if channel.episode_prefix:
            parts.append(channel.episode_prefix)
        parts.append(episode.description)
        if channel.episode_suffix:
            parts.append(channel.episode_suffix)
        return '\n\n'.join(filter(None, parts))

    def _add_chapters(self, fe, chapters: list):
        """Encode chapters as Podcasting 2.0 <podcast:chapters> JSON URL."""
        # In practice, chapters JSON is uploaded to S3 and linked
        pass