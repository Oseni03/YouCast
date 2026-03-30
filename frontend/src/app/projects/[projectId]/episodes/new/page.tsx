"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2Icon, CircleHelpIcon, InfoIcon, ListVideoIcon, PlayIcon, SendIcon, SignalHigh, Loader2Icon } from 'lucide-react';
import { useChannels } from '@/hooks/useChannels';
import { useEligibleVideos } from '@/hooks/useChannels';
import { useCreateEpisode } from '@/hooks/useEpisodes';
import type { YouTubeVideo } from '@/lib/types';
import { toast } from 'sonner';

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
            toast.success("Episode created successfully")
            router.push(`/projects/${projectId}/episodes`);
        } catch (err) {
            console.error('Failed to create episode:', err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 md:gap-4 mb-8 pb-6">
                <div>
                    <h2 className="text-3xl font-manrope font-bold text-primary tracking-tight">Create Episode</h2>
                    <p className="text-muted-foreground mt-2 font-medium text-sm">Convert YouTube video to high-quality podcast</p>
                </div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <Button
                        asChild
                        variant="outline"
                        className="flex-1 md:flex-none h-auto bg-surface-container-low hover:bg-surface-container-high border-none text-primary px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200"
                    >
                        <Link href={`/projects/${projectId}/episodes`}>
                            Cancel
                        </Link>
                    </Button>
                    <button className="flex-1 md:flex-none bg-surface-container-low hover:bg-surface-container-high text-primary px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200">
                        <CircleHelpIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Help</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <h3 className="text-2xl font-manrope font-bold text-primary flex items-center gap-3 tracking-tight">
                                <ListVideoIcon className="w-6 h-6 text-primary/80" />
                                Select Video
                            </h3>

                            <div className="w-full md:w-64 space-y-2">
                                <label className="block text-sm font-semibold text-muted-foreground ml-1">Selected Channel</label>
                                <input
                                    value={channels?.find(c => c.id === selectedChannelId)?.channel_title || 'Loading...'}
                                    readOnly
                                    className="w-full bg-surface-container-low border-none p-3.5 text-sm font-medium rounded-xl text-primary focus:outline-none opacity-80"
                                />
                            </div>
                        </div>

                        {videosLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-border rounded-3xl shadow-sm">
                                <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                                <p className="text-sm font-medium text-muted-foreground">Fetching latest videos...</p>
                            </div>
                        ) : eligibleVideos && eligibleVideos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {eligibleVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`group relative bg-surface-container-lowest rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer ${selectedVideo?.id === video.id ? 'border-primary shadow-[0px_12px_24px_rgba(25,28,30,0.08)] ring-1 ring-primary' : 'border-border hover:border-primary/50 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="aspect-video bg-surface-container-low relative overflow-hidden">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                referrerPolicy="no-referrer"
                                            />
                                            {selectedVideo?.id === video.id && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px] transition-all">
                                                    <CheckCircle2Icon className="text-white w-10 h-10 drop-shadow-md" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-semibold text-primary text-base tracking-tight line-clamp-1 mb-1.5">{video.title}</h4>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Uploaded {new Date(video.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-border rounded-3xl shadow-sm px-6">
                                <p className="text-sm font-medium text-muted-foreground text-center">
                                    {selectedChannelId ? "No eligible videos found in this channel." : "Please select a channel to see available videos."}
                                </p>
                            </div>
                        )}
                    </section>

                    <section className="bg-surface-container-lowest p-8 rounded-3xl border border-border shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
                        <h3 className="text-2xl font-manrope font-bold mb-8 text-primary tracking-tight">Episode Details</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-muted-foreground ml-1">Episode Title</label>
                                <input
                                    className="w-full rounded-xl bg-surface-container-low border-none focus:outline-none text-sm p-4 text-primary font-medium"
                                    type="text"
                                    value={selectedVideo?.title || ''}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-muted-foreground ml-1">Source URL</label>
                                <input
                                    className="w-full rounded-xl bg-surface-container-low border-none focus:outline-none text-sm p-4 font-mono text-muted-foreground"
                                    type="text"
                                    value={selectedVideo ? `https://youtube.com/watch?v=${selectedVideo.id}` : ''}
                                    readOnly
                                />
                            </div>
                            <div className="pt-6 border-t border-border mt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-sm">
                                            <SignalHigh className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-primary">Audio Enhancement</p>
                                            <p className="text-sm text-muted-foreground">Apply AI noise reduction and normalization</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-surface-container-lowest rounded-3xl border border-border overflow-hidden sticky top-8 shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
                        <div className="p-5 border-b border-border bg-surface-container-low">
                            <h3 className="font-semibold text-primary text-sm tracking-wide">Preview</h3>
                        </div>
                        <div className="aspect-video bg-surface-container relative">
                            {selectedVideo ? (
                                <img
                                    src={selectedVideo.thumbnail}
                                    alt="Preview"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayIcon className="text-muted-foreground/30 w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                <button className="bg-white/20 backdrop-blur-md rounded-full size-14 flex items-center justify-center text-white border border-white/30 shadow-lg hover:bg-white/30 transition-colors">
                                    <PlayIcon className="w-6 h-6 ml-1" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col gap-1.5">
                                <p className="text-xs font-semibold text-muted-foreground">Selected</p>
                                <p className="text-base font-semibold text-primary truncate">{selectedVideo?.title || 'None'}</p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-xs font-semibold text-muted-foreground">Status</p>
                                <p className="text-sm font-medium text-primary flex items-center gap-2">
                                    <span className={`size-2.5 rounded-full ${selectedVideo ? 'bg-primary' : 'bg-surface-container-high'}`}></span>
                                    {selectedVideo ? 'Ready to process' : 'Selection required'}
                                </p>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={handlePublish}
                                    disabled={!selectedVideo || createEpisodeMutation.isPending}
                                    className="w-full bg-linear-to-br from-primary to-primary-container text-primary-foreground font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                                >
                                    {createEpisodeMutation.isPending ? (
                                        <Loader2Icon className="animate-spin w-5 h-5" />
                                    ) : (
                                        <SendIcon className="w-5 h-5" />
                                    )}
                                    {createEpisodeMutation.isPending ? 'Processing...' : 'Publish Now'}
                                </button>
                            </div>
                        </div>
                        <div className="bg-surface-container-low p-5 border-t border-border">
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <InfoIcon className="w-4 h-4 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium leading-relaxed">By publishing, you agree to distribute this audio content to your connected podcast platforms.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
