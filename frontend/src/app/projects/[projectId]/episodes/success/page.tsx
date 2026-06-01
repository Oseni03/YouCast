"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";
import {
	CheckCircle2Icon,
	FileMusicIcon,
	PodcastIcon,
	SearchIcon,
} from "lucide-react";

export default function SuccessPage() {
	const { projectId } = useParams() as { projectId: string };
	return (
		<div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center">
				<div className="mb-10 relative inline-block">
					<div className="size-28 bg-gradient-to-br from-primary to-primary-container text-primary-foreground rounded-3xl flex items-center justify-center shadow-[0px_24px_48px_rgba(25,28,30,0.12)] mx-auto ring-4 ring-primary/10">
						<CheckCircle2Icon className="w-14 h-14" />
					</div>
					<span className="absolute -top-2 -right-2 size-6 bg-primary rounded-full ring-4 ring-surface-container-lowest block" />
				</div>

				<h1 className="text-4xl font-manrope font-bold text-primary tracking-tight mb-4">
					Well Done!
				</h1>
				<p className="text-muted-foreground mb-12 mt-3 font-medium text-sm leading-relaxed">
					Your episode is being processed and will be live on all
					platforms within the next few minutes.
				</p>

				<div className="space-y-4">
					<Button
						asChild
						className="h-auto w-full py-4 bg-gradient-to-br from-primary to-primary-container text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-base"
					>
						<Link href={`/projects/${projectId}`}>
							Back to Dashboard
						</Link>
					</Button>
					<button className="w-full py-4 bg-surface-container-low hover:bg-surface-container-high text-primary font-semibold rounded-xl transition-colors duration-200 text-base">
						View Details
					</button>
				</div>

				<div className="mt-14 pt-8 border-t border-border">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-8">
						Distribution Status
					</p>
					<div className="flex justify-center flex-wrap gap-6 md:gap-10">
						{[PodcastIcon, FileMusicIcon, SearchIcon].map(
							(Icon, i) => (
								<div
									key={i}
									className="flex flex-col items-center gap-3"
								>
									<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/10">
										<Icon className="w-5 h-5" />
									</div>
									<span className="text-xs font-semibold text-primary/70">
										Live
									</span>
								</div>
							),
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
