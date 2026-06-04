"use client";

import Link from "next/link";
import {
	ArrowRight,
	Play,
	WandSparkles,
	Rss,
	Activity,
	Check,
	Users,
} from "lucide-react";
import { useMe } from "@/hooks/useAuth";
import { AppLogo } from "@/components/app-logo";

export default function Home() {
	const { data: user } = useMe();

	return (
		<div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
			<nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl glass-nav">
				<div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
					<div className="flex items-center gap-3 group cursor-pointer">
						<div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform group-hover:rotate-12">
							<AppLogo
								width={24}
								height={24}
								className="object-contain"
							/>
						</div>
						<span className="text-xl font-manrope font-bold tracking-tight">
							Opticast
						</span>
					</div>
					<div className="hidden md:flex items-center gap-8 font-medium">
						<a
							href="#features"
							className="text-sm hover:text-primary transition-all"
						>
							Features
						</a>
						<a
							href="#workflow"
							className="text-sm hover:text-primary transition-all"
						>
							How it Works
						</a>
						<a
							href="#pricing"
							className="text-sm hover:text-primary transition-all"
						>
							Pricing
						</a>
						{user ? (
							<Link
								href="/projects"
								className="text-sm font-semibold bg-linear-to-r from-primary to-primary-container text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-sm"
							>
								Dashboard
							</Link>
						) : (
							<>
								<Link
									href="/login"
									className="text-sm font-semibold hover:text-primary transition-colors"
								>
									Login
								</Link>
								<Link
									href="/signup"
									className="text-sm font-semibold bg-linear-to-r from-primary to-primary-container text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-sm"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-40">
				<div className="text-left max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-4 md:mt-12">
					<p className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-6">
						For YouTube creators who want a podcast without extra
						workflow
					</p>
					<h1 className="text-5xl sm:text-6xl md:text-[72px] lg:text-[88px] font-manrope font-bold tracking-tight leading-[0.95] mb-6 md:mb-8 text-primary">
						Turn YouTube uploads into{" "}
						<span className="text-accent hover:translate-x-2 transition-transform inline-block">
							a Podcast.
						</span>
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 md:mb-10 leading-relaxed font-normal">
						Auto audio cleanup, RSS hosting, and distribution for
						creator-approved channels.
					</p>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
						{user ? (
							<Link
								href="/projects"
								className="w-full sm:w-auto px-10 py-5 bg-linear-to-br from-primary to-primary-container text-primary-foreground text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
							>
								Open Your Dashboard
								<ArrowRight />
							</Link>
						) : (
							<Link
								href="/signup"
								className="w-full sm:w-auto px-10 py-5 bg-linear-to-br from-primary to-primary-container text-primary-foreground text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
							>
								Start Free — No Credit Card
								<ArrowRight />
							</Link>
						)}
						<a
							href="#features"
							className="w-full sm:w-auto px-10 py-5 bg-surface text-primary border border-border text-lg font-semibold rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-3"
						>
							See Key Benefits
						</a>
					</div>
				</div>

				<section className="mt-24 md:mt-40 rounded-3xl bg-surface-container-lowest p-10 shadow-sm">
					<div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] items-center">
						<div className="space-y-6">
							<h2 className="text-3xl font-bold text-primary">
								Built for creators who treat YouTube as the
								source of their podcast.
							</h2>
							<p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
								Opticast is the easiest way for video creators
								to launch a podcast without duplicating effort.
								You keep publishing video to YouTube; we turn
								each approved upload into a podcast episode with
								RSS, hosting, and directory distribution.
							</p>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-3xl bg-surface p-6 border border-border">
								<p className="text-sm font-semibold text-primary mb-2">
									No second audio workflow
								</p>
								<p className="text-sm text-muted-foreground">
									Your videos become podcast-ready
									automatically, no separate export or audio
									editor required.
								</p>
							</div>
							<div className="rounded-3xl bg-surface p-6 border border-border">
								<p className="text-sm font-semibold text-primary mb-2">
									Podcast hosting included
								</p>
								<p className="text-sm text-muted-foreground">
									We host audio, generate your feed, and keep
									your show available on Apple Podcasts,
									Spotify, and more.
								</p>
							</div>
							<div className="rounded-3xl bg-surface p-6 border border-border">
								<p className="text-sm font-semibold text-primary mb-2">
									Creator-authorized only
								</p>
								<p className="text-sm text-muted-foreground">
									We process only channels you connect,
									keeping everything within YouTube’s terms
									and your ownership intact.
								</p>
							</div>
							<div className="rounded-3xl bg-surface p-6 border border-border">
								<p className="text-sm font-semibold text-primary mb-2">
									Actionable analytics
								</p>
								<p className="text-sm text-muted-foreground">
									See downloads, episode performance, and
									listener trends from one creator-focused
									dashboard.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* How It Works */}
				<section
					id="workflow"
					className="mt-24 md:mt-40 bg-surface-container-lowest rounded-2xl p-10 shadow-sm"
				>
					<h2 className="text-3xl font-bold mb-6 text-primary">
						How It Works
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="p-6 bg-surface rounded-xl">
							<div className="size-12 rounded-full bg-primary/10 text-primary mb-4 flex items-center justify-center">
								<Users className="size-6" />
							</div>
							<h3 className="font-semibold mb-2">
								Connect Your Channel
							</h3>
							<p className="text-sm text-muted-foreground">
								Sign in with Google and give Opticast permission
								to sync uploads from your channel.
							</p>
						</div>
						<div className="p-6 bg-surface rounded-xl">
							<div className="size-12 rounded-full bg-primary/10 text-primary mb-4 flex items-center justify-center">
								<Play className="size-6" />
							</div>
							<h3 className="font-semibold mb-2">
								Auto-Extract & Clean
							</h3>
							<p className="text-sm text-muted-foreground">
								We extract audio, remove noise, and normalize
								levels to broadcast-ready quality automatically.
							</p>
						</div>
						<div className="p-6 bg-surface rounded-xl">
							<div className="size-12 rounded-full bg-primary/10 text-primary mb-4 flex items-center justify-center">
								<Check className="size-6" />
							</div>
							<h3 className="font-semibold mb-2">
								Publish Everywhere
							</h3>
							<p className="text-sm text-muted-foreground">
								We host your episodes, generate an RSS feed, and
								submit metadata to directories so your show is
								available everywhere.
							</p>
						</div>
					</div>
				</section>

				<div id="features" className="mt-24 md:mt-40 scroll-m-24">
					<div className="mb-10 max-w-2xl">
						<h2 className="text-3xl font-bold text-primary mb-3">
							Why creators choose Opticast
						</h2>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Automatic podcast production for YouTube creators
							who want their video uploads to publish everywhere.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
						<div className="text-left p-10 bg-surface-container-lowest rounded-2xl shadow-sm transition-all group relative overflow-hidden">
							<div className="size-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-8 transition-all duration-700">
								<WandSparkles
									className="size-8"
									strokeWidth={2}
								/>
							</div>
							<h3 className="text-2xl font-manrope font-bold mb-4 text-primary">
								AI Audio Pro
							</h3>
							<p className="text-base text-muted-foreground leading-relaxed">
								Advanced background noise removal and
								normalization for that perfect studio sound,
								every single time.
							</p>
							<div className="mt-8 flex items-center gap-2 text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
								Learn More <ArrowRight className="size-4" />
							</div>
						</div>
						<div className="text-left p-10 bg-surface-container-lowest rounded-2xl shadow-sm transition-all group relative overflow-hidden">
							<div className="size-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-8 transition-all duration-700">
								<Rss className="size-8" strokeWidth={2} />
							</div>
							<h3 className="text-2xl font-manrope font-bold mb-4 text-primary">
								Auto-Sync
							</h3>
							<p className="text-base text-muted-foreground leading-relaxed">
								Your videos become a podcast feed automatically.
								We handle RSS, hosting, and directory metadata
								so you don’t have to.
							</p>
							<div className="mt-8 flex items-center gap-2 text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
								Learn More <ArrowRight className="size-4" />
							</div>
						</div>

						<div className="text-left p-10 bg-surface-container-lowest rounded-2xl shadow-sm transition-all group relative overflow-hidden">
							<div className="size-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-8 transition-all duration-700">
								<Activity className="size-8" strokeWidth={2} />
							</div>
							<h3 className="text-2xl font-manrope font-bold mb-4 text-primary">
								Listener analytics
							</h3>
							<p className="text-base text-muted-foreground leading-relaxed">
								Track downloads, episode performance, and
								listener trends in one creator-focused
								dashboard.
							</p>
							<div className="mt-8 flex items-center gap-2 text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
								Learn More <ArrowRight className="size-4" />
							</div>
						</div>
					</div>
				</div>

				{/* Pricing */}
				<section id="pricing" className="mt-16 md:mt-24">
					<h2 className="text-3xl font-bold mb-6 text-primary">
						Plans that scale
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="p-6 rounded-2xl bg-surface-container-lowest">
							<h3 className="text-xl font-semibold mb-2">Free</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Launch your first episodes and test the workflow
								with your channel.
							</p>
							<div className="font-bold text-xl mb-4">
								$0 / month
							</div>
							<a
								className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
								href="/projects/settings#billing"
							>
								Start Free
								<ArrowRight />
							</a>
						</div>
						<div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary-container/5 border border-primary">
							<h3 className="text-xl font-semibold mb-2">
								Creator
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Automatic RSS, advanced audio polish, and
								listener analytics built for growth.
							</p>
							<div className="font-bold text-xl mb-4">
								$19 / month
							</div>
							<a
								className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
								href="/projects/settings#billing"
							>
								Choose Creator
								<ArrowRight />
							</a>
						</div>
						<div className="p-6 rounded-2xl bg-surface-container-lowest">
							<h3 className="text-xl font-semibold mb-2">
								Agency
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Multi-channel management, team seats, priority
								support
							</p>
							<div className="font-bold text-xl mb-4">
								Contact Us
							</div>
							<a
								className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
								href="/projects/settings#billing"
							>
								Contact Sales
								<ArrowRight />
							</a>
						</div>
					</div>
				</section>
			</main>

			<footer className="py-16 md:py-24 bg-surface-container-high border-t border-surface-container-highest">
				<div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
					<div className="flex items-center gap-3">
						<div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
							<AppLogo
								width={20}
								height={20}
								className="object-contain"
							/>
						</div>
						<span className="text-lg font-manrope font-bold tracking-tight">
							Opticast
						</span>
					</div>
					<div className="flex gap-8 text-sm font-medium text-muted-foreground">
						<a
							href="#"
							className="hover:text-primary transition-colors"
						>
							Privacy Policy
						</a>
						<a
							href="#"
							className="hover:text-primary transition-colors"
						>
							Terms of Service
						</a>
						<a
							href="#"
							className="hover:text-primary transition-colors"
						>
							Contact Us
						</a>
					</div>
					<p className="text-sm text-muted-foreground">
						© 2024 Opticast Inc. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
