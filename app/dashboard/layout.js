import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import { Separator } from "@/components/ui/separator";
import { DashboardBreadcrumb } from "./components/dashboard-breadcrumb";
import { DashboardAuthWrapper } from "@/components/wrapper/dashboard-auth-wrapper";

function DashboardLayout({ children }) {
	return (
		<DashboardAuthWrapper>
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
					<main className="max-w-4xl">
						<div className="flex flex-1 flex-col gap-4 px-4 py-10">
							{children}
						</div>
					</main>
				</SidebarInset>
			</SidebarProvider>
		</DashboardAuthWrapper>
	);
}

export default DashboardLayout;
