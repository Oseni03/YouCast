// ── Backend API Types ──────────────────────────────────────────────────────

export interface Channel {
	id: string;
	youtube_channel_id: string;
	channel_title: string;
	channel_description: string;
	channel_thumbnail_url: string;
	podcast_title: string;
	podcast_description: string;
	artwork_url: string | null;
	effective_artwork_url: string;
	rss_slug: string;
	rss_feed_url: string;
	language: string;
	category: string;
	explicit: boolean;
	episode_prefix: string;
	episode_suffix: string;
	filter_config: Record<string, unknown>;
	monitoring_active: boolean;
	websub_subscribed_at: string | null;
	last_polled_at: string | null;
	last_video_published_at: string | null;
	episode_count: number;
	created_at: string;
}

export interface YouTubeChannel {
	id: string;
	title: string;
	description: string;
	thumbnail_url: string;
	uploads_playlist_id: string;
}

export interface YouTubeAuthResponse {
	status: string;
}

export interface Episode {
	id: string;
	channel: string;
	channel_title: string;
	youtube_video_id: string;
	youtube_url: string;
	title: string;
	description: string;
	youtube_pub_date: string;
	duration_seconds: number;
	duration_formatted: string;
	thumbnail_url: string | null;
	youtube_chapters: unknown[];
	audio_url: string | null;
	audio_size_bytes: number | null;
	audio_format: string;
	processing_status: "queued" | "processing" | "done" | "failed" | "skipped";
	processing_started_at: string | null;
	processing_completed_at: string | null;
	processing_error: string;
	retry_count: number;
	pub_date: string | null;
	transcript_url: string | null;
	download_count: number;
	created_at: string;
}

export interface EpisodeListItem {
	id: string;
	title: string;
	thumbnail_url: string | null;
	youtube_pub_date: string;
	duration_formatted: string;
	processing_status: Episode["processing_status"];
	audio_format: string;
	download_count: number;
	pub_date: string | null;
	audio_url: string | null;
}

export interface OverviewStats {
	total_channels: number;
	total_episodes: number;
	total_downloads: number;
}

export interface EpisodeStat {
	id: string;
	title: string;
	pub_date: string | null;
	download_count: number;
}

export interface PaginatedResponse<T> {
	count: number;
	page: number;
	results: T[];
}

export interface Creator {
	id: string;
	email: string;
	username: string;
	avatar_url: string;
	bio: string;
	plan_tier: "free" | "starter" | "pro" | "agency";
	channel_limit: number;
	tos_accepted_at: string | null;
	has_youtube_connected: boolean;
	created_at: string;
}

// ── Frontend UI Types ───────────────────────────────────────────────────────

export interface PodcastFeed {
	id: string;
	name: string;
	status: "Synced" | "Syncing..." | "Error";
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
	trendDirection: "up" | "down" | "neutral";
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
	status: "Completed" | "Flagged" | "Pending";
	reference: string;
}
