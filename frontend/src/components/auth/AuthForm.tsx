"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Podcast, LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useLogin, useSignup } from '@/hooks/useAuth';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const isLoading = loginMutation.isPending || signupMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isLogin) {
      loginMutation.mutate(
        { email, password },
        {
          onSuccess: () => router.push('/onboarding'),
          onError: (error: any) => {
            setFormError(error.response?.data?.error || 'Invalid email or password.');
          },
        }
      );
    } else {
      if (password !== confirmPassword) {
        setFormError("Passwords don't match.");
        return;
      }
      signupMutation.mutate(
        { email, password, username },
        {
          onSuccess: () => router.push('/onboarding'),
          onError: (error: any) => {
            const errData = error.response?.data;
            if (errData && typeof errData === 'object') {
              const messages = Object.values(errData).flat() as string[];
              setFormError(messages.join(' ') || 'Failed to create account.');
            } else {
              setFormError('Failed to create account.');
            }
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-white selection:text-black">
      <div className="max-w-md w-full">

        {/* Back to Home */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-3 text-white/40 hover:text-white transition-colors duration-200 uppercase text-[10px] font-black tracking-[0.2em] group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-black border-4 border-white p-10 shadow-[20px_20px_0px_0px_rgba(255,255,255,0.08)]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 w-fit group">
            <div className="size-10 bg-white flex items-center justify-center text-black group-hover:invert transition-all duration-200">
              <Podcast className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-white">AUDIOSYNC</span>
          </Link>

          {/* Heading */}
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase leading-none">
            {isLogin ? 'Welcome Back.' : 'Join the Club.'}
          </h1>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
            {isLogin
              ? 'Sign in to access your podcast studio.'
              : 'Create an account to start converting your content.'}
          </p>

          {/* Error Banner */}
          {formError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">{formError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username — signup only */}
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-2 border-white/20 px-5 py-4 text-white font-bold focus:border-white outline-none transition-colors duration-200 placeholder:text-white/20 text-sm"
                  placeholder="yourchannel"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-2 border-white/20 px-5 py-4 text-white font-bold focus:border-white outline-none transition-colors duration-200 placeholder:text-white/20 text-sm"
                placeholder="name@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-2 border-white/20 px-5 py-4 pr-14 text-white font-bold focus:border-white outline-none transition-colors duration-200 placeholder:text-white/20 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password — signup only */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent border-2 border-white/20 px-5 py-4 pr-14 text-white font-bold focus:border-white outline-none transition-colors duration-200 placeholder:text-white/20 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="Toggle confirm password visibility"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors duration-200"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-white text-black text-base font-black uppercase tracking-widest hover:invert transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="size-5 border-[3px] border-black border-t-transparent animate-spin rounded-full" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  {isLogin
                    ? <LogIn className="w-5 h-5" />
                    : <UserPlus className="w-5 h-5" />
                  }
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-10 pt-8 border-t-2 border-white/10 text-center">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
              {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
            </p>
            <Link
              href={isLogin ? '/signup' : '/login'}
              className="text-white font-black uppercase tracking-widest text-xs hover:underline underline-offset-4 transition-all duration-200"
            >
              {isLogin ? 'Create a New Account →' : '← Sign In Instead'}
            </Link>
          </div>
        </div>

        {/* Legal */}
        <p className="mt-8 text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.15em] leading-relaxed">
          By continuing, you agree to AUDIOSYNC's{' '}
          <a href="#" className="text-white/40 hover:text-white transition-colors underline underline-offset-2">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-white/40 hover:text-white transition-colors underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
