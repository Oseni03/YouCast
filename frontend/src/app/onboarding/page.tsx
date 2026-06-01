"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMe, useAcceptTOS } from "@/hooks/useAuth";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	ArrowBigRightIcon,
	BookCheckIcon,
	CheckIcon,
	LogInIcon,
	YoutubeIcon,
} from "lucide-react";

export default function OnboardingPage() {
	const router = useRouter();
	const { data: user } = useMe();
	const acceptTOS = useAcceptTOS();

	// Modals state
	const [isTOSModalOpen, setIsTOSModalOpen] = useState(false);

	const tosCompleted = !!user?.tos_accepted_at;
	const youtubeConnected = !!user?.has_youtube_connected;
	const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

	const handleGoogleLogin = () => {
		if (!tosCompleted) {
			toast.error("You must accept the Terms of Service first");
			setIsTOSModalOpen(true);
			return;
		}
		try {
			localStorage.setItem("auth_return_to", "/onboarding");
			const token = localStorage.getItem("access_token");
			const authUrl = `${apiUrl}/auth/google/authorize/?token=${token || ""}`;
			window.location.href = authUrl;
		} catch (err) {
			toast.error("Failed to initiate Google login");
			console.error(err);
		}
	};

	const handleAcceptTOS = async () => {
		try {
			await acceptTOS.mutateAsync(true);
			setIsTOSModalOpen(false);
			toast.success("Terms of Service accepted!");
		} catch (err) {
			toast.error("Failed to accept Terms of Service");
			console.error(err);
		}
	};

	const allCompleted = tosCompleted && youtubeConnected;

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-6 md:p-12">
			<div className="max-w-3xl w-full bg-surface-container-lowest rounded-3xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] overflow-hidden">
				<div className="p-10 md:p-16">
					<div className="flex items-center gap-4 mb-16">
						<div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
							<BookCheckIcon className="size-6" />
						</div>
						<span className="text-2xl font-manrope font-bold tracking-tight text-primary">
							Opticast
						</span>
					</div>

					<div className="mb-16">
						<h2 className="text-4xl md:text-6xl font-manrope font-bold text-primary mb-6 tracking-tight leading-[1.05]">
							Get your account <br />
							<span className="text-accent">
								setup for success.
							</span>
						</h2>
						<p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl">
							Complete these simple steps to link your YouTube
							account and start creating podcast projects.
						</p>
					</div>

					<div className="space-y-6 mb-16">
						{/* Step 0: TOS */}
						<div
							onClick={() =>
								!tosCompleted && setIsTOSModalOpen(true)
							}
							className={`flex items-start gap-6 p-6 rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
								tosCompleted
									? "bg-surface-container-high"
									: "bg-surface-container-low hover:bg-surface-container hover:shadow-sm"
							}`}
						>
							<div
								className={`size-16 rounded-xl flex items-center justify-center transition-all shrink-0 ${
									tosCompleted
										? "bg-primary text-primary-foreground"
										: "bg-background text-primary shadow-sm"
								}`}
							>
								<BookCheckIcon className="size-7" />
							</div>
							<div className="flex-1 pt-1">
								<h4
									className={`text-xl font-manrope font-bold mb-1 tracking-tight ${tosCompleted ? "text-primary" : "text-primary"}`}
								>
									Accept Terms of Service
								</h4>
								<p className="text-sm font-medium text-muted-foreground leading-relaxed">
									Review and agree to our terms to start using
									Opticast services.
								</p>
							</div>
							<div
								className={`size-10 rounded-full flex flex-col items-center justify-center transition-all shrink-0 ${
									tosCompleted
										? "bg-accent/10 text-accent"
										: "bg-transparent"
								}`}
							>
								{tosCompleted && (
									<CheckIcon
										strokeWidth={3}
										className="size-5"
									/>
								)}
							</div>
						</div>

						{/* Step 1: YouTube */}
						<div
							onClick={() =>
								!youtubeConnected && handleGoogleLogin()
							}
							className={`flex items-start gap-6 p-6 rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
								youtubeConnected
									? "bg-surface-container-high"
									: !tosCompleted
										? "opacity-50 cursor-not-allowed bg-surface-container-lowest"
										: "bg-surface-container-low hover:bg-surface-container hover:shadow-sm"
							}`}
						>
							<div
								className={`size-16 rounded-xl flex items-center justify-center transition-all shrink-0 ${
									youtubeConnected
										? "bg-[#FF0000] text-white"
										: "bg-background text-[#FF0000] shadow-sm"
								}`}
							>
								<YoutubeIcon size={28} />
							</div>
							<div className="flex-1 pt-1">
								<h4
									className={`text-xl font-manrope font-bold mb-1 tracking-tight ${youtubeConnected ? "text-primary" : "text-primary"}`}
								>
									Connect YouTube Account
								</h4>
								<p className="text-sm font-medium text-muted-foreground leading-relaxed">
									{youtubeConnected
										? "Your YouTube account is successfully connected."
										: "Authorize Opticast to access your YouTube channel data."}
								</p>
							</div>
							<div
								className={`size-10 rounded-full flex flex-col items-center justify-center transition-all shrink-0 ${
									youtubeConnected
										? "bg-accent/10 text-accent"
										: "bg-transparent"
								}`}
							>
								{youtubeConnected && (
									<CheckIcon
										strokeWidth={3}
										className="size-5"
									/>
								)}
							</div>
						</div>
					</div>

					<button
						onClick={() => router.push("/projects")}
						disabled={!allCompleted}
						className={`w-full py-5 text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-3 ${
							allCompleted
								? "bg-linear-to-br from-primary to-primary-container text-primary-foreground hover:shadow-lg hover:-translate-y-1"
								: "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
						}`}
					>
						Continue to Projects
						<ArrowBigRightIcon />
					</button>
				</div>
			</div>

			{/* TOS Modal */}
			<Dialog open={isTOSModalOpen} onOpenChange={setIsTOSModalOpen}>
				<DialogContent className="max-w-2xl bg-surface-container-lowest border-none shadow-[0px_24px_48px_rgba(25,28,30,0.06)] rounded-3xl p-10 select-none">
					<DialogHeader>
						<DialogTitle className="text-2xl font-manrope font-bold text-primary mb-2">
							Terms of Service
						</DialogTitle>
						<DialogDescription className="text-muted-foreground font-medium">
							Please review and accept our terms to proceed.
						</DialogDescription>
					</DialogHeader>

					<div className="my-6 p-6 bg-surface-container-low rounded-xl max-h-[40vh] overflow-y-auto text-sm leading-relaxed text-muted-foreground custom-scrollbar">
						<h3 className="font-semibold text-primary mb-2">
							1. Content Ownership
						</h3>
						<p className="mb-5">
							You retain all ownership rights to your content. By
							using Opticast, you grant us a limited license to
							process and distribute your content as necessary to
							provide the service.
						</p>

						<h3 className="font-semibold text-primary mb-2">
							2. Usage Limits
						</h3>
						<p className="mb-5">
							Our service is subject to limits based on your
							selected plan. Misuse or attempts to circumvent
							these limits may result in account suspension.
						</p>

						<h3 className="font-semibold text-primary mb-2">
							3. Data Privacy
						</h3>
						<p className="mb-2">
							We respect your privacy and handle your data in
							accordance with our Privacy Policy. Google user data
							is accessed only as required for YouTube
							integration.
						</p>
					</div>

					<DialogFooter className="sm:justify-start gap-3 flex-col sm:flex-row">
						<Button
							onClick={handleAcceptTOS}
							disabled={acceptTOS.isPending}
							className="flex-1 bg-linear-to-br from-primary to-primary-container text-primary-foreground font-semibold h-12 rounded-lg"
						>
							{acceptTOS.isPending
								? "Accepting..."
								: "I Accept the Terms"}
						</Button>
						<Button
							variant="outline"
							onClick={() => setIsTOSModalOpen(false)}
							className="bg-transparent border border-border text-primary font-semibold h-12 rounded-lg"
						>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
