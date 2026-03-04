'use client';

import React from 'react';
import { CopyIcon, Settings2, Rss } from 'lucide-react';
import { useChannels } from '@/hooks/useChannels';

function SkeletonFeedItem() {
  return (
    <div className="p-6 border-2 border-black dark:border-white bg-slate-50 dark:bg-slate-900 flex justify-between items-center gap-4 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export default function RSSPage() {
  const { data: channels, isLoading, isError } = useChannels();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 md:mb-12 border-b-4 border-black dark:border-white pb-8">
        <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">RSS Feeds</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">
          {isLoading ? 'Loading…' : `${channels?.length ?? 0} channel${(channels?.length ?? 0) !== 1 ? 's' : ''} connected`}
        </p>
      </header>

      <div className="space-y-8">
        <section className="bg-white dark:bg-black p-6 md:p-8 rounded-none border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Active Feeds</h3>
            <a
              href="/onboarding"
              className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-none text-xs font-black uppercase tracking-widest hover:invert transition-all text-center"
            >
              Connect New Channel
            </a>
          </div>

          <div className="space-y-6">
            {/* Loading */}
            {isLoading && [1, 2].map((i) => <SkeletonFeedItem key={i} />)}

            {/* Error */}
            {isError && (
              <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 py-12">
                Failed to load channels. Is the backend running?
              </p>
            )}

            {/* Empty */}
            {!isLoading && !isError && channels?.length === 0 && (
              <div className="py-16 text-center">
                <Rss className="size-12 mx-auto mb-6 text-slate-200 dark:text-slate-700" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">No RSS feeds yet</p>
                <a
                  href="/onboarding"
                  className="inline-block px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-xs hover:invert transition-all"
                >
                  Connect a Channel
                </a>
              </div>
            )}

            {/* Real channels */}
            {channels?.map((channel) => (
              <div key={channel.id} className="p-6 border-2 border-black dark:border-white bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-black uppercase tracking-tight">
                      {channel.podcast_title || channel.channel_title}
                    </span>
                    <span className={`text-[8px] px-2 py-0.5 font-black uppercase tracking-widest ${channel.monitoring_active ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-slate-200 text-slate-600'}`}>
                      {channel.monitoring_active ? 'Active' : 'Paused'}
                    </span>
                    <span className="text-[8px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 font-black uppercase tracking-widest">
                      {channel.episode_count} episodes
                    </span>
                  </div>
                  <code className="text-xs font-mono text-slate-500 break-all">{channel.rss_feed_url}</code>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(channel.rss_feed_url)}
                    title="Copy RSS URL"
                    className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  >
                    <CopyIcon className="size-4" />
                  </button>
                  <a
                    href={channel.rss_feed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open RSS feed"
                    className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  >
                    <Settings2 className="size-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feed settings (static – not yet connected to backend) */}
        <section className="bg-white dark:bg-black p-8 rounded-none border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Global Feed Settings</h3>
          <div className="flex items-center justify-between p-4 border-2 border-black dark:border-white bg-slate-50 dark:bg-slate-900">
            <div>
              <p className="text-xs font-black uppercase tracking-tight">Auto-Update Metadata</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sync YouTube descriptions to RSS feed automatically</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border-2 after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white" />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
