import { PodcastFeed, YouTubeVideo, Metric, Episode, Payout } from './types';

export const MOCK_FEEDS: PodcastFeed[] = [
  {
    id: '1',
    name: 'The Tech Daily',
    status: 'Synced',
    lastUpdated: '2 hours ago',
    subscribers: 45210,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: '2',
    name: 'Mindful Moments',
    status: 'Synced',
    lastUpdated: 'Yesterday',
    subscribers: 12840,
    color: 'from-amber-400 to-orange-600',
  },
  {
    id: '3',
    name: 'Future Echoes',
    status: 'Syncing...',
    lastUpdated: '3 days ago',
    subscribers: 8422,
    color: 'from-emerald-400 to-teal-700',
  },
];

export const MOCK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'v1',
    title: 'How to Code in 2024',
    thumbnail: 'https://picsum.photos/seed/code/800/450',
    duration: '12:45',
    uploadedAt: '2h ago',
  },
  {
    id: 'v2',
    title: 'My Desk Setup',
    thumbnail: 'https://picsum.photos/seed/desk/800/450',
    duration: '08:20',
    uploadedAt: '1d ago',
  },
  {
    id: 'v3',
    title: 'Vlog: Tokyo Trip',
    thumbnail: 'https://picsum.photos/seed/tokyo/800/450',
    duration: '15:10',
    uploadedAt: '3d ago',
  },
];

export const MOCK_METRICS: Metric[] = [
  { label: 'Total Downloads', value: '124.5k', trend: '12.4%', trendDirection: 'up', progress: 75 },
  { label: 'Unique Listeners', value: '82.1k', trend: '2.1%', trendDirection: 'down', progress: 62 },
  { label: 'Completion Rate', value: '78%', trend: '5.3%', trendDirection: 'up', progress: 78 },
  { label: 'Avg. Listening Time', value: '42m 15s', trend: '1.2%', trendDirection: 'up', progress: 45 },
];

export const MOCK_EPISODES: Episode[] = [
  { id: 'e1', title: '#42: The Future of AI in Creative Arts', duration: '54m 20s', publishDate: 'Oct 24, 2023', downloads: 18245, trend: '+12%' },
  { id: 'e2', title: '#41: Scaling Startups Beyond Series A', duration: '48m 15s', publishDate: 'Oct 17, 2023', downloads: 15102, trend: '+5%' },
  { id: 'e3', title: '#40: Building Sustainable Content Teams', duration: '62m 45s', publishDate: 'Oct 10, 2023', downloads: 14890, trend: '0%' },
  { id: 'e4', title: '#39: Remote Work & Productivity Hacks', duration: '41m 00s', publishDate: 'Oct 03, 2023', downloads: 12450, trend: '-4%' },
];

export const MOCK_PAYOUTS: Payout[] = [
  { id: 'p1', date: 'May 24, 2024', method: 'Bank Transfer (****9201)', amount: '$1,250.00', status: 'Completed', reference: '#TRX-99021-AS' },
  { id: 'p2', date: 'Apr 24, 2024', method: 'Bank Transfer (****9201)', amount: '$980.50', status: 'Completed', reference: '#TRX-88210-AS' },
  { id: 'p3', date: 'Mar 24, 2024', method: 'Bank Transfer (****9201)', amount: '$1,115.00', status: 'Completed', reference: '#TRX-77610-AS' },
  { id: 'p4', date: 'Feb 24, 2024', method: 'PayPal (alex@chen.me)', amount: '$845.00', status: 'Flagged', reference: '#TRX-66120-AS' },
];
