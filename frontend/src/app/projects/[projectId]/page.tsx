'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Rss, TrendingUpIcon, UploadIcon, CopyIcon, CheckIcon, RadioIcon, Mic2Icon, CalendarIcon, ClockIcon, ArrowRightIcon, Settings2Icon } from 'lucide-react';
import { useChannel } from '@/hooks/useChannels';
import { useOverviewStats } from '@/hooks/useAnalytics';
import { useEpisodes } from '@/hooks/useEpisodes';
import { format } from 'date-fns';

// ── Skeleton helpers ─────────────────────────────────────────────────────────

function StatSkeleton() {
    return (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 md:p-8 animate-pulse border border-border">
            <div className="h-3 w-24 bg-muted mb-4 rounded" />
            <div className="h-10 w-32 bg-muted rounded" />
            <div className="h-2 w-20 bg-muted/50 mt-2 rounded" />
        </div>
    );
}

function EpisodeSkeleton() {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-border last:border-0 animate-pulse">
            <div className="size-12 bg-muted rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-3 w-1/4 bg-muted/60 rounded" />
            </div>
        </div>
    );
}

export default function ProjectDashboardPage() {
    const { projectId } = useParams() as { projectId: string };
    const { data: channel, isLoading: channelLoading, isError: channelError } = useChannel(projectId);
    const { data: stats, isLoading: statsLoading } = useOverviewStats({ channel: projectId });
    const { data: episodesData, isLoading: episodesLoading } = useEpisodes({ channel: projectId, page_size: 5 });

    const [copied, setCopied] = useState(false);

    const totalDownloads = stats?.total_downloads ?? 0;
    const totalEpisodes = stats?.total_episodes ?? 0;
    const recentEpisodes = episodesData?.results ?? [];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
    };

    if (channelLoading) {
        return (
            <div className="max-w-5xl mx-auto p-8 space-y-8">
                <div className="h-10 w-64 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StatSkeleton />
                    <StatSkeleton />
                </div>
            </div>
        );
    }

    if (channelError || !channel) {
        return (
            <div className="max-w-5xl mx-auto p-20 text-center">
                <div className="size-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Settings2Icon className="size-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-manrope font-bold text-primary mb-2">Project not found</h2>
                <p className="text-muted-foreground mb-8 text-sm">We couldn't load the details for this project. It might have been deleted or the ID is incorrect.</p>
                <Button asChild variant="outline">
                    <Link href="/projects">Back to Projects</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-10 pt-4">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        {channel.effective_artwork_url && (
                            <img
                                src={channel.effective_artwork_url}
                                alt="Artwork"
                                className="size-12 object-cover rounded-xl shadow-md border border-border"
                            />
                        )}
                        <span className={`text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full ${channel.monitoring_active ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container-high text-muted-foreground border border-border'}`}>
                            {channel.monitoring_active ? 'Active' : 'Paused'}
                        </span>
                    </div>
                    <h2 className="text-4xl font-manrope font-bold text-primary tracking-tight leading-tight">{channel.podcast_title || channel.channel_title}</h2>
                    <p className="text-muted-foreground mt-2 font-medium text-sm line-clamp-2 max-w-2xl">{channel.podcast_description || 'No description provided.'}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
                    <Button
                        asChild
                        variant="outline"
                        className="w-full sm:w-auto h-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-surface-container-lowest hover:bg-surface-container-low"
                    >
                        <Link href={`/projects/${projectId}/settings`}>
                            <Settings2Icon className="size-4" />
                            Settings
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="w-full sm:w-auto h-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        <Link href={`/projects/${projectId}/episodes/new`}>
                            <UploadIcon className="size-5" />
                            New Episode
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Total Downloads */}
                <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)] border border-border group hover:border-primary/20 transition-colors">
                    {statsLoading ? (
                        <StatSkeleton />
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-2.5 bg-accent/10 rounded-xl">
                                    <TrendingUpIcon className="size-5 text-accent" />
                                </div>
                                <span className="flex items-center text-[10px] font-bold text-accent px-2.5 py-1 rounded-full border border-accent/20 uppercase tracking-widest">
                                    Live
                                </span>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Downloads</p>
                            <p className="text-5xl font-manrope font-bold text-primary tracking-tight">
                                {totalDownloads >= 1000
                                    ? `${(totalDownloads / 1000).toFixed(1)}k`
                                    : totalDownloads.toLocaleString()}
                            </p>
                            <p className="text-xs font-semibold text-muted-foreground/60 mt-4 flex items-center gap-1.5 uppercase tracking-tighter">
                                <RadioIcon className="size-3" /> Across all platforms
                            </p>
                        </>
                    )}
                </div>

                {/* Total Episodes */}
                <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)] border border-border group hover:border-primary/20 transition-colors">
                    {statsLoading ? (
                        <StatSkeleton />
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Mic2Icon className="size-5 text-primary" />
                                </div>
                                <span className="flex items-center text-[10px] font-bold text-primary px-2.5 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
                                    Active
                                </span>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Episodes</p>
                            <p className="text-5xl font-manrope font-bold text-primary tracking-tight">{totalEpisodes}</p>
                            <p className="text-xs font-semibold text-muted-foreground/60 mt-4 flex items-center gap-1.5 uppercase tracking-tighter">
                                <CheckIcon className="size-3" /> Synced and indexed
                            </p>
                        </>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RSS Feed & Quick Info (1 column) */}
                <div className="lg:col-span-1 space-y-8">
                    {/* RSS Feed Component */}
                    <div className="bg-surface-container-lowest shadow-[0px_12px_24px_rgba(25,28,30,0.04)] rounded-3xl p-6 border border-border overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <Rss className="size-5 text-primary" />
                            <h3 className="text-lg font-manrope font-bold text-primary tracking-tight">RSS Feed</h3>
                        </div>
                        
                        <p className="text-xs font-medium text-muted-foreground mb-4">Your public podcast feed URL:</p>
                        
                        <div className="relative group/rss">
                            <div className="bg-surface-container-low p-4 rounded-xl text-[13px] font-mono text-primary/80 break-all border border-border/50 group-hover/rss:border-primary/30 transition-colors mb-4">
                                {channel.rss_feed_url}
                            </div>
                            <button
                                onClick={() => copyToClipboard(channel.rss_feed_url)}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground hover:shadow-lg hover:-translate-y-0.5'}`}
                            >
                                {copied ? <><CheckIcon className="size-4" /> Copied!</> : <><CopyIcon className="size-4" /> Copy RSS URL</>}
                            </button>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
                            <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-border/20">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Language</span>
                                <span className="text-xs font-bold text-primary uppercase">{channel.language || 'EN-US'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-border/20">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Category</span>
                                <span className="text-xs font-bold text-primary uppercase">{channel.category || 'Leisure'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-low rounded-3xl p-6 text-center border border-border/50">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Project ID</p>
                        <code className="text-[10px] text-primary/40 break-all">{projectId}</code>
                    </div>
                </div>

                {/* Recent Episodes (2 columns) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-surface-container-lowest shadow-[0px_12px_24px_rgba(25,28,30,0.04)] rounded-3xl p-8 border border-border">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-surface-container border border-border rounded-lg">
                                    <Mic2Icon className="size-5 text-primary" />
                                </div>
                                <h3 className="text-2xl font-manrope font-bold text-primary tracking-tight">Recent Episodes</h3>
                            </div>
                            <Link 
                                href={`/projects/${projectId}/episodes`} 
                                className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors uppercase tracking-widest"
                            >
                                View All <ArrowRightIcon className="size-3" />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {episodesLoading ? (
                                [1, 2, 3].map(i => <EpisodeSkeleton key={i} />)
                            ) : recentEpisodes.length > 0 ? (
                                recentEpisodes.map(episode => (
                                    <Link 
                                        key={episode.id} 
                                        href={`/projects/${projectId}/episodes`}
                                        className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0 hover:bg-surface-container-low/50 -mx-4 px-4 rounded-2xl transition-all group"
                                    >
                                        <div className="size-14 rounded-xl bg-surface-container-low overflow-hidden border border-border/50 shrink-0 shadow-sm relative">
                                            {episode.thumbnail_url ? (
                                                <img src={episode.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Mic2Icon className="size-6 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-primary line-clamp-1 group-hover:text-accent transition-colors">{episode.title}</h4>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/80">
                                                    <CalendarIcon className="size-3" />
                                                    {episode.pub_date ? format(new Date(episode.pub_date), 'MMM d, yyyy') : 'Unpublished'}
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/80">
                                                    <ClockIcon className="size-3" />
                                                    {episode.duration_formatted}
                                                </span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest ${
                                                    episode.processing_status === 'done' ? 'bg-success/10 text-success' : 
                                                    episode.processing_status === 'failed' ? 'bg-destructive/10 text-destructive' : 
                                                    'bg-accent/10 text-accent'
                                                }`}>
                                                    {episode.processing_status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-surface-container border border-border/50 text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-all opacity-0 md:opacity-100 translate-x-4 md:group-hover:translate-x-0 group-hover:opacity-100">
                                            <ArrowRightIcon className="size-4" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="py-12 text-center border-2 border-dashed border-border rounded-3xl">
                                    <Mic2Icon className="size-10 mx-auto mb-4 text-muted-foreground/30" />
                                    <p className="text-sm font-semibold text-muted-foreground">No episodes yet.</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1 mb-6">Upload your first video to get started.</p>
                                    <Button asChild variant="outline" size="sm" className="rounded-xl font-bold">
                                        <Link href={`/projects/${projectId}/episodes/new`}>Create Episode</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
