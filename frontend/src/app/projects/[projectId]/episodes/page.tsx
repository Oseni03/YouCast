'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayIcon, MoreVerticalIcon, PlusIcon, SearchIcon, Mic2Icon, LayoutDashboardIcon, X, RefreshCwIcon } from 'lucide-react';
import { useEpisodes } from '@/hooks/useEpisodes';
import { useRetryEpisode } from '@/hooks/useEpisodes';
import type { EpisodeListItem } from '@/lib/types';

const STATUS_LABELS: Record<EpisodeListItem['processing_status'], string> = {
    queued: 'Queued',
    processing: 'Processing',
    done: 'Ready',
    failed: 'Failed',
    skipped: 'Skipped',
};

const STATUS_COLORS: Record<EpisodeListItem['processing_status'], string> = {
    queued: 'bg-slate-100 dark:bg-slate-800',
    processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    done: 'bg-black text-white dark:bg-white dark:text-black',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    skipped: 'bg-slate-100 text-slate-500',
};

function SkeletonRow() {
    return (
        <tr className="border-b border-border animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <td key={i} className="px-6 md:px-8 py-6">
                    <div className="h-4 bg-muted rounded-md" />
                </td>
            ))}
        </tr>
    );
}

export default function EpisodesPage() {
    const { projectId } = useParams() as { projectId: string };
    const [selectedEpisode, setSelectedEpisode] = useState<EpisodeListItem | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const { data, isLoading, isError } = useEpisodes(
        debouncedSearch ? { search: debouncedSearch, channel: projectId } : { channel: projectId }
    );
    const retryMutation = useRetryEpisode();

    const episodes = data?.results ?? [];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Detail modal */}
            {selectedEpisode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest border border-border p-8 md:p-10 max-w-2xl w-full rounded-3xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h4 className="text-3xl font-manrope font-bold tracking-tight text-primary">{selectedEpisode.title}</h4>
                                <p className="text-muted-foreground text-sm font-medium mt-2">Episode Details</p>
                            </div>
                            <button
                                onClick={() => setSelectedEpisode(null)}
                                className="p-3 bg-surface-container-low hover:bg-surface-container-high text-muted-foreground hover:text-primary rounded-full transition-colors duration-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="p-6 bg-surface-container-low rounded-2xl">
                                <p className="text-sm font-semibold text-muted-foreground mb-2">Total Downloads</p>
                                <p className="text-4xl font-manrope font-bold text-primary">{selectedEpisode.download_count.toLocaleString()}</p>
                            </div>
                            <div className="p-6 bg-surface-container-low rounded-2xl">
                                <p className="text-sm font-semibold text-muted-foreground mb-2">Status</p>
                                <p className="text-2xl font-manrope font-bold text-primary">{STATUS_LABELS[selectedEpisode.processing_status]}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 bg-surface-container-low rounded-2xl p-6">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-muted-foreground">Duration</span><span className="text-primary">{selectedEpisode.duration_formatted || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-muted-foreground">Format</span><span className="text-primary">{selectedEpisode.audio_format || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-muted-foreground">Published</span>
                                <span className="text-primary">{selectedEpisode.pub_date ? new Date(selectedEpisode.pub_date).toLocaleDateString() : '—'}</span>
                            </div>
                        </div>

                        {selectedEpisode.processing_status === 'failed' && (
                            <button
                                onClick={() => retryMutation.mutate(selectedEpisode.id)}
                                disabled={retryMutation.isPending}
                                className="w-full py-4 mb-4 bg-surface-container-high text-primary font-semibold text-sm rounded-xl hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCwIcon className="w-4 h-4" />
                                {retryMutation.isPending ? 'Queuing…' : 'Retry Processing'}
                            </button>
                        )}

                        <button
                            onClick={() => setSelectedEpisode(null)}
                            className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-primary-foreground font-semibold text-sm rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-8 pb-6">
                <div>
                    <h2 className="text-3xl font-manrope font-bold text-primary tracking-tight">Episodes</h2>
                    <p className="text-muted-foreground mt-2 font-medium text-sm">
                        {isLoading ? 'Loading…' : `${data?.count ?? 0} episode${(data?.count ?? 0) !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-6 md:mt-0">
                    <div className="flex-1 sm:flex-none relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search episodes…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full sm:w-64 md:w-80 bg-surface-container-lowest border-none px-12 py-3 rounded-xl text-sm font-medium text-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/60 transition-all duration-200"
                        />
                    </div>
                    <Button
                        asChild
                        className="w-full sm:w-auto h-auto px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        <Link href={`/projects/${projectId}/episodes/new`}>
                            <PlusIcon className="w-5 h-5" />
                            New Episode
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="bg-surface-container-lowest border border-border overflow-hidden rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-surface-container-low text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 md:px-8 py-5 text-xs font-semibold uppercase tracking-wider">Episode</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-semibold uppercase tracking-wider">Duration</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-semibold uppercase tracking-wider">Published</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-semibold uppercase tracking-wider text-right">Downloads</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading && [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}

                            {isError && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-sm font-medium text-muted-foreground">
                                        Failed to load episodes. Is the backend running?
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && episodes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {debouncedSearch ? `No episodes matching "${debouncedSearch}"` : 'No episodes yet'}
                                        </p>
                                    </td>
                                </tr>
                            )}

                            {episodes.map((episode) => (
                                <tr key={episode.id} className="hover:bg-surface-container-low/50 transition-colors">
                                    <td className="px-6 md:px-8 py-5 md:py-6">
                                        <div className="flex items-center gap-4">
                                            {episode.thumbnail_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={episode.thumbnail_url}
                                                    alt={episode.title}
                                                    className="size-12 rounded-xl object-cover shadow-sm bg-surface-container-low"
                                                />
                                            ) : (
                                                <div className="size-12 rounded-xl bg-surface-container-low shadow-sm flex items-center justify-center text-muted-foreground">
                                                    <Mic2Icon className="size-5" />
                                                </div>
                                            )}
                                            <span className="font-semibold text-primary text-base line-clamp-2">{episode.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-5 md:py-6 text-sm font-medium text-muted-foreground whitespace-nowrap">
                                        {episode.duration_formatted || '—'}
                                    </td>
                                    <td className="px-6 md:px-8 py-5 md:py-6 text-sm font-medium text-muted-foreground whitespace-nowrap">
                                        {episode.pub_date ? new Date(episode.pub_date).toLocaleDateString() : new Date(episode.youtube_pub_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 md:px-8 py-5 md:py-6 text-base font-semibold text-primary text-right whitespace-nowrap">
                                        {episode.download_count.toLocaleString()}
                                    </td>
                                    <td className="px-6 md:px-8 py-5 md:py-6">
                                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-md whitespace-nowrap ${STATUS_COLORS[episode.processing_status]}`}>
                                            {STATUS_LABELS[episode.processing_status]}
                                        </span>
                                    </td>
                                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                                        <div className="flex justify-end gap-2 text-muted-foreground">
                                            <button
                                                onClick={() => setSelectedEpisode(episode)}
                                                className="p-2 hover:bg-surface-container hover:text-primary rounded-xl transition-colors duration-200"
                                                title="View details"
                                            >
                                                <LayoutDashboardIcon className="size-5" />
                                            </button>
                                            {episode.audio_url && (
                                                <a
                                                    href={episode.audio_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-surface-container hover:text-primary rounded-xl transition-colors duration-200"
                                                    title="Play audio"
                                                >
                                                    <PlayIcon className="size-5" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
