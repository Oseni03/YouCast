'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Rss, TrendingUpIcon, UploadIcon } from 'lucide-react';
import { useChannel } from '@/hooks/useChannels';
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

export default function ProjectDashboardPage() {
  const { projectId } = useParams() as { projectId: string };
  const { data: channel, isLoading: channelLoading, isError: channelError } = useChannel(projectId);
  const { data: stats, isLoading: statsLoading } = useOverviewStats({ channel: projectId });

  const totalDownloads = stats?.total_downloads ?? 0;
  const totalEpisodes = stats?.total_episodes ?? 0;

  if (channelLoading) {
     return <div className="p-8"><StatSkeleton /></div>;
  }
  
  if (channelError || !channel) {
     return <div className="p-8 text-center text-red-500 font-bold uppercase tracking-widest">Failed to load project details.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">{channel.podcast_title || channel.channel_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">Project Overview</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button
            asChild
            className="w-full sm:w-auto h-auto flex items-center justify-center gap-2 px-6 lg:px-8 py-3 lg:py-4 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white rounded-none text-[10px] lg:text-xs font-black uppercase tracking-widest hover:invert transition-all flex-1"
          >
            <Link href={`/projects/${projectId}/episodes/new`}>
              <UploadIcon className="size-4 md:size-5" />
              New Episode
            </Link>
          </Button>
        </div>
      </header>

      {/* Stats */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-black dark:border-white">
          {/* Total Downloads */}
          <div className="bg-white dark:bg-black p-6 md:p-8 border-r border-b border-black dark:border-white">
            {statsLoading ? (
              <StatSkeleton />
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Downloads</p>
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
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Episodes</p>
                  <span className="flex items-center text-[10px] font-black text-black dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-none border border-black dark:border-white">
                    Live
                  </span>
                </div>
                <p className="text-4xl font-black tracking-tighter">{totalEpisodes}</p>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Project details card */}
      <section>
         <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Channel Configuration</h3>
            <div className="flex items-center gap-6">
                {channel.effective_artwork_url && (
                    <img
                        src={channel.effective_artwork_url}
                        alt="Artwork"
                        className="size-24 object-cover border-4 border-black dark:border-white"
                    />
                )}
                <div>
                   <p className="font-bold text-sm uppercase tracking-widest text-slate-500">RSS Feed URL</p>
                   <a href={channel.rss_feed_url} target="_blank" rel="noopener noreferrer" className="font-bold text-lg hover:underline mt-1 inline-flex items-center">
                     {channel.rss_feed_url} <Rss className="size-4 ml-2" />
                   </a>
                   <div className="mt-4">
                     <Link href={`/projects/${projectId}/settings`} className="text-xs uppercase font-black tracking-widest bg-black text-white px-4 py-2 hover:invert transition-all">Edit Settings</Link>
                   </div>
                </div>
            </div>
         </div>
      </section>
    </div>
  );
}
