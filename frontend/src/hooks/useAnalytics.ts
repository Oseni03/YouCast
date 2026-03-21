import { useQuery } from '@tanstack/react-query';
import { analyticsService, TimeseriesParams } from '@/lib/api-services';

export const ANALYTICS_KEY = ['analytics'] as const;

export const useOverviewStats = (params: { channel?: string } = {}) => {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'overview', params],
    queryFn: () => analyticsService.getOverviewStats(params),
  });
};

export const useDownloadTimeseries = (params: TimeseriesParams = {}) => {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'timeseries', params],
    queryFn: () => analyticsService.getTimeseries(params),
  });
};

export const useEpisodeStats = (params: { channel?: string } = {}) => {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'episodes', params],
    queryFn: () => analyticsService.getEpisodeStats(params),
  });
};
