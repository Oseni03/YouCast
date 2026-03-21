import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2Icon, CircleHelpIcon, InfoIcon, ListVideoIcon, PlayIcon, SendIcon, SignalHigh, Loader2Icon } from 'lucide-react';
import { useChannels } from '@/hooks/useChannels';
import { useEligibleVideos } from '@/hooks/useChannels';
import { useCreateEpisode } from '@/hooks/useEpisodes';
import type { YouTubeVideo } from '@/lib/types';

export default function NewEpisodePage() {
  const router = useRouter();
  const { projectId } = useParams() as { projectId: string };
  const selectedChannelId = projectId;
  
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  const { data: eligibleVideos, isLoading: videosLoading } = useEligibleVideos(selectedChannelId);
  const createEpisodeMutation = useCreateEpisode();

  // Reset selected video when channel changes
  useEffect(() => {
    setSelectedVideo(null);
  }, [selectedChannelId]);

  const handlePublish = async () => {
    if (!selectedChannelId || !selectedVideo) return;

    try {
      await createEpisodeMutation.mutateAsync({
        channelId: selectedChannelId,
        videoId: selectedVideo.id
      });
      router.push(`/projects/${projectId}/episodes`);
    } catch (err) {
      console.error('Failed to create episode:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 md:gap-4 mb-8 md:mb-12 border-b-4 border-black dark:border-white pb-8">
        <div>
          <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">Create Episode</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">Convert YouTube video to high-quality podcast</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <Button 
            asChild
            variant="outline"
            className="flex-1 md:flex-none h-auto bg-white dark:bg-black border-2 border-black dark:border-white px-6 py-3 rounded-none text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            <Link href={`/projects/${projectId}/episodes`}>
              Cancel
            </Link>
          </Button>
          <button className="flex-1 md:flex-none bg-white dark:bg-black border-2 border-black dark:border-white px-6 py-3 rounded-none text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
            <CircleHelpIcon className="size-4 md:size-5" />
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
                <ListVideoIcon/>
                Select Video
              </h3>
              
              <div className="w-full md:w-64">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Selected Channel</label>
                <input 
                  value={channels?.find(c => c.id === selectedChannelId)?.channel_title || 'Loading...'}
                  readOnly
                  className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-black dark:border-white p-3 text-xs font-black uppercase tracking-widest rounded-none focus:ring-0 text-slate-500"
                />
              </div>
            </div>

            {videosLoading ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-700">
                <Loader2Icon className="size-8 animate-spin text-slate-400 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Fetching latest videos...</p>
              </div>
            ) : eligibleVideos && eligibleVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eligibleVideos.map((video) => (
                  <div 
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`group relative bg-white dark:bg-black rounded-none overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedVideo?.id === video.id ? 'border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]' : 'border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      {selectedVideo?.id === video.id && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <CheckCircle2Icon className="text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-sm uppercase tracking-tight line-clamp-1">{video.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
                        Uploaded {new Date(video.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center px-6">
                  {selectedChannelId ? "No eligible videos found in this channel." : "Please select a channel to see available videos."}
                </p>
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-black p-8 rounded-none border-2 border-black dark:border-white">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tight">Episode Details</h3>
            <div className="space-y-8">
               <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Episode Title</label>
                <input 
                  className="w-full rounded-none border-2 border-black dark:border-white dark:bg-black focus:ring-0 focus:border-black text-sm p-4 font-bold uppercase" 
                  type="text" 
                  value={selectedVideo?.title || ''}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Source URL</label>
                <input 
                  className="w-full rounded-none border-2 border-black dark:border-white dark:bg-black focus:ring-0 focus:border-black text-xs p-4 font-mono text-slate-500" 
                  type="text" 
                  value={selectedVideo ? `https://youtube.com/watch?v=${selectedVideo.id}` : ''}
                  readOnly
                />
              </div>
              <div className="pt-8 border-t-2 border-black dark:border-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-none">
                      <SignalHigh/>
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">Audio Enhancement</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Apply AI noise reduction and normalization</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-black after:border-2 after:rounded-none after:h-6 after:w-6 after:transition-all dark:border-white peer-checked:bg-black dark:peer-checked:bg-white"></div>
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-black rounded-none border-4 border-black dark:border-white overflow-hidden sticky top-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
            <div className="p-4 border-b-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black">
              <h3 className="font-black uppercase tracking-widest text-xs">Preview</h3>
            </div>
             <div className="aspect-video bg-slate-100 relative">
              {selectedVideo ? (
                <img 
                  src={selectedVideo.thumbnail} 
                  alt="Preview" 
                  className="absolute inset-0 w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayIcon className="text-slate-300 size-12" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                <button className="bg-white rounded-none size-14 flex items-center justify-center border-2 border-black shadow-lg">
                  <PlayIcon/>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
               <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected</p>
                <p className="text-sm font-black uppercase truncate">{selectedVideo?.title || 'None'}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                <p className="text-sm font-black uppercase flex items-center gap-2">
                  <span className={`size-3 rounded-none border border-black dark:border-white ${selectedVideo ? 'bg-black dark:bg-white' : 'bg-transparent'}`}></span>
                  {selectedVideo ? 'Ready to process' : 'Selection required'}
                </p>
              </div>
              <div className="pt-6 space-y-4">
                 <button 
                  onClick={handlePublish}
                  disabled={!selectedVideo || createEpisodeMutation.isPending}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-5 px-4 rounded-none flex items-center justify-center gap-3 transition-all hover:invert uppercase tracking-tighter text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createEpisodeMutation.isPending ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <SendIcon/>
                  )}
                  {createEpisodeMutation.isPending ? 'Processing...' : 'Publish Now'}
                </button>
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900 p-6 border-t-2 border-black dark:border-white">
              <div className="flex items-start gap-3">
                <InfoIcon/>
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight tracking-wider">By publishing, you agree to distribute this audio content to your connected podcast platforms.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
