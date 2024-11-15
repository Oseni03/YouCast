import { google } from "googleapis";
import { prisma } from "./db";

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
export function getVideoId(url) {
	// First try URL parser for well-formed URLs
	try {
		const urlObj = new URL(url);
		if (urlObj.hostname.includes("youtube.com")) {
			const searchParams = urlObj.searchParams.get("v");
			return searchParams;
			if (searchParams?.match(/^[A-Za-z0-9_-]{11}$/)) {
			}
		} else if (urlObj.hostname === "youtu.be") {
			const pathname = urlObj.pathname.slice(1);
			if (pathname.match(/^[A-Za-z0-9_-]{11}$/)) {
				return pathname;
			}
		}
	} catch {
		// If URL parsing fails, fall back to regex
		const match = url.match(
			/(?:v=|youtu\.be\/|\/v\/|\/embed\/|\/watch\?v=)([A-Za-z0-9_-]{11})/
		);
		return match ? match[1] : null;
	}
	return null;
}

export class YouTubeError extends Error {
	constructor(message, code) {
		super(message);
		this.name = "YouTubeError";
		this.code = code;
	}
}

// Helper function to convert ISO 8601 duration to seconds
function convertDuration(isoDuration) {
	const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return 0;

	const [_, hours, minutes, seconds] = match;
	return (
		(parseInt(hours) || 0) * 3600 +
		(parseInt(minutes) || 0) * 60 +
		(parseInt(seconds) || 0)
	);
}

export async function getVideoData(videoId) {
	try {
		if (!videoId) {
			throw new YouTubeError("Invalid YouTube URL", "INVALID_URL");
		}
		console.log("Video ID: ", videoId);

		// Initialize YouTube API client
		const youtube = google.youtube({
			version: "v3",
			auth: process.env.YOUTUBE_API_KEY, // Make sure to set this environment variable
		});

		// Fetch video data
		const response = await youtube.videos.list({
			part: ["snippet", "contentDetails"],
			id: [videoId],
		});
		// Check if video exists
		if (!response.data.items || response.data.items.length === 0) {
			throw new YouTubeError("Video not found", "VIDEO_NOT_FOUND");
		}

		const video = response.data.items[0];
		const { snippet, contentDetails, fileDetails } = video;

		// Convert ISO 8601 duration to seconds
		const duration = convertDuration(contentDetails.duration);

		const data = {
			id: videoId,
			title: snippet.title,
			description: snippet.description,
			channelTitle: snippet.channelTitle,
			channelId: snippet.channelId,
			thumbnail: snippet.thumbnails.high.url,
			duration: duration,
			upload_date: snippet.publishedAt.split("T")[0].replace(/-/g, ""),
		};
		return data;
	} catch (error) {
		if (error instanceof YouTubeError) {
			throw error;
		}

		if (error.response) {
			switch (error.response.status) {
				case 403:
					throw new YouTubeError(
						"API key invalid or quota exceeded",
						"API_ERROR"
					);
				case 404:
					throw new YouTubeError(
						"Video not found",
						"VIDEO_NOT_FOUND"
					);
				default:
					throw new YouTubeError(
						`API error: ${error.response.status} ${error.response.statusText}`,
						"API_ERROR"
					);
			}
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
		console.log("Error fetching channel data:", error);
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
		console.log("Error fetching videos:", error);
		throw error;
	}
}

export async function getAudioData(videoId) {
	const url = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
	const options = {
		method: "GET",
		headers: {
			"x-rapidapi-key": process.env.YOUTUBE_MP3_RAPIDAPI_KEY, // Use an environment variable
			"x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
		},
	};

	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const result = await response.json(); // Parse JSON for structured response
		return result;
		// Optional: Access the MP3 URL in result as needed
		// console.log(`MP3 URL: ${result.link}`);
	} catch (error) {
		console.log("Error fetching audio URL:", error);
		return { error: error };
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
