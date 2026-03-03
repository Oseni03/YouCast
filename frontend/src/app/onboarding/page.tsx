"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();
  const [steps, setSteps] = useState([
    { id: 'youtube', icon: 'smart_display', title: 'Connect YouTube Channel', desc: 'Authorize AudioSync to access your video uploads.', completed: false, loading: false },
    { id: 'rss', icon: 'podcasts', title: 'Set Up Podcast Feed', desc: 'Create your RSS feed and choose your cover art.', completed: false, loading: false },
  ]);

  const handleStepClick = (id: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === id && !step.completed && !step.loading) {
        return { ...step, loading: true };
      }
      return step;
    }));

    // Simulate a dummy flow
    setTimeout(() => {
      setSteps(prev => prev.map(step => {
        if (step.id === id) {
          return { ...step, loading: false, completed: true };
        }
        return step;
      }));
    }, 1500);
  };

  const allCompleted = steps.every(s => s.completed);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-black rounded-none border-4 border-white shadow-[32px_32px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
        <div className="p-16">
          <div className="flex items-center gap-6 mb-16">
            <div className="size-14 rounded-none bg-white flex items-center justify-center text-black border-2 border-white">
              <span className="material-symbols-outlined text-3xl">fact_check</span>
            </div>
            <span className="text-4xl font-black tracking-tighter uppercase text-white">AUDIOSYNC</span>
          </div>
          
          <div className="mb-16">
            <h2 className="text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase">
              GET YOUR PODCAST <br />
              <span className="bg-white text-black px-4">READY FOR THE WORLD.</span>
            </h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xl">
              COMPLETE THESE SIMPLE STEPS TO START SYNCING YOUR YOUTUBE CONTENT TO ALL MAJOR PODCAST PLATFORMS.
            </p>
          </div>
          
          <div className="space-y-8 mb-16">
            {steps.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleStepClick(item.id)}
                className={`flex items-start gap-8 p-8 rounded-none border-4 transition-all cursor-pointer relative overflow-hidden ${
                  item.completed 
                    ? 'bg-white/5 border-white' 
                    : 'bg-transparent border-white/20 hover:border-white'
                }`}
              >
                {item.loading && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white animate-pulse" />
                )}
                <div className={`size-20 rounded-none border-4 flex items-center justify-center transition-all ${
                  item.completed ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'
                }`}>
                  <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                </div>
                <div className="flex-1 text-left pt-2">
                  <h4 className={`text-2xl font-black mb-2 uppercase tracking-tight ${item.completed ? 'text-white' : 'text-white/60'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] leading-tight">
                    {item.loading ? 'Processing authorization...' : item.desc}
                  </p>
                </div>
                <div className={`size-12 rounded-none border-4 flex items-center justify-center transition-all ${
                  item.completed ? 'bg-white text-black border-white' : 'bg-transparent border-white/20'
                }`}>
                  {item.completed ? (
                    <span className="material-symbols-outlined text-3xl font-black">check</span>
                  ) : item.loading ? (
                    <div className="size-6 border-4 border-white border-t-transparent animate-spin" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          
          {allCompleted && (
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full py-8 bg-white text-black text-2xl font-black rounded-none hover:invert transition-all flex items-center justify-center gap-6 uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              Continue to Dashboard
              <span className="material-symbols-outlined text-3xl">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
