import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { episodeService, EpisodeQueryParams } from '@/lib/api-services';

export const EPISODES_KEY = ['episodes'] as const;

export const useEpisodes = (params: EpisodeQueryParams = {}) => {
  return useQuery({
    queryKey: [...EPISODES_KEY, params],
    queryFn: () => episodeService.getEpisodes(params),
  });
};

export const useEpisode = (id: string) => {
  return useQuery({
    queryKey: [...EPISODES_KEY, id],
    queryFn: () => episodeService.getEpisode(id),
    enabled: !!id,
  });
};

export const useRetryEpisode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => episodeService.retryEpisode(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EPISODES_KEY }),
  });
};
export const useCreateEpisode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, videoId }: { channelId: string; videoId: string }) =>
      episodeService.createEpisode(channelId, videoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: EPISODES_KEY }),
  });
};
