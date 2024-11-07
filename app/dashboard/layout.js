"use client";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";

function DashboardLayout({ children }) {
	const router = useRouter();
	const { data: session } = useSession({
		required: true,
		onUnauthenticated() {
			router.push("/");
		},
	});
	console.log("session", session);
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center gap-2">
					<div className="flex flex-1 items-center gap-2 px-3">
						<SidebarTrigger />
						<Separator
							orientation="vertical"
							className="mr-2 h-4"
						/>
						<DashboardBreadcrumb />
					</div>
					<div className="ml-auto px-3">
						<NavActions />
					</div>
				</header>
				<main className="flex flex-1 flex-col gap-4 px-4 py-10">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

export default DashboardLayout;

const DashboardBreadcrumb = () => {
	const segments = useSelectedLayoutSegments();

	let breadcrumb;
	if (segments.length < 1) {
		breadcrumb = "Components Management & Engagement Tracking";
	} else {
		if (segments[0] == "discover") {
			breadcrumb = "Discover the latest components";
		} else if (segments[0] == "components") {
			breadcrumb = "Manage your UI components all in one place";
		}
	}
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbPage className="line-clamp-1">
						{breadcrumb}
					</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
};
