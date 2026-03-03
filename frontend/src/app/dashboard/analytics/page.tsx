import React from 'react';
import { MOCK_METRICS, MOCK_EPISODES } from '@/lib/constants';
import { ArrowBigUpDash, ArrowUp01Icon, CalendarCheck2Icon, ExpandIcon, EyeIcon, PlayCircleIcon, TrendingDownIcon, TrendingUpDownIcon, TrendingUpIcon } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 md:gap-4 mb-8 md:mb-12 border-b-4 border-black dark:border-white pb-8">
        <div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none mb-2 md:mb-0">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest">Real-time performance insights</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1 sm:flex-none justify-center bg-white dark:bg-black border-2 border-black dark:border-white rounded-none px-4 lg:px-6 py-3 lg:py-4 flex items-center gap-2 lg:gap-3 cursor-pointer shadow-none hover:invert transition-all whitespace-nowrap">
            <CalendarCheck2Icon className="size-4 md:size-5" />
            <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">Last 30 Days</span>
            <ExpandIcon className="size-4 md:size-5" />
          </div>
          <button className="flex-1 sm:flex-none bg-black dark:bg-white text-white dark:text-black px-4 lg:px-6 py-3 lg:py-4 rounded-none text-[10px] lg:text-xs font-black uppercase tracking-widest hover:invert transition-all whitespace-nowrap w-full sm:w-auto">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-black dark:border-white mb-12">
        {MOCK_METRICS.map((metric, i) => (
          <div key={i} className="bg-white dark:bg-black p-8 border-r border-b border-black dark:border-white shadow-none">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{metric.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black tracking-tighter">{metric.value}</h3>
              <span className="text-[10px] font-black flex items-center gap-1 uppercase tracking-widest">
                  {metric.trendDirection === "up" ? <TrendingUpIcon/> : <TrendingDownIcon/>}
                {metric.trend}
              </span>
            </div>
            <div className="mt-6 h-2 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden border border-black dark:border-white">
              <div className="h-full bg-black dark:bg-white" style={{ width: `${metric.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        <div className="lg:col-span-2 bg-white dark:bg-black p-8 rounded-none border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-xl uppercase tracking-tight">Downloads</h4>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="size-3 rounded-none bg-black dark:bg-white"></span> Current
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="size-3 rounded-none border-2 border-black dark:border-white"></span> Previous
              </span>
            </div>
          </div>
          <div className="h-64 flex flex-col justify-between">
            <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 400 150" width="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 109C15 109 15 21 30 21C45 21 45 41 60 41C75 41 75 93 90 93C105 93 105 33 120 33C135 33 135 101 150 101C165 101 165 61 180 61C195 61 195 45 210 45C225 45 225 121 240 121C255 121 255 149 270 149C285 149 285 1 300 1C315 1 315 81 330 81C345 81 345 129 360 129C375 129 375 25 400 25V149H0V109Z" fill="url(#chart_grad)"></path>
              <path d="M0 109C15 109 15 21 30 21C45 21 45 41 60 41C75 41 75 93 90 93C105 93 105 33 120 33C135 33 135 101 150 101C165 101 165 61 180 61C195 61 195 45 210 45C225 45 225 121 240 121C255 121 255 149 270 149C285 149 285 1 300 1C315 1 315 81 330 81C345 81 345 129 360 129C375 129 375 25 400 25" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
              <defs>
                <linearGradient id="chart_grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between mt-6 border-t border-black dark:border-white pt-4">
              {['OCT 1', 'OCT 7', 'OCT 14', 'OCT 21', 'OCT 30'].map(label => (
                <span key={label} className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black p-8 rounded-none border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
          <h4 className="font-black text-xl uppercase tracking-tight mb-8">Geography</h4>
          <div className="relative h-32 w-full bg-slate-100 dark:bg-slate-900 rounded-none mb-8 border-2 border-black dark:border-white flex items-center justify-center">
            <EyeIcon/>
          </div>
          <ul className="space-y-6">
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
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-none border-4 border-black dark:border-white shadow-none overflow-hidden">
        <div className="p-8 border-b-4 border-black dark:border-white flex justify-between items-center bg-black text-white dark:bg-white dark:text-black">
          <h4 className="font-black text-xl uppercase tracking-widest">Top Episodes</h4>
          <button className="text-xs font-black uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900 border-b-2 border-black dark:border-white">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Episode Title</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Publish Date</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Downloads</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black dark:divide-white">
              {MOCK_EPISODES.map((episode) => (
                <tr key={episode.id} className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-none bg-black dark:bg-white flex items-center justify-center text-white dark:text-black border border-black dark:border-white">
                        <PlayCircleIcon/>
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">{episode.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{episode.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{episode.publishDate}</td>
                  <td className="px-8 py-6 text-sm font-black tracking-tighter">{episode.downloads.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black flex items-center gap-1 uppercase tracking-widest">
                        {episode.trend.startsWith('+') ? <TrendingUpIcon/> : episode.trend === '0%' ? <TrendingUpDownIcon/> : <TrendingDownIcon/>}
                      {episode.trend}
                    </span>
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
