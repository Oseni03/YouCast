'use client';

import React, { useState, useEffect } from 'react';
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
    <tr className="border-b-4 border-black dark:border-white animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-6 md:px-8 py-8">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded" />
        </td>
      ))}
    </tr>
  );
}

export default function EpisodesPage() {
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeListItem | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError } = useEpisodes(
    debouncedSearch ? { search: debouncedSearch } : {}
  );
  const retryMutation = useRetryEpisode();

  const episodes = data?.results ?? [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Detail modal */}
      {selectedEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-10 max-w-2xl w-full shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] dark:shadow-[32px_32px_0px_0px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h4 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedEpisode.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-4">Episode Details</p>
              </div>
              <button
                onClick={() => setSelectedEpisode(null)}
                className="p-3 border-4 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="p-8 border-4 border-black dark:border-white bg-slate-50 dark:bg-slate-900">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Total Downloads</p>
                <p className="text-5xl font-black tracking-tighter">{selectedEpisode.download_count.toLocaleString()}</p>
              </div>
              <div className="p-8 border-4 border-black dark:border-white bg-slate-50 dark:bg-slate-900">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Status</p>
                <p className="text-3xl font-black tracking-tighter uppercase">{STATUS_LABELS[selectedEpisode.processing_status]}</p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span>Duration</span><span>{selectedEpisode.duration_formatted || '—'}</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span>Format</span><span>{selectedEpisode.audio_format || '—'}</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span>Published</span>
                <span>{selectedEpisode.pub_date ? new Date(selectedEpisode.pub_date).toLocaleDateString() : '—'}</span>
              </div>
            </div>

            {selectedEpisode.processing_status === 'failed' && (
              <button
                onClick={() => retryMutation.mutate(selectedEpisode.id)}
                disabled={retryMutation.isPending}
                className="w-full py-4 mb-4 border-4 border-black dark:border-white font-black uppercase tracking-[0.2em] text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCwIcon className="size-4" />
                {retryMutation.isPending ? 'Queuing…' : 'Retry Processing'}
              </button>
            )}

            <button
              onClick={() => setSelectedEpisode(null)}
              className="w-full py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-sm hover:invert transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-8 border-b-4 border-black dark:border-white pb-8">
        <div>
          <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">Episodes</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">
            {isLoading ? 'Loading…' : `${data?.count ?? 0} episode${(data?.count ?? 0) !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-6 md:mt-0">
          <div className="flex-1 sm:flex-none relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 md:size-5" />
            <input
              type="text"
              placeholder="Search episodes…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-64 md:w-80 bg-slate-100 dark:bg-slate-900 border-2 border-black dark:border-white px-10 md:px-12 py-3 lg:py-4 rounded-none text-[10px] md:text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-0 placeholder:text-slate-400"
            />
          </div>
          <Button
            asChild
            className="w-full sm:w-auto h-auto px-6 lg:px-8 py-3 lg:py-4 bg-black dark:bg-white text-white dark:text-black hover:invert transition-all rounded-none text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 flex-1"
          >
            <Link href="/dashboard/episodes/new">
              <PlusIcon className="size-4 md:size-5" />
              New Episode
            </Link>
          </Button>
        </div>
      </header>

      <div className="h-1 bg-black dark:bg-white mb-10 md:mb-16 hidden md:block" />

      <div className="bg-white dark:bg-black border-4 border-black dark:border-white overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[24px_24px_0px_0px_rgba(255,255,255,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-black text-white dark:bg-white dark:text-black border-b-4 border-black dark:border-white">
              <tr>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Episode</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Duration</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Published</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-right">Downloads</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black dark:divide-white">
              {isLoading && [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}

              {isError && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                    Failed to load episodes. Is the backend running?
                  </td>
                </tr>
              )}

              {!isLoading && !isError && episodes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {debouncedSearch ? `No episodes matching "${debouncedSearch}"` : 'No episodes yet'}
                    </p>
                  </td>
                </tr>
              )}

              {episodes.map((episode) => (
                <tr key={episode.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-6 md:px-8 py-6 md:py-10">
                    <div className="flex items-center gap-4 md:gap-6">
                      {episode.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={episode.thumbnail_url}
                          alt={episode.title}
                          className="size-12 md:size-16 shrink-0 object-cover border-4 border-black dark:border-white"
                        />
                      ) : (
                        <div className="size-12 md:size-16 shrink-0 bg-white dark:bg-black border-4 border-black dark:border-white flex items-center justify-center">
                          <Mic2Icon className="size-5 md:size-6" />
                        </div>
                      )}
                      <span className="font-black uppercase tracking-tight text-lg md:text-2xl line-clamp-2">{episode.title}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {episode.duration_formatted || '—'}
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {episode.pub_date ? new Date(episode.pub_date).toLocaleDateString() : new Date(episode.youtube_pub_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-lg md:text-xl font-black text-right tracking-tighter whitespace-nowrap">
                    {episode.download_count.toLocaleString()}
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-10">
                    <span className={`inline-block text-[10px] md:text-xs font-black px-4 py-2 border-4 border-black dark:border-white whitespace-nowrap uppercase tracking-widest ${STATUS_COLORS[episode.processing_status]}`}>
                      {STATUS_LABELS[episode.processing_status]}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-right">
                    <div className="flex justify-end gap-2 md:gap-4">
                      <button
                        onClick={() => setSelectedEpisode(episode)}
                        className="p-3 md:p-4 border-4 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                        title="View details"
                      >
                        <LayoutDashboardIcon className="size-4 md:size-5" />
                      </button>
                      {episode.audio_url && (
                        <a
                          href={episode.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 md:p-4 border-4 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                          title="Play audio"
                        >
                          <PlayIcon className="size-4 md:size-5" />
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
