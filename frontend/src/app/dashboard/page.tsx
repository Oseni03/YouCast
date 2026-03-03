import React from 'react';
import { MOCK_FEEDS } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LucideView, Rss, TrendingUpIcon, UploadIcon } from 'lucide-react';

export default function DashboardPage() {
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

      <section className="mb-10">
        <div className="relative overflow-hidden rounded-none border-2 border-black bg-white dark:bg-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 w-full">
            <div className="w-12 h-12 rounded-none bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0">
              <LucideView/>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Connect your YouTube Channel</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl text-sm font-medium mt-1">Automatically sync your video uploads to your podcast feeds and reach a wider audience across Spotify, Apple, and Google.</p>
            </div>
          </div>
          <button className="w-full md:w-auto whitespace-nowrap px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-none font-black uppercase tracking-tighter hover:invert transition-all">
            Connect Channel
          </button>
        </div>
      </section>

      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black dark:border-white">
          <div className="bg-white dark:bg-black p-6 md:p-8 border-r border-b border-black dark:border-white">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Downloads</p>
              <span className="flex items-center text-[10px] font-black text-black dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-none border border-black dark:border-white">
                <TrendingUpIcon className="size-3 mr-1"/> 15%
              </span>
            </div>
            <p className="text-4xl font-black tracking-tighter">124.5k</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">vs. last month 108.2k</p>
          </div>
          <div className="bg-white dark:bg-black p-6 md:p-8 border-r border-b border-black dark:border-white">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Episodes (Month)</p>
              <span className="flex items-center text-[10px] font-black text-black dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-none border border-black dark:border-white">+2</span>
            </div>
            <p className="text-4xl font-black tracking-tighter">12</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Consistent schedule maintained</p>
          </div>
          <Button 
            asChild
            variant="ghost"
            className="block h-auto justify-start whitespace-normal bg-white dark:bg-black p-6 md:p-8 border-r border-b border-black dark:border-white text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group rounded-none"
          >
            <Link href="/dashboard/rss">
              <div className="flex justify-between items-start mb-4 w-full">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Platforms</p>
                <span className="flex items-center text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-none border border-black dark:border-white">Stable</span>
              </div>
              <p className="text-4xl font-black tracking-tighter">8</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase group-hover:text-black dark:group-hover:text-white transition-colors">All systems operational • View RSS</p>
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight">Active Feeds</h3>
          <button className="bg-black dark:bg-white text-white dark:text-black hover:invert px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all">Manage All</button>
        </div>
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-black text-white dark:bg-white dark:text-black border-b-4 border-black dark:border-white">
                <tr>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Podcast Name</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Last Updated</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-right">Subscribers</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black dark:divide-white">
                {MOCK_FEEDS.map((feed) => (
                  <tr key={feed.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-6 md:px-8 py-6 md:py-10">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="size-12 md:size-16 rounded-none bg-white dark:bg-black border-4 border-black dark:border-white shrink-0"></div>
                        <span className="font-black uppercase tracking-tight text-lg md:text-2xl line-clamp-2">{feed.name}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-10 border-l md:border-l-0 border-black/10 dark:border-white/10">
                      <span className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest whitespace-nowrap">
                        <span className={`w-3 h-3 rounded-none border border-black dark:border-white ${feed.status === 'Synced' ? 'bg-black dark:bg-white' : 'bg-transparent'}`}></span>
                        {feed.status}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-10 text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{feed.lastUpdated}</td>
                    <td className="px-6 md:px-8 py-6 md:py-10 text-lg md:text-xl font-black text-right tracking-tighter whitespace-nowrap">{feed.subscribers.toLocaleString()}</td>
                    <td className="px-6 md:px-8 py-6 md:py-10 text-right">
                      <button className="inline-flex items-center gap-2 px-5 md:px-6 py-3 border-4 border-black dark:border-white rounded-none text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all whitespace-nowrap">
                        <Rss className="size-4 md:size-5"/>
                        View RSS
                      </button>
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
