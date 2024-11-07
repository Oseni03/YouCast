"use client";
import React from "react";
import { CircleUser } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

function UserDropdownMenu() {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await signOut({ redirect: false });
			router.push("/");
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="ms-auto">
				<Button
					variant="secondary"
					size="icon"
					className="rounded-full"
				>
					<CircleUser className="h-5 w-5" />
					<span className="sr-only">Toggle user menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={() => {
						router.push("/invitations");
					}}
				>
					Bookmarks
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() => {
						router.push("/settings");
					}}
				>
					Settings
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={handleLogout}>
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default UserDropdownMenu;
