'use client';

import React from 'react';
import { CalendarCheck2Icon, ExpandIcon, PlayCircleIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { useOverviewStats, useEpisodeStats } from '@/hooks/useAnalytics';

// Stat card skeleton
function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-black p-8 border-r border-b border-black dark:border-white animate-pulse">
      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 mb-4 rounded" />
      <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );
}

function EpisodeRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-8 py-6">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded" />
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
  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: episodeStats, isLoading: episodesLoading, isError: episodesError } = useEpisodeStats();

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
      label: 'Total Episodes',
      value: stats?.total_episodes ?? '—',
      icon: <TrendingUpIcon />,
    },
    {
      label: 'Connected Channels',
      value: stats?.total_channels ?? '—',
      icon: <TrendingUpIcon />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 md:gap-4 mb-8 md:mb-12 border-b-4 border-black dark:border-white pb-8">
        <div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none mb-2 md:mb-0">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">Real-time performance insights</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1 sm:flex-none justify-center bg-white dark:bg-black border-2 border-black dark:border-white rounded-none px-4 lg:px-6 py-3 lg:py-4 flex items-center gap-2 lg:gap-3 cursor-pointer shadow-none hover:invert transition-all whitespace-nowrap">
            <CalendarCheck2Icon className="size-4 md:size-5" />
            <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">All Time</span>
            <ExpandIcon className="size-4 md:size-5" />
          </div>
        </div>
      </div>

      {/* Overview stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black dark:border-white mb-12">
        {statsLoading
          ? [1, 2, 3].map((i) => <StatSkeleton key={i} />)
          : metricCards.map((card, i) => (
              <div key={i} className="bg-white dark:bg-black p-8 border-r border-b border-black dark:border-white">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{card.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-black tracking-tighter">{card.value}</h3>
                  <span className="text-[10px] font-black flex items-center gap-1 uppercase tracking-widest">{card.icon}</span>
                </div>
              </div>
            ))}
      </div>

      {/* Download chart (static placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        <div className="lg:col-span-2 bg-white dark:bg-black p-8 rounded-none border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-xl uppercase tracking-tight">Downloads Over Time</h4>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-black dark:border-white px-3 py-1">Chart coming soon</span>
          </div>
          <div className="h-64 flex items-center justify-center text-slate-300 dark:text-slate-700 border-4 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Timeseries chart will appear here</p>
          </div>
        </div>

        <div className="bg-white dark:bg-black p-8 rounded-none border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <h4 className="font-black text-xl uppercase tracking-tight mb-8">Geography</h4>
          <div className="relative h-32 w-full bg-slate-100 dark:bg-slate-900 rounded-none mb-8 border-2 border-black dark:border-white flex items-center justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coming soon</p>
          </div>
          {/* <ul className="space-y-6">
            {[
              { flag: '🇺🇸', name: 'United States', val: '42%' },
              { flag: '🇬🇧', name: 'United Kingdom', val: '18%' },
              { flag: '🇨🇦', name: 'Canada', val: '12%' },
              { flag: '🇩🇪', name: 'Germany', val: '8%' },
            ].map(item => (
              <li key={item.name} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.flag}</span>
                  <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black tracking-tighter">{item.val}</span>
              </li>
            ))}
          </ul> */}
        </div>
      </div>

      {/* Top episodes table */}
      <div className="bg-white dark:bg-black rounded-none border-4 border-black dark:border-white overflow-hidden">
        <div className="p-8 border-b-4 border-black dark:border-white flex justify-between items-center bg-black text-white dark:bg-white dark:text-black">
          <h4 className="font-black text-xl uppercase tracking-widest">Top Episodes by Downloads</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900 border-b-2 border-black dark:border-white">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Episode Title</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Published</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black dark:divide-white">
              {episodesLoading && [1, 2, 3, 4].map((i) => <EpisodeRowSkeleton key={i} />)}

              {episodesError && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                    Failed to load episode stats.
                  </td>
                </tr>
              )}

              {!episodesLoading && !episodesError && (episodeStats ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                    No episodes yet
                  </td>
                </tr>
              )}

              {(episodeStats ?? []).map((ep) => (
                <tr key={ep.id} className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-none bg-black dark:bg-white flex items-center justify-center text-white dark:text-black border border-black dark:border-white">
                        <PlayCircleIcon />
                      </div>
                      <p className="text-sm font-black uppercase tracking-tight">{ep.title}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {ep.pub_date ? new Date(ep.pub_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-8 py-6 text-sm font-black tracking-tighter">{ep.download_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
