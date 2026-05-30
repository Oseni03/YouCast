"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthErrorContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const message = searchParams.get("message");

	let displayMessage =
		"An unknown error occurred while connecting your account.";
	let displayTitle = "Connection Failed";

	if (message === "token_exchange_failed") {
		displayMessage =
			"We could not securely complete your YouTube connection. This usually happens if you try to use an expired link or hit the back button during the process.";
		displayTitle = "Connection Expired";
	} else if (message === "already_linked") {
		displayMessage =
			"This Google account is already connected to another Opticast account. Please use a different Google account or log in to that account directly.";
		displayTitle = "Account Already Linked";
	} else if (message === "auth_failed") {
		displayMessage =
			"We could not authenticate your account. Please check your credentials and try again.";
		displayTitle = "Connection Failed";
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--primary)/0.07),rgba(255,255,255,0))] bg-surface-container-lowest flex items-center justify-center p-6">
			<div className="max-w-md w-full bg-surface-container-lowest rounded-3xl border border-border shadow-[0px_24px_48px_rgba(25,28,30,0.06)] p-12 flex flex-col items-center text-center">
				<div className="size-20 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-8 shadow-sm">
					<AlertCircleIcon className="size-10" />
				</div>

				<h1 className="text-3xl font-manrope font-bold text-primary tracking-tight mb-4">
					{displayTitle}
				</h1>

				<p className="text-sm font-medium text-muted-foreground leading-relaxed mb-12">
					{displayMessage}
				</p>

				<Button
					onClick={() => router.replace("/onboarding")}
					className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-primary-foreground text-base font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
				>
					<ArrowLeftIcon className="w-5 h-5" />
					Return to Onboarding
				</Button>
			</div>
		</div>
	);
}

export default function AuthErrorPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6">
					<div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
				</div>
			}
		>
			<AuthErrorContent />
		</Suspense>
	);
}
