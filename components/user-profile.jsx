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
import { CircleUser, LogOut, Settings, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/lib/actions/auth";

export function UserProfile() {
	const router = useRouter();

	if (!config?.auth?.enabled) {
		router.back();
	}
	const { data: session } = useSession();
	const user = session?.user;
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
					<Link href="/user-profile">
						<DropdownMenuItem>
							<User className="mr-2 h-4 w-4" />
							<span>Profile</span>
							<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<Link href="/dashboard">
						<DropdownMenuItem>
							<User className="mr-2 h-4 w-4" />
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
				<DropdownMenuItem onSelect={() => handleLogout(router)}>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
