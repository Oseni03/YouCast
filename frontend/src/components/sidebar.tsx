"use client"

import { MicIcon, LayoutDashboardIcon, RssIcon, BarChartIcon, SettingsIcon, LogOutIcon, MapPinCheckIcon } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMe, clearTokens } from '@/hooks/useAuth';

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export default function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, href: '/dashboard' },
    { id: 'episodes', label: 'Episodes', icon: MicIcon, href: '/dashboard/episodes' },
    { id: 'rss', label: 'RSS', icon: RssIcon, href: '/dashboard/rss' },
    { id: 'analytics', label: 'Analytics', icon: BarChartIcon, href: '/dashboard/analytics' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, href: '/dashboard/settings' },
  ];

  const { data: user } = useMe();
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  return (
    <ShadcnSidebar className="border-r-4 border-black dark:border-white bg-white! dark:bg-black!">
      <SidebarHeader className="p-4 border-b-4 border-black dark:border-white bg-white dark:bg-black">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-none bg-black dark:bg-white flex items-center justify-center text-white dark:text-black border-2 border-black dark:border-white">
            <MapPinCheckIcon/>
          </div>
          <div>
            <h1 className="text-2xl font-black leading-none uppercase tracking-tighter">AudioSync</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Creator Studio</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white dark:bg-black">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-4 space-y-2 mt-4">
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === '/dashboard' 
                  : pathname?.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      className={`w-full flex items-center gap-4 px-4 py-6 rounded-none border-2 transition-all ${
                        isActive
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                          : 'text-slate-500 dark:text-slate-400 border-transparent hover:border-black dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent'
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className="scale-125" />
                        <span className="text-xs font-black uppercase tracking-[0.15em] ml-2">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t-4 border-black dark:border-white bg-white dark:bg-black">
        <div className="flex items-center gap-4 group">
          <div className="size-10 rounded-none bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-black dark:border-white shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="User Avatar"
              src={user?.avatar_url || "https://api.dicebear.com/9.x/notionists/svg?seed=" + (user?.username || "fallback")}
              referrerPolicy="no-referrer"
              className="grayscale w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black uppercase tracking-tight truncate">{user?.username || 'User'}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] truncate">{user?.plan_tier || 'Free'} Plan</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shrink-0 cursor-pointer"
            title="Log Out"
          >
            <LogOutIcon className="size-5" />
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
}
