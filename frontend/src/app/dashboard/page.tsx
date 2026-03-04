'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LucideView, Rss, TrendingUpIcon, UploadIcon } from 'lucide-react';
import { useChannels } from '@/hooks/useChannels';
import { useOverviewStats } from '@/hooks/useAnalytics';

// ── Skeleton helpers ─────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-black p-6 md:p-8 border-r border-b border-black dark:border-white animate-pulse">
      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 mb-4 rounded" />
      <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 mt-2 rounded" />
    </div>
  );
}

function FeedRowSkeleton() {
  return (
    <tr className="border-b-4 border-black dark:border-white">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-6 md:px-8 py-6 md:py-10">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function DashboardPage() {
  const { data: channels, isLoading: channelsLoading, isError: channelsError } = useChannels();
  const { data: stats, isLoading: statsLoading } = useOverviewStats();

  const totalDownloads = stats?.total_downloads ?? 0;
  const totalEpisodes = stats?.total_episodes ?? 0;
  const totalChannels = stats?.total_channels ?? (channels?.length ?? 0);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">Manage your podcast feeds and sync your content across platforms.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button
            asChild
            className="w-full sm:w-auto h-auto flex items-center justify-center gap-2 px-6 lg:px-8 py-3 lg:py-4 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white rounded-none text-[10px] lg:text-xs font-black uppercase tracking-widest hover:invert transition-all flex-1"
          >
            <Link href="/dashboard/episodes/new">
              <UploadIcon className="size-4 md:size-5" />
              New Episode
            </Link>
          </Button>
        </div>
      </header>

      {/* Connect Channel CTA */}
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-none border-2 border-black bg-white dark:bg-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 w-full">
            <div className="w-12 h-12 rounded-none bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0">
              <LucideView />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Connect your YouTube Channel</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl text-sm font-medium mt-1">Automatically sync your video uploads to your podcast feeds and reach a wider audience across Spotify, Apple, and Google.</p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="w-full md:w-auto whitespace-nowrap px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-none font-black uppercase tracking-tighter hover:invert transition-all text-center"
          >
            Connect Channel
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black dark:border-white">
          {/* Total Downloads */}
          <div className="bg-white dark:bg-black p-6 md:p-8 border-r border-b border-black dark:border-white">
            {statsLoading ? (
              <StatSkeleton />
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Downloads</p>
                  <span className="flex items-center text-[10px] font-black text-black dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-none border border-black dark:border-white">
                    <TrendingUpIcon className="size-3 mr-1" /> Live
                  </span>
                </div>
                <p className="text-4xl font-black tracking-tighter">
                  {totalDownloads >= 1000
                    ? `${(totalDownloads / 1000).toFixed(1)}k`
                    : totalDownloads.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">All time</p>
              </>
            )}
          </div>

          {/* Total Episodes */}
          <div className="bg-white dark:bg-black p-6 md:p-8 border-r border-b border-black dark:border-white">
            {statsLoading ? (
              <StatSkeleton />
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Episodes</p>
                  <span className="flex items-center text-[10px] font-black text-black dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-none border border-black dark:border-white">
                    Live
                  </span>
                </div>
                <p className="text-4xl font-black tracking-tighter">{totalEpisodes}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Across all channels</p>
              </>
            )}
          </div>

          {/* Active Channels */}
          <Button
            asChild
            variant="ghost"
            className="block h-auto justify-start whitespace-normal bg-white dark:bg-black p-6 md:p-8 border-r border-b border-black dark:border-white text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group rounded-none"
          >
            <Link href="/dashboard/rss">
              <div className="flex justify-between items-start mb-4 w-full">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connected Channels</p>
                <span className="flex items-center text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-none border border-black dark:border-white">
                  {channelsLoading ? '—' : 'Live'}
                </span>
              </div>
              <p className="text-4xl font-black tracking-tighter">{totalChannels}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase group-hover:text-black dark:group-hover:text-white transition-colors">
                View RSS feeds →
              </p>
            </Link>
          </Button>
        </div>
      </section>

      {/* Active Feeds table */}
      <section>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight">Active Channels</h3>
          <Link
            href="/dashboard/rss"
            className="bg-black dark:bg-white text-white dark:text-black hover:invert px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all"
          >
            Manage All
          </Link>
        </div>

        <div className="bg-white dark:bg-black border-4 border-black dark:border-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-black text-white dark:bg-white dark:text-black border-b-4 border-black dark:border-white">
                <tr>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Channel</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Episodes</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-right">RSS Feed</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black dark:divide-white">
                {/* Loading */}
                {channelsLoading && [1, 2, 3].map((i) => <FeedRowSkeleton key={i} />)}

                {/* Error */}
                {channelsError && (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                      Failed to load channels. Is the backend running?
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!channelsLoading && !channelsError && channels?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">No channels connected yet</p>
                      <Link
                        href="/onboarding"
                        className="inline-block px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-xs hover:invert transition-all"
                      >
                        Connect a Channel
                      </Link>
                    </td>
                  </tr>
                )}

                {/* Real data */}
                {channels?.map((channel) => (
                  <tr key={channel.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-6 md:px-8 py-6 md:py-10">
                      <div className="flex items-center gap-4 md:gap-6">
                        {channel.effective_artwork_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={channel.effective_artwork_url}
                            alt={channel.channel_title}
                            className="size-12 md:size-16 rounded-none border-4 border-black dark:border-white object-cover shrink-0"
                          />
                        ) : (
                          <div className="size-12 md:size-16 rounded-none bg-white dark:bg-black border-4 border-black dark:border-white shrink-0" />
                        )}
                        <span className="font-black uppercase tracking-tight text-lg md:text-2xl line-clamp-2">
                          {channel.podcast_title || channel.channel_title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-10">
                      <span className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest whitespace-nowrap">
                        <span className={`w-3 h-3 rounded-none border border-black dark:border-white ${channel.monitoring_active ? 'bg-black dark:bg-white' : 'bg-transparent'}`} />
                        {channel.monitoring_active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-10 text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {channel.episode_count} episodes
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-10 text-right">
                      <a
                        href={channel.rss_feed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 md:px-6 py-3 border-4 border-black dark:border-white rounded-none text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all whitespace-nowrap"
                      >
                        <Rss className="size-4 md:size-5" />
                        View RSS
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
