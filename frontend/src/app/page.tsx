import Link from 'next/link';
import { ArrowRight, Play, Save, WandSparkles, Rss, Activity } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-black">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-none bg-black flex items-center justify-center text-white shadow-none">
            <Save />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">AudioSync</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-xs font-bold uppercase tracking-widest hover:underline transition-colors">Features</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest hover:underline transition-colors">Pricing</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest hover:underline transition-colors">Testimonials</a>
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-widest hover:underline transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-xs font-bold uppercase tracking-widest bg-black text-white px-8 py-3 rounded-none hover:bg-slate-800 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-left max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-black text-white text-[10px] font-bold uppercase tracking-widest mb-8 border border-black">
            <span className="size-2 rounded-full bg-white animate-pulse"></span>
            New: AI Audio Enhancement Included
          </div>
          <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] mb-12 uppercase">
            Turn your <br />
            YouTube into <br />
            <span className="bg-black text-white px-4">a Podcast.</span>
          </h1>
          <p className="text-xl text-black max-w-2xl mb-12 leading-relaxed font-medium">
            Automatically convert your video uploads into high-quality podcast episodes and distribute them to Spotify, Apple, and Google with one click.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-12 py-6 bg-black text-white text-xl font-black rounded-none hover:bg-slate-800 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
            >
              Start Syncing Now
              <ArrowRight />
            </Link>
            <button className="w-full sm:w-auto px-12 py-6 bg-white border-2 border-black text-xl font-black rounded-none hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-tighter">
              Watch Demo
            </button>
          </div>
        </div>

        <div className="mt-32 relative">
          <div className="relative bg-white rounded-none border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden aspect-video">
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="size-24 rounded-none bg-black border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform group">
                <Play />
              </div>
            </div>
            <img 
              src="https://picsum.photos/seed/dashboard/1920/1080?grayscale" 
              alt="App Dashboard" 
              className="w-full h-full object-cover grayscale opacity-80"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black">
          <div className="text-left p-12 border-r border-b border-black hover:bg-black hover:text-white transition-colors group">
            <div className="size-14 rounded-none bg-black flex items-center justify-center text-white mb-8 group-hover:bg-white group-hover:text-black transition-colors">
              <WandSparkles className="size-8" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">AI Enhancement</h3>
            <p className="text-sm font-medium leading-relaxed opacity-70">Our advanced AI removes background noise and normalizes audio levels for a studio-quality sound.</p>
          </div>
          <div className="text-left p-12 border-r border-b border-black hover:bg-black hover:text-white transition-colors group">
            <div className="size-14 rounded-none bg-black flex items-center justify-center text-white mb-8 group-hover:bg-white group-hover:text-black transition-colors">
              <Rss className="size-8" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Auto-Distribution</h3>
            <p className="text-sm font-medium leading-relaxed opacity-70">One-click sync to major platforms. We handle the RSS feeds, metadata, and hosting for you.</p>
          </div>
          <div className="text-left p-12 border-r border-b border-black hover:bg-black hover:text-white transition-colors group">
            <div className="size-14 rounded-none bg-black flex items-center justify-center text-white mb-8 group-hover:bg-white group-hover:text-black transition-colors">
              <Activity className="size-8" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Advanced Analytics</h3>
            <p className="text-sm font-medium leading-relaxed opacity-70">Track your growth across all platforms in one unified dashboard with deep listener insights.</p>
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
