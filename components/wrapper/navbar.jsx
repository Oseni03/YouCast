"use client";
import Link from "next/link";
import * as React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Button } from "../ui/button";
import { UserProfile } from "../user-profile";
import ModeToggle from "../mode-toggle";
import { BlocksIcon } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const components = [
	{
		title: "Marketing Page",
		href: "/marketing-page",
		description: "Write some wavy here to get them to click.",
	},
	{
		title: "Marketing Page",
		href: "/marketing-page",
		description: "Write some wavy here to get them to click.",
	},
	{
		title: "Marketing Page",
		href: "/marketing-page",
		description: "Write some wavy here to get them to click.",
	},
];

export default function NavBar() {
	const router = useRouter();
	let userId = null;
	const { data: session } = useSession();
	const [isOpen, setIsOpen] = React.useState(false);
	userId = session?.user.id;

	return (
		<>
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="fixed inset-0 z-10 "
			>
				<div className="flex min-w-full fixed justify-between items-center p-2 border-b z-20 dark:bg-black dark:bg-opacity-50 bg-white">
					<div className="flex items-center space-x-2 ">
						<div className="flex lg:flex-1">
							<Link
								href="/"
								className="pl-2 flex items-center"
								aria-label="Home"
							>
								<BlocksIcon aria-hidden="true" />
								<span className="sr-only">Home</span>
							</Link>
						</div>
						<CollapsibleTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="w-4 h-4 md:hidden"
								aria-label={isOpen ? "Close menu" : "Open menu"}
							>
								<GiHamburgerMenu />
							</Button>
						</CollapsibleTrigger>
					</div>

					<NavigationMenu className="hidden md:block">
						<NavigationMenuList>
							<NavigationMenuItem className="ml-5">
								<NavigationMenuTrigger className="dark:bg-black dark:bg-opacity-50">
									Features
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="flex flex-col w-[400px] gap-3 p-4 lg:w-[500px]">
										{components.map((component, index) => (
											<ListItem
												key={index}
												title={component.title}
												href={component.href}
											>
												{component.description}
											</ListItem>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link href="/dashboard" legacyBehavior passHref>
									<Button variant="ghost">Dashboard</Button>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link href="/about" legacyBehavior passHref>
									<Button variant="ghost">About</Button>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link
									href="/contact-us"
									legacyBehavior
									passHref
								>
									<Button variant="ghost">Contact us</Button>
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<div className="flex items-center gap-2 ">
						{userId ? (
							<UserProfile />
						) : (
							<div className="flex space-x-2">
								<Button
									size="sm"
									onClick={() => router.push("/auth/signin")}
								>
									Sign in
								</Button>
								<Button
									size="sm"
									onClick={() => router.push("/auth/signup")}
								>
									Sign up
								</Button>
							</div>
						)}
						<ModeToggle />
					</div>
				</div>

				<CollapsibleContent
					className={cn(
						"fixed inset-y-0 left-0 w-64 bg-background border-r shadow-lg transition-transform duration-300 ease-in-out transform",
						isOpen ? "translate-x-0" : "-translate-x-full"
					)}
				>
					<div className="flex flex-col p-4 space-y-4 mt-16">
						<Link href="/">
							<Button
								variant="ghost"
								className="w-full justify-start"
								onClick={() => setIsOpen(false)}
							>
								Home
							</Button>
						</Link>
						<Link href="/dashboard">
							<Button
								variant="ghost"
								className="w-full justify-start"
								onClick={() => setIsOpen(false)}
							>
								Dashboard
							</Button>
						</Link>
						<Link href="/about">
							<Button
								variant="ghost"
								className="w-full justify-start"
								onClick={() => setIsOpen(false)}
							>
								About
							</Button>
						</Link>
						<Link href="/contact-us">
							<Button
								variant="ghost"
								className="w-full justify-start"
								onClick={() => setIsOpen(false)}
							>
								Contact us
							</Button>
						</Link>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</>
	);
}

const ListItem = React.forwardRef(
	({ className, title, children, ...props }, ref) => {
		return (
			<li>
				<NavigationMenuLink asChild>
					<Link
						ref={ref}
						className={cn(
							"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
							className
						)}
						{...props}
					>
						<div className="text-sm font-medium leading-none">
							{title}
						</div>
						<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
							{children}
						</p>
					</Link>
				</NavigationMenuLink>
			</li>
		);
	}
);
ListItem.displayName = "ListItem";
