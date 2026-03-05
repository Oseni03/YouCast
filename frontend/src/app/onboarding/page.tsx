"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  useExchangeGoogleCode, 
  useYouTubeChannels, 
  useConnectChannel, 
  useUpdateChannel,
  YT_CHANNELS_KEY
} from '@/hooks/useChannels';
import { useMe, ME_KEY } from '@/hooks/useAuth';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { YouTubeChannel, Channel } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  // Modals state
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [isRSSModalOpen, setIsRSSModalOpen] = useState(false);

  // Step completion state
  const [youtubeCompleted, setYoutubeCompleted] = useState(false);
  const [rssCompleted, setRssCompleted] = useState(false);

  // Data state
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null);
  const [createdChannel, setCreatedChannel] = useState<Channel | null>(null);

  // Form state for RSS
  const [podcastTitle, setPodcastTitle] = useState('');
  const [podcastDescription, setPodcastDescription] = useState('');

  // API Hooks
  const exchangeCode = useExchangeGoogleCode();
  const { data: ytChannels, isLoading: isLoadingYT, isError: isErrorYT, refetch: refetchYT } = useYouTubeChannels();
  const connectChannel = useConnectChannel();
  const updateChannel = useUpdateChannel();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await exchangeCode.mutateAsync(tokenResponse.code);
        toast.success('YouTube account connected!');
        // Invalidate ME_KEY so useMe updates and enables the channel query
        queryClient.invalidateQueries({ queryKey: ME_KEY });
      } catch (err) {
        toast.error('Failed to connect YouTube account');
        console.error(err);
      }
    },
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  });

  const handleConnectChannel = async (channel: YouTubeChannel) => {
    try {
      const result = await connectChannel.mutateAsync(channel.id);
      setCreatedChannel(result);
      setPodcastTitle(result.podcast_title || result.channel_title);
      setPodcastDescription(result.podcast_description || result.channel_description);
      setYoutubeCompleted(true);
      setIsYoutubeModalOpen(false);
      setIsRSSModalOpen(true);
      toast.success('Channel connected!');
    } catch (err) {
      toast.error('Failed to connect channel');
      console.error(err);
    }
  };

  const handleUpdateRSS = async () => {
    if (!createdChannel) return;
    try {
      await updateChannel.mutateAsync({
        id: createdChannel.id,
        data: {
          podcast_title: podcastTitle,
          podcast_description: podcastDescription,
        }
      });
      setRssCompleted(true);
      setIsRSSModalOpen(false);
      toast.success('Podcast feed set up!');
    } catch (err) {
      toast.error('Failed to update podcast feed');
      console.error(err);
    }
  };

  const allCompleted = youtubeCompleted && rssCompleted;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-black rounded-none border-4 border-white shadow-[32px_32px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
        <div className="p-16">
          <div className="flex items-center gap-6 mb-16">
            <div className="size-14 rounded-none bg-white flex items-center justify-center text-black border-2 border-white">
              <span className="material-symbols-outlined text-3xl">fact_check</span>
            </div>
            <span className="text-4xl font-black tracking-tighter uppercase text-white">AUDIOSYNC</span>
          </div>
          
          <div className="mb-16">
            <h2 className="text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase">
              GET YOUR PODCAST <br />
              <span className="bg-white text-black px-4">READY FOR THE WORLD.</span>
            </h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xl">
              COMPLETE THESE SIMPLE STEPS TO START SYNCING YOUR YOUTUBE CONTENT TO ALL MAJOR PODCAST PLATFORMS.
            </p>
          </div>
          
          <div className="space-y-8 mb-16">
            {/* Step 1: YouTube */}
            <div 
              onClick={() => !youtubeCompleted && setIsYoutubeModalOpen(true)}
              className={`flex items-start gap-8 p-8 rounded-none border-4 transition-all cursor-pointer relative overflow-hidden ${
                youtubeCompleted 
                  ? 'bg-white/5 border-white' 
                  : 'bg-transparent border-white/20 hover:border-white'
              }`}
            >
              <div className={`size-20 rounded-none border-4 flex items-center justify-center transition-all ${
                youtubeCompleted ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'
              }`}>
                <span className="material-symbols-outlined text-4xl">smart_display</span>
              </div>
              <div className="flex-1 text-left pt-2">
                <h4 className={`text-2xl font-black mb-2 uppercase tracking-tight ${youtubeCompleted ? 'text-white' : 'text-white/60'}`}>
                  Connect YouTube Channel
                </h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] leading-tight">
                  Authorize AudioSync to access your video uploads and select your channel.
                </p>
              </div>
              <div className={`size-12 rounded-none border-4 flex items-center justify-center transition-all ${
                youtubeCompleted ? 'bg-white text-black border-white' : 'bg-transparent border-white/20'
              }`}>
                {youtubeCompleted && (
                  <span className="material-symbols-outlined text-3xl font-black">check</span>
                )}
              </div>
            </div>

            {/* Step 2: RSS */}
            <div 
              onClick={() => youtubeCompleted && !rssCompleted && setIsRSSModalOpen(true)}
              className={`flex items-start gap-8 p-8 rounded-none border-4 transition-all cursor-pointer relative overflow-hidden ${
                rssCompleted 
                  ? 'bg-white/5 border-white' 
                  : !youtubeCompleted 
                    ? 'opacity-50 cursor-not-allowed border-white/5'
                    : 'bg-transparent border-white/20 hover:border-white'
              }`}
            >
              <div className={`size-20 rounded-none border-4 flex items-center justify-center transition-all ${
                rssCompleted ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'
              }`}>
                <span className="material-symbols-outlined text-4xl">podcasts</span>
              </div>
              <div className="flex-1 text-left pt-2">
                <h4 className={`text-2xl font-black mb-2 uppercase tracking-tight ${rssCompleted ? 'text-white' : 'text-white/60'}`}>
                  Set Up Podcast Feed
                </h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] leading-tight">
                  Customize your podcast name, description, and cover art.
                </p>
              </div>
              <div className={`size-12 rounded-none border-4 flex items-center justify-center transition-all ${
                rssCompleted ? 'bg-white text-black border-white' : 'bg-transparent border-white/20'
              }`}>
                {rssCompleted && (
                  <span className="material-symbols-outlined text-3xl font-black">check</span>
                )}
              </div>
            </div>
          </div>
          
          {allCompleted && (
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full py-8 bg-white text-black text-2xl font-black rounded-none hover:invert transition-all flex items-center justify-center gap-6 uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              Continue to Dashboard
              <span className="material-symbols-outlined text-3xl">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* YouTube Connection Modal */}
      <Dialog open={isYoutubeModalOpen} onOpenChange={setIsYoutubeModalOpen}>
        <DialogContent className="max-w-2xl bg-black border-4 border-white rounded-none p-12 text-white">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Connect YouTube</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider">
              SELECT THE CHANNEL YOU WANT TO TURN INTO A PODCAST.
            </DialogDescription>
          </DialogHeader>

          {!user?.has_youtube_connected ? (
            <div className="py-12 flex flex-col items-center gap-8">
              <Button 
                onClick={() => googleLogin()}
                className="h-20 px-12 bg-white text-black text-xl font-black rounded-none hover:invert transition-all uppercase tracking-tight gap-4"
              >
                <span className="material-symbols-outlined">login</span>
                Sign in with Google
              </Button>
              <p className="text-xs text-slate-500 uppercase font-black tracking-widest text-center max-w-sm">
                WE NEED ACCESS TO YOUR YOUTUBE ACCOUNT TO FETCH YOUR CHANNELS AND VIDEO DATA.
              </p>
            </div>
          ) : isLoadingYT ? (
            <div className="py-24 flex flex-col items-center gap-4 text-white/40">
              <span className="material-symbols-outlined text-5xl animate-spin">refresh</span>
              <p className="text-xs font-black uppercase tracking-widest">Fetching your channels...</p>
            </div>
          ) : !ytChannels || ytChannels.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-8">
              <div className="size-20 border-4 border-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-white/20">search_off</span>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-center max-w-sm">
                NO YOUTUBE CHANNELS FOUND ON THIS ACCOUNT.
              </p>
              <Button 
                variant="outline"
                onClick={() => googleLogin()}
                className="rounded-none border-2 border-white/20 hover:border-white text-white uppercase font-bold"
              >
                Switch Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {ytChannels.map((channel) => (
                <div 
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`flex items-center gap-6 p-6 border-4 transition-all cursor-pointer ${
                    selectedChannel?.id === channel.id ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/40'
                  }`}
                >
                  <img src={channel.thumbnail_url} alt="" className="size-16 border-2 border-white" />
                  <div className="flex-1 text-left">
                    <h5 className="text-xl font-black uppercase tracking-tight">{channel.title}</h5>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[300px]">
                      {channel.description || 'NO DESCRIPTION AVAILABLE'}
                    </p>
                  </div>
                  {selectedChannel?.id === channel.id && (
                    <span className="material-symbols-outlined text-white">check_circle</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="mt-12">
            <Button 
              disabled={!selectedChannel || connectChannel.isPending}
              onClick={() => selectedChannel && handleConnectChannel(selectedChannel)}
              className="w-full h-16 bg-white text-black text-xl font-black rounded-none hover:invert transition-all uppercase tracking-tighter"
            >
              {connectChannel.isPending ? 'CONNECTING...' : 'CONFIRM SELECTION'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RSS Setup Modal */}
      <Dialog open={isRSSModalOpen} onOpenChange={setIsRSSModalOpen}>
        <DialogContent className="max-w-2xl bg-black border-4 border-white rounded-none p-12 text-white">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-4xl font-black uppercase tracking-tighter">Setup Podcast Feed</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider">
              CUSTOMIZE HOW YOUR PODCAST APPEARS ON APPLE & SPOTIFY.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Podcast Title</Label>
              <Input 
                value={podcastTitle}
                onChange={(e) => setPodcastTitle(e.target.value)}
                className="h-14 bg-white/5 border-2 border-white/20 rounded-none focus:border-white transition-all text-white font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
              <Textarea 
                value={podcastDescription}
                onChange={(e) => setPodcastDescription(e.target.value)}
                rows={4}
                className="bg-white/5 border-2 border-white/20 rounded-none focus:border-white transition-all text-white font-bold resize-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-12">
            <Button 
              disabled={!podcastTitle || updateChannel.isPending}
              onClick={handleUpdateRSS}
              className="w-full h-16 bg-white text-black text-xl font-black rounded-none hover:invert transition-all uppercase tracking-tighter"
            >
              {updateChannel.isPending ? 'SAVING...' : 'FINISH SETUP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

