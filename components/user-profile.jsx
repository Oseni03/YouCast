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
import { handleLogout } from "@/lib/actions";
import { ProfileDialog } from "./profile-dialog";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";

export function UserProfile() {
	const router = useRouter();

	if (!config?.auth?.enabled) {
		router.back();
	}
	const { data: session } = useSession();
	const user = session?.user;

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
					<Link href="/dashboard/settings">
						<DropdownMenuItem>
							<Settings className="mr-2 h-4 w-4" />
							<span>Settings</span>
							<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
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
