"use client";

import {
	MicIcon,
	LayoutDashboardIcon,
	RssIcon,
	BarChartIcon,
	SettingsIcon,
	LogOutIcon,
	FolderIcon,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { AppLogo } from "@/components/app-logo";

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
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

export default function Sidebar() {
	const pathname = usePathname();
	const params = useParams();
	const projectId = params?.projectId as string | undefined;

	const navItems = projectId
		? [
				{
					id: "dashboard",
					label: "Overview",
					icon: LayoutDashboardIcon,
					href: `/projects/${projectId}`,
				},
				{
					id: "episodes",
					label: "Episodes",
					icon: MicIcon,
					href: `/projects/${projectId}/episodes`,
				},
				{
					id: "analytics",
					label: "Analytics",
					icon: BarChartIcon,
					href: `/projects/${projectId}/analytics`,
				},
				{
					id: "settings",
					label: "Settings",
					icon: SettingsIcon,
					href: `/projects/${projectId}/settings`,
				},
			]
		: [
				{
					id: "projects",
					label: "All Projects",
					icon: FolderIcon,
					href: `/projects`,
				},
				{
					id: "settings",
					label: "Settings",
					icon: SettingsIcon,
					href: `/projects/settings`,
				},
			];

	const allNavItems = projectId
		? [
				{
					id: "projects",
					label: "All Projects",
					icon: FolderIcon,
					href: `/projects`,
				},
				...navItems,
			]
		: navItems;

	return (
		<ShadcnSidebar className="border-r border-border bg-surface-container-lowest!">
			<SidebarHeader className="p-5 border-b border-border bg-surface-container-lowest">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="#">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<AppLogo
										width={20}
										height={20}
										className="object-contain"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										Opticast
									</span>
									<span className="truncate text-xs">
										Creator Studio
									</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className="bg-surface-container-lowest">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="px-3 space-y-1 mt-4">
							{allNavItems.map((item) => {
								const isActive =
									item.href === `/projects/${projectId}` ||
									item.href === "/projects"
										? pathname === item.href
										: pathname?.startsWith(item.href);

								return (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
												isActive
													? "bg-primary/10 text-primary font-semibold shadow-sm"
													: "text-muted-foreground hover:bg-surface-container-low hover:text-primary"
											}`}
										>
											<Link href={item.href}>
												<item.icon
													className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
												/>
												<span className="text-sm font-medium ml-1">
													{item.label}
												</span>
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
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</ShadcnSidebar>
	);
}
