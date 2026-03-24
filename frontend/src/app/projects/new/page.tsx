"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    useChannels,
    useYouTubeChannels,
    useConnectChannel,
    useUpdateChannel,
} from '@/hooks/useChannels';
import { useMe } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { YouTubeChannel, Channel } from '@/lib/types';
import { 
    AlertCircleIcon, 
    ArrowLeft, 
    CheckCircle2Icon, 
    PodcastIcon, 
    RefreshCcwIcon, 
    SearchSlashIcon, 
    YoutubeIcon,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useMe();

    // Steps: 'select-channel' | 'setup-podcast'
    const [step, setStep] = useState<'select-channel' | 'setup-podcast'>('select-channel');

    // Data state
    const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null);
    const [createdChannel, setCreatedChannel] = useState<Channel | null>(null);

    // Form state for RSS
    const [podcastTitle, setPodcastTitle] = useState('');
    const [podcastDescription, setPodcastDescription] = useState('');

    // API Hooks
    const { data: channels } = useChannels();
    const { data: ytChannels, isLoading: isLoadingYT, isError: isErrorYT, refetch: refetchYT } = useYouTubeChannels();
    const connectChannel = useConnectChannel();
    const updateChannel = useUpdateChannel();

    // Redirect if account setup is incomplete or limit reached
    useEffect(() => {
        if (!userLoading && user) {
            const isTosAccepted = !!user.tos_accepted_at;
            const isYouTubeConnected = !!user.has_youtube_connected;
            const limitReached = channels && channels.length >= user.channel_limit;
            
            if (!isTosAccepted || !isYouTubeConnected) {
                router.push('/onboarding');
            } else if (limitReached && step === 'select-channel') {
                toast.error('Channel limit reached. Please upgrade your plan.');
                router.push('/projects');
            }
        }
    }, [user, userLoading, channels, step, router]);

    const handleConnectChannel = async (channel: YouTubeChannel) => {
        try {
            const result = await connectChannel.mutateAsync(channel.id);
            setCreatedChannel(result);
            setPodcastTitle(result.podcast_title || result.channel_title);
            setPodcastDescription(result.podcast_description || result.channel_description);
            setStep('setup-podcast');
            toast.success('Channel connected!');
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to connect channel';
            toast.error(errorMsg);
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
            toast.success('Project created successfully!');
            router.push(`/projects/${createdChannel.id}`);
        } catch (err) {
            toast.error('Failed to update podcast feed');
            console.error(err);
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <RefreshCcwIcon className="animate-spin size-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12">
            <header className="mb-12">
                <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 group">
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Projects
                </Link>
                <h1 className="text-4xl font-manrope font-bold text-primary tracking-tight">Create New Project</h1>
                <p className="text-muted-foreground mt-2 font-medium">Turn your YouTube channel into a podcast feed.</p>
            </header>

            {/* Stepper tracking */}
            <div className="flex items-center gap-4 mb-12">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${step === 'select-channel' ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-muted-foreground'}`}>
                    <span className="size-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                    Select Channel
                </div>
                <ChevronRight className="size-4 text-muted-foreground/30" />
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${step === 'setup-podcast' ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-muted-foreground'}`}>
                    <span className="size-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                    Setup Podcast
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] overflow-hidden">
                {step === 'select-channel' ? (
                    <div className="p-8 md:p-12">
                        <div className="mb-8">
                            <h2 className="text-2xl font-manrope font-bold text-primary mb-2">Select your YouTube Channel</h2>
                            <p className="text-muted-foreground font-medium">Choose from your connected YouTube account.</p>
                        </div>

                        {isLoadingYT ? (
                            <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
                                <RefreshCcwIcon className="animate-spin size-8" />
                                <p className="text-sm font-semibold">Fetching your channels...</p>
                            </div>
                        ) : isErrorYT ? (
                            <div className="py-10 flex flex-col items-center gap-6">
                                <div className="size-16 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                                    <AlertCircleIcon className="size-8" />
                                </div>
                                <p className="text-destructive font-medium text-center max-w-sm">
                                    Failed to fetch your YouTube channels.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => refetchYT()}
                                    className="rounded-lg border border-border hover:border-primary text-primary font-semibold"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : !ytChannels || ytChannels.length === 0 ? (
                            <div className="py-10 flex flex-col items-center gap-6">
                                <div className="size-16 rounded-xl bg-muted flex items-center justify-center">
                                    <SearchSlashIcon className="text-muted-foreground size-8" />
                                </div>
                                <p className="text-muted-foreground font-medium text-center max-w-sm">
                                    No YouTube channels found on this account.
                                </p>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="rounded-lg border border-border hover:border-primary text-primary font-semibold"
                                >
                                    <Link href="/onboarding">Switch Account</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-10">
                                {ytChannels.map((channel) => (
                                    <div
                                        key={channel.id}
                                        onClick={() => setSelectedChannel(channel)}
                                        className={`flex items-center gap-5 p-5 rounded-2xl border transition-all cursor-pointer group ${selectedChannel?.id === channel.id 
                                            ? 'border-accent bg-accent/5 ring-1 ring-accent/20' 
                                            : 'border-border hover:border-primary'
                                        }`}
                                    >
                                        <img src={channel.thumbnail_url} alt="" className="size-14 rounded-xl object-cover shadow-sm shrink-0" />
                                        <div className="flex-1 text-left min-w-0">
                                            <h5 className="text-lg font-bold text-primary line-clamp-1 group-hover:text-accent transition-colors">{channel.title}</h5>
                                            <p className="text-sm font-medium text-muted-foreground line-clamp-1 mt-0.5">
                                                {channel.description || 'No description available'}
                                            </p>
                                        </div>
                                        {selectedChannel?.id === channel.id && (
                                            <div className="size-6 rounded-full bg-accent flex items-center justify-center text-white shrink-0 ml-2 shadow-sm">
                                                <CheckCircle2Icon className="size-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            disabled={!selectedChannel || connectChannel.isPending}
                            onClick={() => selectedChannel && handleConnectChannel(selectedChannel)}
                            className="w-full h-16 bg-linear-to-br from-primary to-primary-container text-primary-foreground text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                        >
                            {connectChannel.isPending ? 'Connecting...' : (
                                <span className="flex items-center gap-2">
                                    Connect Channel & Continue
                                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="p-8 md:p-12">
                        <div className="mb-10">
                            <h2 className="text-2xl font-manrope font-bold text-primary mb-2">Configure Podcast Feed</h2>
                            <p className="text-muted-foreground font-medium">How your podcast will appear on Apple Podcasts, Spotify, and more.</p>
                        </div>

                        <div className="space-y-8 mb-12">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-primary ml-1 uppercase tracking-widest opacity-70">Podcast Title</Label>
                                <Input
                                    value={podcastTitle}
                                    onChange={(e) => setPodcastTitle(e.target.value)}
                                    placeholder="Your Awesome Podcast"
                                    className="h-14 bg-surface-container-low border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-primary font-semibold px-6 text-lg"
                                />
                                <p className="text-xs text-muted-foreground ml-1">Defaults to your YouTube channel name.</p>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-primary ml-1 uppercase tracking-widest opacity-70">Description</Label>
                                <Textarea
                                    value={podcastDescription}
                                    onChange={(e) => setPodcastDescription(e.target.value)}
                                    rows={5}
                                    placeholder="Tell the world what your podcast is about..."
                                    className="bg-surface-container-low border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-primary font-medium p-6 resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setStep('select-channel')}
                                className="h-16 px-8 rounded-2xl border-border hover:border-primary text-primary font-bold transition-all order-2 sm:order-1"
                            >
                                Back
                            </Button>
                            <Button
                                disabled={!podcastTitle || updateChannel.isPending}
                                onClick={handleUpdateRSS}
                                className="flex-1 h-16 bg-linear-to-br from-primary to-primary-container text-primary-foreground text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all group order-1 sm:order-2"
                            >
                                {updateChannel.isPending ? 'Finalizing...' : (
                                    <span className="flex items-center justify-center gap-2">
                                        Create Podcast Project
                                        <PodcastIcon className="size-5" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
