"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import config from "@/config";
import { ChartLine, CircleUser, LogOut, Settings, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileDialog } from "./profile-dialog";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { getUser, getUserSubscription } from "@/lib/actions";
import { toast } from "react-toastify";

export function UserProfile() {
	const router = useRouter();

	if (!config?.auth?.enabled) {
		router.back();
	}
	const { data: session } = useSession();
	const userId = session?.user.id;
	const [user, setUser] = useState({});

	useEffect(() => {
		async function getUserData() {
			const result = await getUser(userId);
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
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="w-[2.25rem] h-[2.25rem]">
				<Avatar>
					<AvatarImage src={user?.image} alt="User Profile" />
					<AvatarFallback>
						<CircleUser className="h-5 w-5" />
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<ProfileDialog>
							<Button variant="ghost" className="p-1 py-0 w-full">
								<User className="mr-2 h-4 w-4" />
								<span>Profile</span>
								<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
							</Button>
						</ProfileDialog>
					</DropdownMenuItem>
					<Link href="/dashboard">
						<DropdownMenuItem>
							<ChartLine className="mr-2 h-4 w-4" />
							<span>Dashboard</span>
							<DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<DropdownMenuItem onSelect={handleBilling}>
						<ChartLine className="mr-2 h-4 w-4" />
						<span>Billing</span>
						<DropdownMenuShortcut>⇧⌘B</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuItem onSelect={handleLogout}>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
