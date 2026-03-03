import React from 'react';
import Sidebar from '@/components/sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function Layout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 md:hidden border-b-4 border-black dark:border-white">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
