import { CopyIcon, Settings2 } from 'lucide-react';
import React from 'react';

export default function RSSPage() {
  const feeds = [
    { platform: 'Spotify', url: 'https://audiosync.io/rss/spotify/alex-rivers', status: 'Active' },
    { platform: 'Apple Podcasts', url: 'https://audiosync.io/rss/apple/alex-rivers', status: 'Active' },
    { platform: 'Google Podcasts', url: 'https://audiosync.io/rss/google/alex-rivers', status: 'Active' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 md:mb-12 border-b-4 border-black dark:border-white pb-8">
        <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">RSS Feeds</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">Manage your podcast distribution endpoints</p>
      </header>

      <div className="space-y-8">
        <section className="bg-white dark:bg-black p-6 md:p-8 rounded-none border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Active Feeds</h3>
            <button className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-none text-xs font-black uppercase tracking-widest hover:invert transition-all">
              Generate New Feed
            </button>
          </div>

          <div className="space-y-6">
            {feeds.map((feed, i) => (
              <div key={i} className="p-6 border-2 border-black dark:border-white bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-black uppercase tracking-tight">{feed.platform}</span>
                    <span className="text-[8px] px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest">
                      {feed.status}
                    </span>
                  </div>
                  <code className="text-xs font-mono text-slate-500 break-all">{feed.url}</code>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                    <CopyIcon/>
                  </button>
                  <button className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                    <Settings2/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-black p-8 rounded-none border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Feed Settings</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Global RSS Prefix</label>
              <div className="flex flex-col sm:flex-row">
                <span className="inline-flex items-center px-4 py-3 sm:py-0 border-2 border-b-0 sm:border-b-2 sm:border-r-0 border-black dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold overflow-hidden">
                  audiosync.io/rss/
                </span>
                <input 
                  type="text" 
                  className="flex-1 rounded-none border-2 border-black dark:border-white dark:bg-black focus:ring-0 focus:border-black text-sm p-4 font-bold uppercase w-full" 
                  defaultValue="alex-rivers" 
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-2 border-black dark:border-white bg-slate-50 dark:bg-slate-900">
              <div>
                <p className="text-xs font-black uppercase tracking-tight">Auto-Update Metadata</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sync YouTube descriptions to RSS feed automatically</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border-2 after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
