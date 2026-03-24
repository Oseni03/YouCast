import React from 'react';
import Sidebar from '@/components/sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function Layout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset className="bg-background text-foreground flex flex-col min-h-screen">
                <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 md:hidden border-b border-border bg-surface-container-lowest">
                    <SidebarTrigger />
                </header>
                <main className="flex-1 p-6 md:p-10">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
