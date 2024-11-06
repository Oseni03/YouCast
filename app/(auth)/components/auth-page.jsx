import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

function AuthPage({ config }) {
	let url = "";
	if (config.link.next) {
		url = `${config.link.href}?next=${config.link.next}`;
	} else {
		url = `${config.link.href}`;
	}

	return (
		<>
			<div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 px-5">
				<div className="absolute left-4 top-4 md:left-8 md:top-8">
					<Link
						className="flex items-center text-lg font-medium"
						href="/"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mr-2 h-6 w-6"
						>
							<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
						</svg>
						{siteConfig.name}
					</Link>
				</div>
				{config.link && (
					<Link
						href={url}
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"absolute right-4 top-4 md:right-8 md:top-8"
						)}
					>
						{config.link.name}
					</Link>
				)}
				<div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
					<div className="absolute inset-0 bg-zinc-900" />
					<div className="relative z-20 flex items-center text-lg font-medium">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mr-2 h-6 w-6"
						>
							<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
						</svg>
						{siteConfig.name}
					</div>
					<div className="relative z-20 mt-auto">
						<blockquote className="space-y-2">
							<p className="text-lg">
								&ldquo;This library has saved me countless hours
								of work and helped me deliver stunning designs
								to my clients faster than ever before.&rdquo;
							</p>
							<footer className="text-sm">Sofia Davis</footer>
						</blockquote>
					</div>
				</div>
				<div className="lg:p-8">
					<div className="mx-auto my-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
						<div className="flex flex-col space-y-2 text-center">
							<h1 className="text-2xl font-semibold tracking-tight">
								{config.title}
							</h1>
							<p className="text-sm text-muted-foreground">
								{config.description}
							</p>
						</div>
						{config.form}
						{config.consent && (
							<p className="px-8 text-center text-sm text-muted-foreground">
								By clicking continue, you agree to our{" "}
								<Link
									href="/terms"
									className="underline underline-offset-4 hover:text-primary"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									href="/privacy"
									className="underline underline-offset-4 hover:text-primary"
								>
									Privacy Policy
								</Link>
								.
							</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default AuthPage;