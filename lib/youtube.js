// src/lib/youtube.ts

import { google } from "googleapis";
import { prisma } from "./db";
import ytdlp from "yt-dlp-exec";
import { spawn } from "child_process";
import path from "path";

const youtube = google.youtube({
	version: "v3",
	auth: process.env.YOUTUBE_API_KEY,
});

// Helper to parse channel ID or custom name from the URL
function parseChannelIdFromUrl(url) {
	const channelIdMatch = url.match(/youtube\.com\/channel\/([^/]+)/);
	if (channelIdMatch) return { channelId: channelIdMatch[1] };

	const customNameMatch = url.match(/youtube\.com\/(?:c|user)\/([^/]+)/);
	if (customNameMatch) return { customName: customNameMatch[1] };

	throw new Error("Invalid YouTube channel URL");
}

// Helper to parse video ID from the URL
function parseVideoIdFromUrl(url) {
	const videoIdMatch = url.match(
		/(?:v=|youtu\.be\/|\/v\/|\/embed\/|\/watch\?v=)([A-Za-z0-9_-]{11})/
	);
	return videoIdMatch ? videoIdMatch[1] : null;
}

export class YouTubeError extends Error {
	constructor(message, code) {
		super(message);
		this.name = "YouTubeError";
		this.code = code;
	}
}

export async function getVideoData(url) {
	try {
		const data = await ytdlp(url, {
			dumpSingleJson: true,
			noCheckCertificates: true,
			noWarnings: true,
			preferFreeFormats: true,
		});

		return {
			id: data.id,
			title: data.title,
			description: data.description,
			thumbnail: data.thumbnail,
			duration: data.duration,
			view_count: data.view_count,
			channel: data.channel,
			upload_date: data.upload_date,
			formats: data.formats,
		};
	} catch (error) {
		if (error.stderr?.includes("Video unavailable")) {
			throw new YouTubeError(
				"Video is unavailable or private",
				"VIDEO_UNAVAILABLE"
			);
		}
		if (error.stderr?.includes("Video blocked")) {
			throw new YouTubeError("Video is region-blocked", "VIDEO_BLOCKED");
		}
		if (error.stderr?.includes("Sign in")) {
			throw new YouTubeError(
				"Video requires sign-in",
				"SIGN_IN_REQUIRED"
			);
		}
		throw new YouTubeError(
			"Failed to fetch video data: " + (error.message || "Unknown error"),
			"FETCH_ERROR"
		);
	}
}

export async function getChannelData(url) {
	try {
		const { channelId, customName } = parseChannelIdFromUrl(url);

		// If we have a channel ID, fetch it directly
		if (channelId) {
			const response = await youtube.channels.list({
				part: ["snippet", "statistics"],
				id: [channelId],
			});
			const channel = response.data.items?.[0];
			if (!channel) throw new Error("Channel not found");
			return {
				id: channel.id,
				title: channel.snippet?.title,
				customUrl: channel.snippet?.customUrl,
				thumbnailUrl: channel.snippet?.thumbnails?.default?.url,
			};
		}

		// If we have a custom name, resolve it to a channel ID
		if (customName) {
			const response = await youtube.channels.list({
				part: ["snippet", "statistics"],
				forUsername: customName,
			});
			const channel = response.data.items?.[0];
			if (!channel) throw new Error("Channel not found");
			return {
				id: channel.id,
				title: channel.snippet?.title,
				customUrl: channel.snippet?.customUrl,
				thumbnailUrl: channel.snippet?.thumbnails?.default?.url,
			};
		}

		throw new Error("Channel ID or custom name not found in URL");
	} catch (error) {
		console.error("Error fetching channel data:", error);
		throw error;
	}
}

export async function getChannelVideos(channelId, publishedAfter) {
	try {
		const response = await youtube.search.list({
			part: ["snippet", "contentDetails", "statistics"],
			channelId,
			order: "date",
			type: "video",
			publishedAfter: publishedAfter?.toISOString(),
			maxResults: 50,
		});

		return (
			response.data.items?.map((item) => ({
				id: item.id,
				title: item.snippet?.title,
				description: item.snippet?.description,
				publishedAt: item.snippet?.publishedAt,
				channelId: item.snippet?.channelId,
				channelTitle: item.snippet?.channelTitle,
				thumbnailUrl: item.snippet?.thumbnails?.high?.url,
				duration: item.contentDetails?.duration,
				viewCount: item.statistics?.viewCount,
				likeCount: item.statistics?.likeCount,
				commentCount: item.statistics?.commentCount,
			})) || []
		);
	} catch (error) {
		console.error("Error fetching videos:", error);
		throw error;
	}
}

export async function syncChannelVideos(channelId) {
	const lastVideo = await prisma.video.findFirst({
		where: { channelId },
		orderBy: { publishedAt: "desc" },
	});

	const videos = await getChannelVideos(channelId, lastVideo?.publishedAt);

	for (const video of videos) {
		await prisma.video.create({
			data: {
				id: video?.id,
				title: video?.title,
				description: video.description,
				publishedAt: video?.publishedAt,
				channelId: video?.channelId,
			},
		});
	}
}

export async function extractAudioFromVideo(videoUrl) {
	const outputFilePath = path.resolve("public", "audio", `${Date.now()}.mp3`);

	return new Promise((resolve, reject) => {
		// Use yt-dlp to download video and pipe it to ffmpeg
		const ytdlpProcess = ytdlp.exec(
			videoUrl,
			{
				format: "bestaudio",
				output: "-",
			},
			{ stdio: ["ignore", "pipe", "inherit"] } // Redirect output to ffmpeg
		);

		const ffmpegProcess = spawn("ffmpeg", [
			"-i",
			"pipe:0",
			"-q:a",
			"0",
			"-map",
			"a",
			outputFilePath,
		]);

		// Pipe yt-dlp output to ffmpeg for audio extraction
		ytdlpProcess.stdout.pipe(ffmpegProcess.stdin);

		ffmpegProcess.on("close", (code) => {
			if (code === 0) {
				resolve(outputFilePath);
			} else {
				reject(new Error("Failed to extract audio"));
			}
		});

		ffmpegProcess.on("error", (error) => {
			reject(error);
		});
	});
}
