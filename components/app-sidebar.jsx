"use client";
import {
	Settings,
	ChevronUp,
	User2,
	Music,
	Tv,
	Tags,
	BarChart,
	DollarSign,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarFooter,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileDialog } from "./profile-dialog";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import CreditBalanceCard from "./credit-balance-card";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";

// Menu items.
const items = [
	{
		title: "Overview",
		url: "/dashboad",
		icon: BarChart,
	},
	{
		title: "Library",
		url: "/dashboard/library",
		icon: Music,
	},
	{
		title: "Channels",
		url: "/dashboard/channels",
		icon: Tv,
	},
	{
		title: "Categories",
		url: "/dashboard/categories",
		icon: Tags,
	},
	{
		title: "Billing",
		url: "/dashboard/billing",
		icon: DollarSign,
	},
];

export function AppSidebar() {
	const router = useRouter();
	const { data: session } = useSession();

	const handleLogout = async () => {
		try {
			await signOut({ redirect: false });
			toast.success("Logout successful");
			router.push("/");
		} catch (error) {
			console.log(error);
			toast.error("Logout unsuccessful!");
		}
	};

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<CreditBalanceCard />
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<User2 />{" "}
									<span className="font-semibold">
										{session?.user?.email}
									</span>
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								<DropdownMenuItem asChild>
									<ProfileDialog>
										<Button
											variant="ghost"
											className="px-3 py-0 w-full justify-start"
										>
											Profile
										</Button>
									</ProfileDialog>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link href={"/dashboard/billing"}>
										<Button
											variant="ghost"
											className="p-1 py-0 w-full text-start"
										>
											Billing
										</Button>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={handleLogout}>
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
