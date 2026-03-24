'use client';

import React from 'react';
import { CalendarCheck2Icon, ExpandIcon, PlayCircleIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useOverviewStats, useEpisodeStats } from '@/hooks/useAnalytics';

function StatSkeleton() {
    return (
        <div className="bg-surface-container-lowest p-8 border border-border rounded-3xl animate-pulse shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
            <div className="h-3 w-24 bg-surface-container-high mb-4 rounded" />
            <div className="h-8 w-20 bg-surface-container-high rounded" />
        </div>
    );
}

function EpisodeRowSkeleton() {
    return (
        <tr className="animate-pulse border-b border-border/50">
            {[1, 2, 3].map((i) => (
                <td key={i} className="px-8 py-6">
                    <div className="h-4 bg-surface-container-high rounded" />
                </td>
            ))}
        </tr>
    );
}

interface MetricCard {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}

export default function AnalyticsPage() {
    const { projectId } = useParams() as { projectId: string };
    const { data: stats, isLoading: statsLoading } = useOverviewStats({ channel: projectId });
    const { data: episodeStats, isLoading: episodesLoading, isError: episodesError } = useEpisodeStats({ channel: projectId });

    const metricCards: MetricCard[] = [
        {
            label: 'Total Downloads',
            value: stats
                ? stats.total_downloads >= 1000
                    ? `${(stats.total_downloads / 1000).toFixed(1)}k`
                    : stats.total_downloads.toLocaleString()
                : '—',
            icon: <TrendingUpIcon />,
        },
        {
            label: 'Project Episodes',
            value: stats?.total_episodes ?? '—',
            icon: <TrendingUpIcon />,
        },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 md:gap-4 mb-8 md:mb-12 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-manrope font-bold text-primary tracking-tight mb-1 md:mb-0">Analytics</h1>
                    <p className="text-muted-foreground mt-2 font-medium text-sm">Real-time performance insights</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex-1 sm:flex-none justify-center bg-surface-container-low hover:bg-surface-container-high text-primary rounded-xl px-4 lg:px-6 py-3 flex items-center gap-2 cursor-pointer transition-colors duration-200 whitespace-nowrap">
                        <CalendarCheck2Icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">All Time</span>
                        <ExpandIcon className="w-4 h-4 ml-1 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Overview stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {statsLoading
                    ? [1, 2, 3].map((i) => <StatSkeleton key={i} />)
                    : metricCards.map((card, i) => (
                        <div key={i} className="bg-surface-container-lowest p-8 border border-border rounded-3xl shadow-[0px_12px_24px_rgba(25,28,30,0.04)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-primary group-hover:scale-110 transition-transform duration-500">
                                {React.cloneElement(card.icon as React.ReactElement<{ className?: string }>, { className: 'w-24 h-24' })}
                            </div>
                            <p className="text-muted-foreground text-sm font-semibold mb-3">{card.label}</p>
                            <div className="flex items-end justify-between relative z-10">
                                <h3 className="text-4xl font-manrope font-bold tracking-tight text-primary">{card.value}</h3>
                                <span className="text-primary/60 flex items-center gap-1 p-2 bg-primary/5 rounded-xl">
                                    {React.cloneElement(card.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                                </span>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Download chart (static placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl border border-border shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h4 className="font-manrope font-bold text-xl text-primary tracking-tight">Downloads Over Time</h4>
                        <span className="text-xs font-semibold text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">Chart coming soon</span>
                    </div>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface-container-lowest">
                        <p className="text-sm font-medium text-muted-foreground">Timeseries chart will appear here</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-3xl border border-border shadow-[0px_12px_24px_rgba(25,28,30,0.04)]">
                    <h4 className="font-manrope font-bold text-xl text-primary tracking-tight mb-8">Geography</h4>
                    <div className="relative h-40 w-full bg-surface-container-low rounded-2xl mb-8 flex items-center justify-center border border-border/50">
                        <p className="text-sm font-medium text-muted-foreground">Coming soon</p>
                    </div>
                </div>
            </div>

            {/* Top episodes table */}
            <div className="bg-surface-container-lowest rounded-3xl border border-border overflow-hidden shadow-[0px_12px_24px_rgba(25,28,30,0.04)] hidden md:block">
                <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-surface-container-low">
                    <h4 className="font-manrope font-bold text-xl text-primary tracking-tight">Top Episodes by Downloads</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low/50 border-b border-border">
                            <tr>
                                <th className="px-8 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Episode Title</th>
                                <th className="px-8 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Published</th>
                                <th className="px-8 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Downloads</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {episodesLoading && [1, 2, 3, 4].map((i) => <EpisodeRowSkeleton key={i} />)}

                            {episodesError && (
                                <tr>
                                    <td colSpan={3} className="px-8 py-12 text-center text-sm font-medium text-muted-foreground">
                                        Failed to load episode stats.
                                    </td>
                                </tr>
                            )}

                            {!episodesLoading && !episodesError && (episodeStats ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-8 py-12 text-center text-sm font-medium text-muted-foreground">
                                        No episodes yet
                                    </td>
                                </tr>
                            )}

                            {(episodeStats ?? []).map((ep) => (
                                <tr key={ep.id} className="hover:bg-surface-container-low/50 transition-colors duration-200 group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm border border-primary/10">
                                                <PlayCircleIcon className="w-5 h-5 ml-0.5" />
                                            </div>
                                            <p className="text-sm font-semibold text-primary">{ep.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-muted-foreground">
                                        {ep.pub_date ? new Date(ep.pub_date).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-8 py-5 text-base font-semibold text-primary text-right">{ep.download_count.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
