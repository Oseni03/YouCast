import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelService } from '@/lib/api-services';
import { useMe } from './useAuth';

export const CHANNELS_KEY = ['channels'] as const;
export const YT_CHANNELS_KEY = ['youtube-channels'] as const;

export const useChannels = () => {
  return useQuery({
    queryKey: CHANNELS_KEY,
    queryFn: channelService.getChannels,
  });
};

export const useChannel = (id: string) => {
  return useQuery({
    queryKey: [...CHANNELS_KEY, id],
    queryFn: () => channelService.getChannel(id),
    enabled: !!id,
  });
};

export const useConnectChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (youtube_channel_id: string) =>
      channelService.connectChannel(youtube_channel_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CHANNELS_KEY }),
  });
};

export const useDeleteChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => channelService.deleteChannel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CHANNELS_KEY }),
  });
};

export const useUpdateChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof channelService.updateChannel>[1] }) =>
      channelService.updateChannel(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: CHANNELS_KEY });
      qc.invalidateQueries({ queryKey: [...CHANNELS_KEY, variables.id] });
    },
  });
};

export const useEligibleVideos = (channelId: string) => {
  return useQuery({
    queryKey: [...CHANNELS_KEY, channelId, 'eligible-videos'],
    queryFn: () => channelService.getEligibleVideos(channelId),
    enabled: !!channelId,
  });
};



export const useYouTubeChannels = () => {
  const { data: user } = useMe();
  return useQuery({
    queryKey: YT_CHANNELS_KEY,
    queryFn: channelService.getYouTubeChannels,
    enabled: !!user?.has_youtube_connected,
    retry: false,
  });
};
