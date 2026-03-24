"use client"

import { MicIcon, LayoutDashboardIcon, RssIcon, BarChartIcon, SettingsIcon, LogOutIcon, MapPinCheckIcon, FolderIcon } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
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
    const params = useParams();
    const projectId = params?.projectId as string | undefined;

    const navItems = projectId ? [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboardIcon, href: `/projects/${projectId}` },
        { id: 'episodes', label: 'Episodes', icon: MicIcon, href: `/projects/${projectId}/episodes` },
        { id: 'analytics', label: 'Analytics', icon: BarChartIcon, href: `/projects/${projectId}/analytics` },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, href: `/projects/${projectId}/settings` },
    ] : [
        { id: 'projects', label: 'All Projects', icon: FolderIcon, href: `/projects` },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, href: `/projects/settings` },
    ];

    const allNavItems = projectId
        ? [{ id: 'projects', label: 'All Projects', icon: FolderIcon, href: `/projects` }, ...navItems]
        : navItems;

    const { data: user } = useMe();
    const router = useRouter();

    const handleLogout = () => {
        clearTokens();
        router.push('/login');
    };

    return (
        <ShadcnSidebar className="border-r border-border bg-surface-container-lowest!">
            <SidebarHeader className="p-5 border-b border-border bg-surface-container-lowest">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                        <MapPinCheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-manrope font-bold leading-none tracking-tight text-primary">AudioSync</h1>
                        <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">Creator Studio</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-surface-container-lowest">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-3 space-y-1 mt-4">
                            {allNavItems.map((item) => {
                                const isActive = item.href === `/projects/${projectId}` || item.href === '/projects'
                                    ? pathname === item.href
                                    : pathname?.startsWith(item.href);

                                return (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                                                : 'text-muted-foreground hover:bg-surface-container-low hover:text-primary'
                                                }`}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <span className="text-sm font-medium ml-1">{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-border bg-surface-container-lowest">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low group">
                    <div className="size-9 rounded-xl bg-surface-container overflow-hidden shrink-0 ring-1 ring-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            alt="User Avatar"
                            src={user?.avatar_url || "https://api.dicebear.com/9.x/notionists/svg?seed=" + (user?.username || "fallback")}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-primary truncate">{user?.username || 'User'}</p>
                        <p className="text-[11px] font-medium text-muted-foreground truncate capitalize">{user?.plan_tier || 'Free'} Plan</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                        title="Log Out"
                    >
                        <LogOutIcon className="w-4 h-4" />
                    </button>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </ShadcnSidebar>
    );
}
