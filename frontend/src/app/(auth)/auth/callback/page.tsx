'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ME_KEY } from '@/hooks/useAuth';
import { YT_CHANNELS_KEY } from '@/hooks/useChannels';
import { useQueryClient } from '@tanstack/react-query';

function AuthCallbackContent() {
    const router = useRouter();
    const params = useSearchParams();
    const queryClient = useQueryClient();

    useEffect(() => {
        const access = params.get('access');
        const refresh = params.get('refresh');
        const isNew = params.get('is_new') === 'true';

        if (!access || !refresh) {
            router.replace('/login?error=auth_failed');
            return;
        }

        // Store tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        document.cookie = `access_token=${access}; path=/; SameSite=Strict`;

        // Invalidate the auth query to fetch the new user profile
        queryClient.invalidateQueries({ queryKey: ME_KEY });
        queryClient.invalidateQueries({ queryKey: YT_CHANNELS_KEY });

        const returnTo = localStorage.getItem('auth_return_to');
        if (returnTo) {
            localStorage.removeItem('auth_return_to');
            router.replace(returnTo);
        } else {
            router.replace(isNew ? '/onboarding' : '/projects');
        }
    }, [params, router, queryClient]);

    return (
        <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-primary text-base font-semibold font-manrope tracking-wide">Connecting YouTube...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6"><div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
