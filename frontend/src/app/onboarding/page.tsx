"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import {
    useYouTubeChannels,
    useConnectChannel,
    useUpdateChannel,
} from '@/hooks/useChannels';
import { useMe, useAcceptTOS } from '@/hooks/useAuth';
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
import { YouTubeChannel, Channel } from '@/lib/types';
import { AlertCircleIcon, ArrowBigRightIcon, BookCheckIcon, CheckCircle2Icon, CheckIcon, LogInIcon, PodcastIcon, RefreshCcwIcon, SearchSlashIcon, YoutubeIcon } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: user } = useMe();

    // Modals state
    const [isTOSModalOpen, setIsTOSModalOpen] = useState(false);
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

    const { data: ytChannels, isLoading: isLoadingYT, isError: isErrorYT, refetch: refetchYT } = useYouTubeChannels();
    const connectChannel = useConnectChannel();
    const updateChannel = useUpdateChannel();
    const acceptTOS = useAcceptTOS();

    const tosCompleted = !!user?.tos_accepted_at;

    const handleGoogleLogin = () => {
        try {
            localStorage.setItem('auth_return_to', '/onboarding?show_channels=true');
            const token = localStorage.getItem('access_token');
            window.location.href = `http://localhost:8000/api/auth/google/authorize/?token=${token || ''}`;
        } catch (err) {
            toast.error('Failed to initiate Google login');
            console.error(err);
        }
    };

    useEffect(() => {
        if (searchParams.get('show_channels') === 'true' && user?.has_youtube_connected && !youtubeCompleted) {
            setIsYoutubeModalOpen(true);
            router.replace('/onboarding');
        }
    }, [searchParams, user, youtubeCompleted, router]);

    const handleConnectChannel = async (channel: YouTubeChannel) => {
        if (!tosCompleted) {
            toast.error('You must accept the Terms of Service first');
            setIsTOSModalOpen(true);
            return;
        }
        try {
            const result = await connectChannel.mutateAsync(channel.id);
            setCreatedChannel(result);
            setPodcastTitle(result.podcast_title || result.channel_title);
            setPodcastDescription(result.podcast_description || result.channel_description);
            setYoutubeCompleted(true);
            setIsYoutubeModalOpen(false);
            setIsRSSModalOpen(true);
            toast.success('Channel connected!');
        } catch (err: any) {
            if (err.response?.status === 403 && !tosCompleted) {
                toast.error('You must accept the Terms of Service first');
                setIsTOSModalOpen(true);
            } else {
                toast.error('Failed to connect channel');
            }
            console.error(err);
        }
    };

    const handleAcceptTOS = async () => {
        try {
            await acceptTOS.mutateAsync(true);
            setIsTOSModalOpen(false);
            toast.success('Terms of Service accepted!');
        } catch (err) {
            toast.error('Failed to accept Terms of Service');
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

    const allCompleted = tosCompleted && youtubeCompleted && rssCompleted;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-3xl w-full bg-black rounded-none border-4 border-white shadow-[32px_32px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
                <div className="p-16">
                    <div className="flex items-center gap-6 mb-16">
                        <div className="size-14 rounded-none bg-white flex items-center justify-center text-black border-2 border-white">
                            <BookCheckIcon />
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
                        {/* Step 0: TOS */}
                        <div
                            onClick={() => !tosCompleted && setIsTOSModalOpen(true)}
                            className={`flex items-start gap-8 p-8 rounded-none border-4 transition-all cursor-pointer relative overflow-hidden ${tosCompleted
                                ? 'bg-white/5 border-white'
                                : 'bg-transparent border-white/20 hover:border-white'
                                }`}
                        >
                            <div className={`size-20 rounded-none border-4 flex items-center justify-center transition-all ${tosCompleted ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'
                                }`}>
                                <BookCheckIcon />
                            </div>
                            <div className="flex-1 text-left pt-2">
                                <h4 className={`text-2xl font-black mb-2 uppercase tracking-tight ${tosCompleted ? 'text-white' : 'text-white/60'}`}>
                                    Accept Terms of Service
                                </h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] leading-tight">
                                    Review and agree to our terms to start using AudioSync services.
                                </p>
                            </div>
                            <div className={`size-12 rounded-none border-4 flex items-center justify-center transition-all ${tosCompleted ? 'bg-white text-black border-white' : 'bg-transparent border-white/20'
                                }`}>
                                {tosCompleted && (
                                    <CheckIcon />
                                )}
                            </div>
                        </div>

                        {/* Step 1: YouTube */}
                        <div
                            onClick={() => tosCompleted && !youtubeCompleted && setIsYoutubeModalOpen(true)}
                            className={`flex items-start gap-8 p-8 rounded-none border-4 transition-all cursor-pointer relative overflow-hidden ${youtubeCompleted
                                ? 'bg-white/5 border-white'
                                : !tosCompleted
                                    ? 'opacity-50 cursor-not-allowed border-white/5'
                                    : 'bg-transparent border-white/20 hover:border-white'
                                }`}
                        >
                            <div className={`size-20 rounded-none border-4 flex items-center justify-center transition-all ${youtubeCompleted ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'
                                }`}>
                                <YoutubeIcon size={40} />
                            </div>
                            <div className="flex-1 text-left pt-2">
                                <h4 className={`text-2xl font-black mb-2 uppercase tracking-tight ${youtubeCompleted ? 'text-white' : 'text-white/60'}`}>
                                    Connect YouTube Channel
                                </h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] leading-tight">
                                    Authorize AudioSync to access your video uploads and select your channel.
                                </p>
                            </div>
                            <div className={`size-12 rounded-none border-4 flex items-center justify-center transition-all ${youtubeCompleted ? 'bg-white text-black border-white' : 'bg-transparent border-white/20'
                                }`}>
                                {youtubeCompleted && (
                                    <CheckIcon />
                                )}
                            </div>
                        </div>

                        {/* Step 2: RSS */}
                        <div
                            onClick={() => youtubeCompleted && !rssCompleted && setIsRSSModalOpen(true)}
                            className={`flex items-start gap-8 p-8 rounded-none border-4 transition-all cursor-pointer relative overflow-hidden ${rssCompleted
                                ? 'bg-white/5 border-white'
                                : !youtubeCompleted
                                    ? 'opacity-50 cursor-not-allowed border-white/5'
                                    : 'bg-transparent border-white/20 hover:border-white'
                                }`}
                        >
                            <div className={`size-20 rounded-none border-4 flex items-center justify-center transition-all ${rssCompleted ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'
                                }`}>
                                <PodcastIcon />
                            </div>
                            <div className="flex-1 text-left pt-2">
                                <h4 className={`text-2xl font-black mb-2 uppercase tracking-tight ${rssCompleted ? 'text-white' : 'text-white/60'}`}>
                                    Set Up Podcast Feed
                                </h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] leading-tight">
                                    Customize your podcast name, description, and cover art.
                                </p>
                            </div>
                            <div className={`size-12 rounded-none border-4 flex items-center justify-center transition-all ${rssCompleted ? 'bg-white text-black border-white' : 'bg-transparent border-white/20'
                                }`}>
                                {rssCompleted && (
                                    <CheckIcon />
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
                            <ArrowBigRightIcon />
                        </button>
                    )}
                </div>
            </div>

            {/* TOS Modal */}
            <Dialog open={isTOSModalOpen} onOpenChange={setIsTOSModalOpen}>
                <DialogContent className="max-w-2xl bg-black border-4 border-white text-white rounded-none p-12">
                    <DialogHeader>
                        <DialogTitle className="text-4xl font-black uppercase tracking-tighter mb-4">Terms of Service</DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider">
                            PLEASE REVIEW AND ACCEPT OUR TERMS TO PROCEED.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-8 p-6 border-2 border-white/10 bg-white/5 max-h-[40vh] overflow-y-auto text-sm font-medium leading-relaxed text-slate-300">
                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest">1. CONTENT OWNERSHIP</h3>
                        <p className="mb-6">YOU RETAIN ALL OWNERSHIP RIGHTS TO YOUR CONTENT. BY USING AUDIOSYNC, YOU GRANT US A LIMITED LICENSE TO PROCESS AND DISTRIBUTE YOUR CONTENT AS NECESSARY TO PROVIDE THE SERVICE.</p>

                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest">2. USAGE LIMITS</h3>
                        <p className="mb-6">OUR SERVICE IS SUBJECT TO LIMITS BASED ON YOUR SELECTED PLAN. MISUSE OR ATTEMPTS TO CIRCUMVENT THESE LIMITS MAY RESULT IN ACCOUNT SUSPENSION.</p>

                        <h3 className="text-white font-bold mb-4 uppercase tracking-widest">3. DATA PRIVACY</h3>
                        <p className="mb-4">WE RESPECT YOUR PRIVACY AND HANDLE YOUR DATA IN ACCORDANCE WITH OUR PRIVACY POLICY. GOOGLE USER DATA IS ACCESSED ONLY AS REQUIRED FOR YOUTUBE INTEGRATION.</p>
                    </div>

                    <DialogFooter className="sm:justify-start gap-4 flex-col sm:flex-row">
                        <Button
                            onClick={handleAcceptTOS}
                            disabled={acceptTOS.isPending}
                            className="flex-1 bg-white text-black font-black uppercase tracking-widest h-16 rounded-none hover:invert transition-all"
                        >
                            {acceptTOS.isPending ? 'ACCEPTING...' : 'I ACCEPT THE TERMS'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsTOSModalOpen(false)}
                            className="bg-transparent border-2 border-white/20 text-white font-black uppercase tracking-widest h-16 rounded-none hover:border-white transition-all"
                        >
                            CANCEL
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                onClick={handleGoogleLogin}
                                className="h-20 px-12 bg-white text-black text-xl font-black rounded-none hover:invert transition-all uppercase tracking-tight gap-4"
                            >
                                <LogInIcon />
                                Sign in with Google
                            </Button>
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest text-center max-w-sm">
                                WE NEED ACCESS TO YOUR YOUTUBE ACCOUNT TO FETCH YOUR CHANNELS AND VIDEO DATA.
                            </p>
                        </div>
                    ) : isLoadingYT ? (
                        <div className="py-24 flex flex-col items-center gap-4 text-white/40">
                            <RefreshCcwIcon className="animate-spin" />
                            <p className="text-xs font-black uppercase tracking-widest">Fetching your channels...</p>
                        </div>
                    ) : isErrorYT ? (
                        <div className="py-12 flex flex-col items-center gap-8">
                            <div className="size-20 border-4 border-red-500/20 flex items-center justify-center text-red-500">
                                <AlertCircleIcon className="size-10" />
                            </div>
                            <p className="text-red-400 font-bold uppercase tracking-wider text-center max-w-sm">
                                FAILED TO FETCH YOUR YOUTUBE CHANNELS.
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleGoogleLogin}
                                className="rounded-none border-2 border-white/20 hover:border-white text-white uppercase font-bold"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : !ytChannels || ytChannels.length === 0 ? (
                        <div className="py-12 flex flex-col items-center gap-8">
                            <div className="size-20 border-4 border-white/20 flex items-center justify-center">
                                <SearchSlashIcon className="text-white/20" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-center max-w-sm">
                                NO YOUTUBE CHANNELS FOUND ON THIS ACCOUNT.
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleGoogleLogin}
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
                                    className={`flex items-center gap-6 p-6 border-4 transition-all cursor-pointer ${selectedChannel?.id === channel.id ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/40'
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
                                        <CheckCircle2Icon />
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

