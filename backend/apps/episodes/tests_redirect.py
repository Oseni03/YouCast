from django.test import TestCase, RequestFactory
from apps.episodes.models import Episode, ProcessingStatus
from apps.channels.models import Channel
from apps.accounts.models import Creator
from apps.episodes.views import EpisodeAudioRedirectView
import uuid

class EpisodeRedirectTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.creator = Creator.objects.create(email='test@example.com', display_name='Test')
        self.channel = Channel.objects.create(
            creator=self.creator,
            youtube_channel_id='UC123',
            channel_title='Test Channel',
            rss_slug='test-slug'
        )
        self.episode = Episode.objects.create(
            channel=self.channel,
            youtube_video_id='vid123',
            youtube_url='https://youtube.com/watch?v=vid123',
            title='Test Episode',
            audio_url='https://s3.amazonaws.com/test-audio.mp3',
            processing_status=ProcessingStatus.COMPLETE,
            pub_date='2023-01-01T00:00:00Z'
        )

    def test_redirect_to_audio_url(self):
        view = EpisodeAudioRedirectView.as_view()
        request = self.factory.get(f'/audio/{self.episode.id}/')
        response = view(request, episode_id=self.episode.id)
        
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response['Location'], self.episode.audio_url)
