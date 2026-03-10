"use client";

import Link from 'next/link';
import { ArrowRight, Play, Save, WandSparkles, Rss, Activity, Loader2 } from "lucide-react";
import Image from "next/image";
import { useMe } from '@/hooks/useAuth';

export default function Home() {
  const { data: user } = useMe();

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="size-10 rounded-none bg-black flex items-center justify-center text-white shadow-none transition-transform group-hover:rotate-12">
              <Save />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">AudioSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold uppercase tracking-widest hover:line-through transition-all decoration-2">Features</a>
            <a href="#pricing" className="text-xs font-bold uppercase tracking-widest hover:line-through transition-all decoration-2">Pricing</a>
            <a href="#testimonials" className="text-xs font-bold uppercase tracking-widest hover:line-through transition-all decoration-2">Testimonials</a>
            {user ? (
              <Link
                href="/dashboard"
                className="text-xs font-bold uppercase tracking-widest bg-black text-white px-8 py-3 rounded-none hover:translate-x-1 hover:-translate-y-1 hover:brutalist-shadow-sm transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold uppercase tracking-widest hover:underline transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-xs font-bold uppercase tracking-widest bg-black text-white px-8 py-3 rounded-none hover:translate-x-1 hover:-translate-y-1 hover:brutalist-shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-left max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <h1 className="text-7xl md:text-[140px] font-black tracking-tighter leading-[0.8] mb-12 uppercase text-luxury">
            Turn your <br />
            YouTube into <br />
            <span className="bg-black text-white px-6 inline-block hover:translate-x-2 transition-transform">a Podcast.</span>
          </h1>
          <p className="text-2xl text-black max-w-2xl mb-12 leading-tight font-medium opacity-90">
            Automatically convert your video uploads into high-quality podcast episodes and distribute them to Spotify, Apple, and Google.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-12 py-6 bg-black text-white text-xl font-black rounded-none hover:translate-x-2 hover:-translate-y-2 hover:brutalist-shadow transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
              >
                Go to Dashboard
                <ArrowRight />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="w-full sm:w-auto px-12 py-6 bg-black text-white text-xl font-black rounded-none hover:translate-x-2 hover:-translate-y-2 hover:brutalist-shadow transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
              >
                Start Syncing Now
                <ArrowRight />
              </Link>
            )}
            <a href="#demo" className="w-full sm:w-auto px-12 py-6 bg-white border-4 border-black text-xl font-black rounded-none hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-tighter">
              Watch Demo
            </a>
          </div>
        </div>

        <div id="demo" className="mt-40 relative scroll-m-20 animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="relative bg-white rounded-none border-[6px] border-black shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] overflow-hidden aspect-video animate-float group">
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="size-32 rounded-none bg-black border-4 border-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all group-hover:bg-white group-hover:text-black shadow-2xl">
                <Play className="size-12 fill-current" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none group-hover:bg-transparent transition-colors"></div>
            <img 
              src="/youcast_dashboard_mockup_1772820751267.png" 
              alt="App Dashboard" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div id="features" className="mt-52 grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black scroll-m-24 shadow-[24px_24px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="text-left p-12 border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-black hover:bg-black hover:text-white transition-all group relative overflow-hidden">
            <div className="size-16 rounded-none bg-black flex items-center justify-center text-white mb-10 group-hover:bg-white group-hover:text-black transition-all group-hover:rotate-360 duration-700 border-2 border-black">
              <WandSparkles className="size-8" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">AI Audio Pro</h3>
            <p className="text-base font-medium leading-tight opacity-80 group-hover:opacity-100">Advanced background noise removal and normalization for that perfect studio sound, every single time.</p>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More <ArrowRight className="size-3" />
            </div>
          </div>
          <div className="text-left p-12 border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-black hover:bg-black hover:text-white transition-all group relative overflow-hidden">
            <div className="size-16 rounded-none bg-black flex items-center justify-center text-white mb-10 group-hover:bg-white group-hover:text-black transition-all group-hover:rotate-360 duration-700 border-2 border-black">
              <Rss className="size-8" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">Auto-Sync</h3>
            <p className="text-base font-medium leading-tight opacity-80 group-hover:opacity-100">Your content is everywhere instantly. We manage RSS feeds, hosting, and platform metadata automatically.</p>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More <ArrowRight className="size-3" />
            </div>
          </div>
          <div className="text-left p-12 hover:bg-black hover:text-white transition-all group relative overflow-hidden">
            <div className="size-16 rounded-none bg-black flex items-center justify-center text-white mb-10 group-hover:bg-white group-hover:text-black transition-all group-hover:rotate-360 duration-700 border-2 border-black">
              <Activity className="size-8" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">Insight Hub</h3>
            <p className="text-base font-medium leading-tight opacity-80 group-hover:opacity-100">Deep-dive into listener behavior across all platforms with our unified, real-time analytics engine.</p>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More <ArrowRight className="size-3" />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-black py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-none bg-white flex items-center justify-center text-black">
              <Save className="size-5" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">AudioSync</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:underline transition-colors">Privacy Policy</a>
            <a href="#" className="hover:underline transition-colors">Terms of Service</a>
            <a href="#" className="hover:underline transition-colors">Contact Us</a>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">© 2024 AudioSync Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
