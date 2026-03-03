"use client"

import React, { useState } from 'react';
import { ArrowLeft, CheckSquare, LogIn } from 'lucide-react';

export default function AuthView({ onAuthComplete, onBack }: { onAuthComplete: () => void, onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      setIsLoading(false);
      onAuthComplete();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-white selection:text-black">
      <div className="max-w-md w-full">
        <button 
          onClick={onBack}
          className="mb-12 flex items-center gap-3 text-white/50 hover:text-white transition-colors uppercase text-xs font-black tracking-[0.2em]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-black border-4 border-white p-12 shadow-[24px_24px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-4 mb-12">
            <div className="size-10 rounded-none bg-white flex items-center justify-center text-black border-2 border-white">
              <CheckSquare className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-white">AUDIOSYNC</span>
          </div>

          <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase leading-none">
            {isLogin ? 'Welcome Back.' : 'Join the Club.'}
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-12">
            {isLogin ? 'Enter your credentials to access your studio.' : 'Create an account to start syncing your content.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-4 border-white/20 p-5 text-white font-bold focus:border-white outline-none transition-all placeholder:text-white/20"
                placeholder="NAME@EXAMPLE.COM"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-4 border-white/20 p-5 text-white font-bold focus:border-white outline-none transition-all placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-transparent border-4 border-white/20 p-5 text-white font-bold focus:border-white outline-none transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-white text-black text-xl font-black uppercase tracking-tighter hover:invert transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="size-6 border-4 border-black border-t-transparent animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <LogIn className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t-4 border-white/10 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}
            </p>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-white font-black uppercase tracking-widest text-xs hover:underline"
            >
              {isLogin ? 'Create a New Account' : 'Sign In to Existing Account'}
            </button>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
          By continuing, you agree to AudioSync's <br />
          <a href="#" className="text-white hover:underline">Terms of Service</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
