import api from './api';
import type {
  Channel,
  Episode,
  EpisodeListItem,
  OverviewStats,
  EpisodeStat,
  PaginatedResponse,
  YouTubeVideo,
  YouTubeChannel,
  YouTubeAuthResponse,
} from './types';

// ── Channels ────────────────────────────────────────────────────────────────

export const channelService = {
  getChannels: async (): Promise<Channel[]> => {
    const res = await api.get<Channel[]>('/channels/');
    return res.data;
  },

  getChannel: async (id: string): Promise<Channel> => {
    const res = await api.get<Channel>(`/channels/${id}/`);
    return res.data;
  },

  connectChannel: async (youtube_channel_id: string): Promise<Channel> => {
    const res = await api.post<Channel>('/channels/', { youtube_channel_id });
    return res.data;
  },

  deleteChannel: async (id: string): Promise<void> => {
    await api.delete(`/channels/${id}/`);
  },

  updateChannel: async (id: string, data: Partial<Channel>): Promise<Channel> => {
    const res = await api.patch<Channel>(`/channels/${id}/`, data);
    return res.data;
  },

  getEligibleVideos: async (channelId: string): Promise<YouTubeVideo[]> => {
    const res = await api.get<YouTubeVideo[]>(`/channels/${channelId}/eligible-videos/`);
    return res.data;
  },

  getYouTubeChannels: async (): Promise<YouTubeChannel[]> => {
    const res = await api.get<YouTubeChannel[]>('/channels/youtube/');
    return res.data;
  },
};

// ── Episodes ────────────────────────────────────────────────────────────────

export interface EpisodeQueryParams {
  channel?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const episodeService = {
  getEpisodes: async (params: EpisodeQueryParams = {}): Promise<PaginatedResponse<EpisodeListItem>> => {
    const res = await api.get<PaginatedResponse<EpisodeListItem>>('/episodes/', { params });
    return res.data;
  },

  getEpisode: async (id: string): Promise<Episode> => {
    const res = await api.get<Episode>(`/episodes/${id}/`);
    return res.data;
  },

  retryEpisode: async (id: string): Promise<{ status: string }> => {
    const res = await api.post<{ status: string }>(`/episodes/${id}/retry/`);
    return res.data;
  },

  createEpisode: async (channelId: string, videoId: string): Promise<Episode> => {
    const res = await api.post<Episode>('/episodes/', { channel_id: channelId, youtube_video_id: videoId });
    return res.data;
  },
};

// ── Analytics ───────────────────────────────────────────────────────────────

export interface TimeseriesParams {
  channel?: string;
  days?: number;
}

export interface TimeseriesPoint {
  day: string;
  count: number;
}

export const analyticsService = {
  getOverviewStats: async (params: { channel?: string } = {}): Promise<OverviewStats> => {
    const res = await api.get<OverviewStats>('/analytics/overview/', { params });
    return res.data;
  },

  getTimeseries: async (params: TimeseriesParams = {}): Promise<TimeseriesPoint[]> => {
    const res = await api.get<TimeseriesPoint[]>('/analytics/timeseries/', { params });
    return res.data;
  },

  getEpisodeStats: async (params: { channel?: string } = {}): Promise<EpisodeStat[]> => {
    const res = await api.get<EpisodeStat[]>('/analytics/episodes/', { params });
    return res.data;
  },
};

// ── Auth & Account ──────────────────────────────────────────────────────────

export const authService = {
  acceptTOS: async (accepted: boolean): Promise<{ status: string; tos_accepted_at: string }> => {
    const res = await api.post<{ status: string; tos_accepted_at: string }>('/auth/tos/', { accepted });
    return res.data;
  },
};
