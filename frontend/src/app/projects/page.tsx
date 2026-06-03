"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Rss, TrendingUpIcon, Youtube } from "lucide-react";
import { useChannels } from "@/hooks/useChannels";
import { useOverviewStats } from "@/hooks/useAnalytics";
import { useMe } from "@/hooks/useAuth";

function StatSkeleton() {
	return (
		<div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm animate-pulse">
			<div className="h-3 w-24 bg-muted mb-4 rounded" />
			<div className="h-10 w-32 bg-muted rounded" />
			<div className="h-2 w-20 bg-muted/50 mt-2 rounded" />
		</div>
	);
}

function FeedRowSkeleton() {
	return (
		<tr className="border-b border-border">
			{[1, 2, 3, 4].map((i) => (
				<td key={i} className="px-6 md:px-8 py-6 md:py-8">
					<div className="h-4 bg-muted rounded animate-pulse" />
				</td>
			))}
		</tr>
	);
}

export default function GlobalProjectsOverviewPage() {
	const {
		data: channels,
		isLoading: channelsLoading,
		isError: channelsError,
	} = useChannels();
	const { data: stats, isLoading: statsLoading } = useOverviewStats(); // No channel param = global
	const { data: me, isLoading: meLoading } = useMe();
	const router = useRouter();

	// Redirect if account setup is incomplete
	useEffect(() => {
		if (!meLoading && me) {
			const isTosAccepted = !!me.tos_accepted_at;
			const isYouTubeConnected = !!me.has_youtube_connected;

			if (!isTosAccepted || !isYouTubeConnected) {
				router.push("/onboarding");
			}
		}
	}, [me, meLoading, router]);

	const isYouTubeConnected = me?.has_youtube_connected ?? false;

	const totalDownloads = stats?.total_downloads ?? 0;
	const totalEpisodes = stats?.total_episodes ?? 0;
	const totalChannels = stats?.total_channels ?? channels?.length ?? 0;

	const channelLimitReached =
		(channels?.length ?? 0) >= (me?.channel_limit ?? 1);

	return (
		<div className="max-w-5xl mx-auto p-8">
			<header className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-10 pt-8">
				<div>
					<h2 className="text-4xl font-manrope font-bold text-primary tracking-tight leading-none">
						Your Projects
					</h2>
					<p className="text-muted-foreground mt-4 font-semibold text-xs uppercase tracking-widest">
						Manage your podcast feeds and sync your content across
						platforms.
					</p>
				</div>
				{channels && channels.length > 0 && (
					<div className="flex flex-col items-end gap-2">
						<Button
							asChild={!channelLimitReached}
							disabled={channelLimitReached}
							className={`rounded-xl px-6 py-6 h-auto font-bold shadow-lg transition-all ${channelLimitReached ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70" : "hover:shadow-xl"}`}
						>
							{channelLimitReached ? (
								<span className="flex items-center gap-2">
									<Plus className="size-5" />
									Limit Reached
								</span>
							) : (
								<Link
									href="/projects/new"
									className="flex items-center gap-2"
								>
									<Plus className="size-5" />
									New Project
								</Link>
							)}
						</Button>
						{channelLimitReached && (
							<p className="text-[10px] font-bold text-accent uppercase tracking-tighter animate-pulse">
								Upgrade to add more channels
							</p>
						)}
					</div>
				)}
			</header>

			{/* Conditional CTA: Connect YouTube first, then Connect Channel */}
			{!meLoading && !isYouTubeConnected ? (
				<section className="mb-12">
					<div className="relative overflow-hidden rounded-2xl bg-surface-container shadow-[0px_24px_48px_rgba(25,28,30,0.06)] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 group">
						<div className="absolute inset-0 bg-[#FF0000]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
						<div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 w-full relative z-10">
							<div className="size-16 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shrink-0 shadow-lg">
								<Youtube className="size-8" />
							</div>
							<div className="pt-2">
								<h3 className="text-2xl font-manrope font-bold text-primary">
									Connect your YouTube Account
								</h3>
								<p className="text-muted-foreground max-w-xl text-base mt-2">
									Before creating a project, link your YouTube
									account so we can access your channels and
									sync your video uploads to podcast feeds.
								</p>
							</div>
						</div>
						<Link
							href="/onboarding"
							className="w-full md:w-auto whitespace-nowrap px-8 py-4 bg-[#FF0000] text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all text-center relative z-10"
						>
							Connect YouTube
						</Link>
					</div>
				</section>
			) : !channelsLoading &&
			  !channelsError &&
			  (channels?.length ?? 0) === 0 ? (
				<section className="mb-12">
					<div className="relative overflow-hidden rounded-2xl bg-surface-container shadow-[0px_24px_48px_rgba(25,28,30,0.06)] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 group">
						<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
						<div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 w-full relative z-10">
							<div className="size-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg">
								<Youtube className="size-8" />
							</div>
							<div className="pt-2">
								<h3 className="text-2xl font-manrope font-bold text-primary">
									Connect your YouTube Channel
								</h3>
								<p className="text-muted-foreground max-w-xl text-base mt-2">
									Automatically sync your video uploads to
									your podcast feeds and reach a wider
									audience across Spotify, Apple, and Google.
								</p>
							</div>
						</div>
						<Link
							href="/projects/new"
							className="w-full md:w-auto whitespace-nowrap px-8 py-4 bg-linear-to-br from-primary to-primary-container text-primary-foreground rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all text-center relative z-10"
						>
							Connect Channel
						</Link>
					</div>
				</section>
			) : null}

			{/* Stats */}
			<section className="mb-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Total Downloads */}
					<div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] hover:-translate-y-1 transition-transform">
						{statsLoading ? (
							<StatSkeleton />
						) : (
							<>
								<div className="flex justify-between items-start mb-4">
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
										Total Downloads
									</p>
									<span className="flex items-center text-[10px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">
										<TrendingUpIcon className="size-3 mr-1" />{" "}
										Live
									</span>
								</div>
								<p className="text-5xl font-manrope font-bold text-primary tracking-tight">
									{totalDownloads >= 1000
										? `${(totalDownloads / 1000).toFixed(1)}k`
										: totalDownloads.toLocaleString()}
								</p>
								<p className="text-xs font-medium text-muted-foreground mt-3 uppercase tracking-wider">
									All time
								</p>
							</>
						)}
					</div>

					{/* Total Episodes */}
					<div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] hover:-translate-y-1 transition-transform">
						{statsLoading ? (
							<StatSkeleton />
						) : (
							<>
								<div className="flex justify-between items-start mb-4">
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
										Total Episodes
									</p>
									<span className="flex items-center text-[10px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">
										Live
									</span>
								</div>
								<p className="text-5xl font-manrope font-bold text-primary tracking-tight">
									{totalEpisodes}
								</p>
								<p className="text-xs font-medium text-muted-foreground mt-3 uppercase tracking-wider">
									Across all projects
								</p>
							</>
						)}
					</div>

					{/* Active Channels */}
					<div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] hover:-translate-y-1 transition-transform">
						<div className="flex justify-between items-start mb-4 w-full">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
								Connected Projects
							</p>
							<span
								className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-md ${channelsLoading ? "text-muted-foreground bg-muted" : "text-accent bg-accent/10"}`}
							>
								{channelsLoading ? "—" : "Live"}
							</span>
						</div>
						<p className="text-5xl font-manrope font-bold text-primary tracking-tight">
							{totalChannels}
						</p>
					</div>
				</div>
			</section>

			{/* Active Feeds table */}
			<section className="pb-20">
				<div className="flex items-center justify-between mb-8">
					<h3 className="text-3xl font-manrope font-bold text-primary">
						Active Projects
					</h3>
				</div>

				<div className="bg-surface-container-lowest rounded-2xl shadow-[0px_24px_48px_rgba(25,28,30,0.06)] overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse min-w-[800px]">
							<thead className="bg-surface-container-low border-b border-border">
								<tr>
									<th className="px-6 md:px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
										Project
									</th>
									<th className="px-6 md:px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
										Status
									</th>
									<th className="px-6 md:px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
										Episodes
									</th>
									<th className="px-6 md:px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-widest text-right">
										Dashboard
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{/* Loading */}
								{channelsLoading &&
									[1, 2, 3].map((i) => (
										<FeedRowSkeleton key={i} />
									))}

								{/* Error */}
								{channelsError && (
									<tr>
										<td
											colSpan={4}
											className="px-8 py-16 text-center text-sm font-semibold text-destructive"
										>
											Failed to load projects. Is the
											backend running?
										</td>
									</tr>
								)}

								{/* Empty state */}
								{!channelsLoading &&
									!channelsError &&
									channels?.length === 0 && (
										<tr>
											<td
												colSpan={4}
												className="px-8 py-20 text-center"
											>
												<div
													className={`size-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isYouTubeConnected ? "bg-muted" : "bg-[#FF0000]/10"}`}
												>
													{isYouTubeConnected ? (
														<Rss className="size-8 text-muted-foreground" />
													) : (
														<Youtube className="size-8 text-[#FF0000]" />
													)}
												</div>
												<p className="text-lg font-semibold text-primary mb-2">
													{isYouTubeConnected
														? "No projects connected yet"
														: "YouTube not connected"}
												</p>
												<p className="text-muted-foreground mb-8">
													{isYouTubeConnected
														? "Get started by connecting your YouTube channel to sync episodes."
														: "Connect your YouTube account first to access your channels and create projects."}
												</p>
												<Link
													href={
														isYouTubeConnected
															? "/projects/new"
															: "/onboarding"
													}
													className={`inline-block px-8 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all ${
														isYouTubeConnected
															? "bg-linear-to-br from-primary to-primary-container text-primary-foreground"
															: "bg-[#FF0000] text-white"
													}`}
												>
													{isYouTubeConnected
														? "Connect a Channel"
														: "Connect YouTube"}
												</Link>
											</td>
										</tr>
									)}

								{/* Real data */}
								{channels?.map((channel) => (
									<tr
										key={channel.id}
										className="hover:bg-surface-container group transition-colors"
									>
										<td className="px-6 md:px-8 py-6">
											<div className="flex items-center gap-4 md:gap-5">
												{channel.effective_artwork_url ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														src={
															channel.effective_artwork_url
														}
														alt={
															channel.channel_title
														}
														className="size-12 md:size-14 rounded-lg shadow-sm object-cover shrink-0"
													/>
												) : (
													<div className="size-12 md:size-14 rounded-lg bg-surface-container-high shrink-0" />
												)}
												<Link
													href={`/projects/${channel.id}`}
													className="font-bold text-primary group-hover:text-accent transition-colors text-lg md:text-xl line-clamp-2"
												>
													{channel.podcast_title ||
														channel.channel_title}
												</Link>
											</div>
										</td>
										<td className="px-6 md:px-8 py-6">
											<span className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
												<span
													className={`size-2.5 rounded-full ${channel.monitoring_active ? "bg-[#5516be] shadow-[0_0_8px_rgba(85,22,190,0.5)]" : "bg-muted-foreground"}`}
												/>
												{channel.monitoring_active
													? "Active"
													: "Paused"}
											</span>
										</td>
										<td className="px-6 md:px-8 py-6 text-sm font-medium text-muted-foreground">
											{channel.episode_count} episodes
										</td>
										<td className="px-6 md:px-8 py-6 text-right">
											<Link
												href={`/projects/${channel.id}`}
												className="inline-flex flex-1 w-full justify-center md:flex-none items-center bg-transparent border border-border text-primary font-semibold py-2 px-6 rounded-lg hover:border-primary transition-all whitespace-nowrap"
											>
												Enter Project
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>
		</div>
	);
}
