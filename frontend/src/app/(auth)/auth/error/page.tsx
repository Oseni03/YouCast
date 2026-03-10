'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AuthErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    let displayMessage = 'An unknown error occurred while connecting your account.';
    let displayTitle = 'Connection Failed';

    if (message === 'token_exchange_failed') {
        displayMessage = 'We could not securely complete your YouTube connection. This usually happens if you try to use an expired link or hit the back button during the process.';
        displayTitle = 'Connection Expired';
    } else if (message === 'already_linked') {
        displayMessage = 'This Google account is already connected to another YouCast account. Please use a different Google account or log in to that account directly.';
        displayTitle = 'Account Already Linked';
    } else if (message === 'auth_failed') {
        displayMessage = 'We could not authenticate your account. Please check your credentials and try again.';
        displayTitle = 'Connection Failed';
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-black rounded-none border-4 border-white shadow-[16px_16px_0px_0px_rgba(255,255,255,0.1)] p-12 flex flex-col items-center text-center">
                <div className="size-20 rounded-full border-4 border-white flex items-center justify-center mb-8 bg-red-500/10 text-red-500">
                    <AlertCircleIcon className="size-10" />
                </div>
                
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                    {displayTitle}
                </h1>
                
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider leading-relaxed mb-12">
                    {displayMessage}
                </p>

                <Button
                    onClick={() => router.replace('/onboarding')}
                    className="w-full h-16 bg-white text-black text-xl font-black rounded-none hover:invert transition-all flex items-center justify-center gap-4 uppercase tracking-tighter"
                >
                    <ArrowLeftIcon />
                    Return to Onboarding
                </Button>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <p className="text-white text-2xl font-black uppercase tracking-widest">Loading...</p>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
