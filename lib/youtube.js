import { google } from "googleapis";
import { prisma } from "./db";
import pLimit from "p-limit";

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
		// Clean and validate URL
		const cleanUrl = cleanYoutubeUrl(url);

		// Extract username, handling different URL formats
		let username;
		if (cleanUrl.includes("youtube.com/@")) {
			username = cleanUrl.split("@").pop();
		} else if (cleanUrl.includes("youtube.com/c/")) {
			username = cleanUrl.split("/c/").pop();
		} else if (cleanUrl.includes("youtube.com/channel/")) {
			const channelId = cleanUrl.split("/channel/").pop();
			const response = await youtube.channels.list({
				part: ["snippet", "statistics"],
				id: [channelId],
			});
			const channelDetails = response.data.items?.[0];
			if (!channelDetails) throw new Error("Channel not found");
			console.log(channelDetails);
			return {
				id: channelDetails.id,
				title: channelDetails.snippet?.title,
				customUrl: channelDetails.snippet?.customUrl,
				thumbnailUrl: channelDetails.snippet?.thumbnails?.default?.url,
			};
		} else {
			throw new Error("Invalid YouTube channel URL format");
		}

		if (!username)
			throw new Error("Could not extract channel username from URL");

		// Search for the channel
		const handleResponse = await youtube.search.list({
			part: ["snippet"],
			q: username,
			type: ["channel"],
			maxResults: 1,
		});

		const channel = handleResponse.data.items?.[0];
		if (!channel) throw new Error("Channel not found");

		// Get detailed channel info
		const channelResponse = await youtube.channels.list({
			part: ["snippet", "statistics"],
			id: [channel.snippet.channelId],
		});

		const channelDetails = channelResponse.data.items?.[0];
		if (!channelDetails) throw new Error("Channel details not found");

		console.log(channelDetails);

		return {
			id: channelDetails.id,
			title: channelDetails.snippet?.title,
			customUrl: channelDetails.snippet?.customUrl || `@${username}`,
			thumbnailUrl: channelDetails.snippet?.thumbnails?.default?.url,
		};
	} catch (error) {
		throw error;
	}
}

function cleanYoutubeUrl(url) {
	return url
		.trim()
		.split("?")[0]
		.replace(/\/$/, "")
		.replace(/^https?:\/\/(www\.)?/, "");
}

export async function getChannelVideos(channelId, publishedAfter) {
	try {
		const response = await youtube.search.list({
			part: ["snippet", "contentDetails", "statistics"],
			channelId,
			order: "date",
			type: "video",
			publishedAfter: publishedAfter?.toISOString(),
			maxResults: 10,
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

	// Use bulk insert to optimize performance instead of inserting one by one
	const videoData = videos.map((video) => ({
		id: video?.id,
		title: video?.title,
		description: video.description || "",
		publishedAt: video?.publishedAt,
		channelId: video?.channelId,
	}));

	await prisma.video.createMany({
		data: videoData,
		skipDuplicates: true, // Prevent duplication errors
	});
}

export async function syncUserChannelVideos(session) {
	const channels = await prisma.channel.findMany({
		where: {
			subscribers: {
				some: {
					id: session?.user?.id,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
	console.log("channels", channels);

	// Limit the number of concurrent tasks
	const limit = pLimit(5); // Adjust concurrency level as needed
	console.log("Limits", limit);

	await Promise.all(
		channels.map((channel) => limit(() => syncChannelVideos(channel.id)))
	);
}
