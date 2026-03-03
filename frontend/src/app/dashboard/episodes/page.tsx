"use client"

import React, { useState } from 'react';
import { MOCK_EPISODES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayIcon, Share2Icon, MoreVerticalIcon, CalendarIcon, ClockIcon, PlusIcon, BarChart2Icon, SearchIcon, Edit3Icon, LayoutDashboardIcon, Mic2Icon, X } from 'lucide-react';

export default function EpisodesPage() {
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);

  return (
    <div className="max-w-7xl mx-auto">
      {selectedEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-10 max-w-2xl w-full shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] dark:shadow-[32px_32px_0px_0px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h4 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedEpisode.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-4">Episode Analytics</p>
              </div>
              <button 
                onClick={() => setSelectedEpisode(null)}
                className="p-3 border-4 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
              >
                <X/>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="p-8 border-4 border-black dark:border-white bg-slate-50 dark:bg-slate-900">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Total Downloads</p>
                <p className="text-5xl font-black tracking-tighter">{selectedEpisode.downloads.toLocaleString()}</p>
              </div>
              <div className="p-8 border-4 border-black dark:border-white bg-slate-50 dark:bg-slate-900">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Performance</p>
                <p className="text-5xl font-black tracking-tighter">{selectedEpisode.trend}</p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-end">
                <p className="text-xs font-black uppercase tracking-[0.2em]">Completion Rate</p>
                <p className="text-lg font-black">84%</p>
              </div>
              <div className="h-6 border-4 border-black dark:border-white bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-black dark:bg-white w-[84%]" />
              </div>
            </div>

            <button 
              onClick={() => setSelectedEpisode(null)}
              className="w-full py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-sm hover:invert transition-all"
            >
              Close Analytics
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-8 border-b-4 border-black dark:border-white pb-8">
        <div>
          <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">Episodes</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">Manage and publish your podcast episodes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-6 md:mt-0">
          <div className="flex-1 sm:flex-none relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 md:size-5" />
            <input 
              type="text" 
              placeholder="Search episodes..." 
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
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-right">Trend</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black dark:divide-white">
              {MOCK_EPISODES.map((episode) => (
                <tr key={episode.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-6 md:px-8 py-6 md:py-10">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="size-12 md:size-16 shrink-0 bg-white dark:bg-black border-4 border-black dark:border-white flex items-center justify-center">
                        <Mic2Icon className="size-5 md:size-6" />
                      </div>
                      <span className="font-black uppercase tracking-tight text-lg md:text-2xl line-clamp-2">{episode.title}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{episode.duration.replace('m ', 'M ').replace('s', 'S')}</td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{episode.publishDate}</td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-lg md:text-xl font-black text-right tracking-tighter whitespace-nowrap">{episode.downloads.toLocaleString()}</td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-right">
                    <span className={`inline-block text-[10px] md:text-xs font-black px-4 md:px-5 py-2 border-4 border-black dark:border-white whitespace-nowrap ${episode.trend.startsWith('-') ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-black dark:text-white'}`}>
                      {episode.trend}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-10 text-right">
                    <div className="flex justify-end gap-2 md:gap-4">
                      <button 
                        onClick={() => setSelectedEpisode(episode)}
                        className="p-3 md:p-4 border-4 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                      >
                        <LayoutDashboardIcon className="size-4 md:size-5" />
                      </button>
                      <button className="p-3 md:p-4 border-4 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                        <Edit3Icon className="size-4 md:size-5" />
                      </button>
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
