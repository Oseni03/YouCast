import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import React from 'react';
import { CheckCircle2Icon, FileMusicIcon, PodcastIcon, SearchIcon } from 'lucide-react';

export default function SuccessPage() {
  const { projectId } = useParams() as { projectId: string };
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-12 relative inline-block">
          <div className="size-32 bg-black dark:bg-white text-white dark:text-black rounded-none flex items-center justify-center border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] mx-auto">
            <CheckCircle2Icon/>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-black dark:text-white mb-4 uppercase tracking-tighter leading-none">Well Done!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12 mt-4 font-bold uppercase text-[10px] md:text-xs tracking-widest leading-relaxed">
          Your episode is being processed and will be live on all platforms within the next few minutes.
        </p>
        
        <div className="space-y-6">
          <Button 
            asChild
            className="h-auto w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-none hover:invert transition-all uppercase tracking-tighter text-lg"
          >
            <Link href={`/projects/${projectId}`}>
              Back to Dashboard
            </Link>
          </Button>
          <button className="w-full py-5 bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white font-black rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-tighter text-lg">
            View Details
          </button>
        </div>
        
        <div className="mt-16 pt-8 border-t-4 border-black dark:border-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Distribution Status</p>
          <div className="flex justify-center flex-wrap gap-4 md:gap-8">
            {[PodcastIcon, FileMusicIcon, SearchIcon].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="size-12 rounded-none bg-slate-100 dark:bg-slate-900 border-2 border-black dark:border-white flex items-center justify-center">
                  <Icon />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Live</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
