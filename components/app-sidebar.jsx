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
import { useState, useEffect } from "react";
import { getUser, getUserSubscription } from "@/lib/actions";

// Menu items.
const items = [
	{
		title: "Overview",
		url: "/dashboard",
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
];

export function AppSidebar() {
	const router = useRouter();
	const { data: session } = useSession();
	const userId = session?.user.id;
	const [user, setUser] = useState({});

	useEffect(() => {
		async function getUserData() {
			const result = await getUser(userId);
			console.log(result);
			if (result.success) {
				setUser(result.user);
			}
		}
		getUserData();
	}, [userId]);

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

	const handleBilling = async () => {
		try {
			if (!user.subscription) {
				toast.info("Subscribe to a plan to access");
				router.push("/#pricing");
				return;
			}

			const subscription = await getUserSubscription(userId);

			if (!subscription.success) {
				toast.error(subscription.error);
				return;
			}

			const response = await fetch("/api/payments/portal", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					customerId: subscription?.subscription.stripe_user_id,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to create checkout session"
				);
			}

			const data = await response.json();
			if (data.url) {
				// Redirect directly to Stripe checkout URL
				window.location.href = data.url;
				return;
			}
		} catch (error) {
			toast.error("Error during checkout");
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
								<DropdownMenuItem onSelect={handleBilling}>
									<span>Billing</span>
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
