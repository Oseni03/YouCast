export interface PodcastFeed {
  id: string;
  name: string;
  status: 'Synced' | 'Syncing...' | 'Error';
  lastUpdated: string;
  subscribers: number;
  color: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploadedAt: string;
}

export interface Metric {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  progress: number;
}

export interface Episode {
  id: string;
  title: string;
  duration: string;
  publishDate: string;
  downloads: number;
  trend: string;
}

export interface Payout {
  id: string;
  date: string;
  method: string;
  amount: string;
  status: 'Completed' | 'Flagged' | 'Pending';
  reference: string;
}
