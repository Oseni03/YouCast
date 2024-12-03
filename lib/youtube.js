import { google } from "googleapis";
import { prisma } from "./db";
import pLimit from "p-limit";
import { formatDate } from "./utils";

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

export async function getVideoData(videoIds) {
	try {
		if (!videoIds.length > 0) {
			throw new YouTubeError("Invalid Video Ids", "INVALID_IDS");
		}
		console.log("Video IDs: ", videoIds);

		// Initialize YouTube API client
		const youtube = google.youtube({
			version: "v3",
			auth: process.env.YOUTUBE_API_KEY, // Make sure to set this environment variable
		});

		// Fetch video data
		const response = await youtube.videos.list({
			part: ["snippet", "contentDetails"],
			id: videoIds,
		});
		// Check if video exists
		if (!response.data.items || response.data.items.length === 0) {
			throw new YouTubeError("Video not found", "VIDEO_NOT_FOUND");
		}

		const videos =
			response.data.items?.map((item) => ({
				id: item.id,
				title: item.snippet?.title,
				description: item.snippet?.description,
				publishedAt: item.snippet?.publishedAt,
				channelId: item.snippet?.channelId,
				channelTitle: item.snippet?.channelTitle,
				thumbnail: item.snippet?.thumbnails?.high?.url,
				duration: convertDuration(item.contentDetails?.duration),
				upload_date: item.snippet?.publishedAt
					.split("T")[0]
					.replace(/-/g, ""),
			})) || [];
		console.log("Videos resp: ", videos);
		return videos;
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
		// First, search for video IDs
		const searchResponse = await youtube.search.list({
			part: ["id", "snippet"],
			channelId,
			order: "date",
			type: "video",
			publishedAfter: publishedAfter?.toISOString(),
			maxResults: 10,
		});

		// Extract video IDs
		const videoIds = searchResponse.data.items
			?.map((item) => item.id.videoId)
			.filter(Boolean);
		console.log("Video IDs", videoIds);

		if (!videoIds || videoIds.length === 0) {
			return [];
		}

		// Fetch detailed video information
		const videos = await getVideoData(videoIds);
		const audios = await Promise.all(videoIds.map(getAudioData));
		console.log("Videos", videos);
		console.log("Audios", audios);

		// Map audio links to the corresponding videos
		const data = videos.map((video) => {
			const matchingAudio = audios.find((audio) => audio.id === video.id);
			return {
				...video,
				audioUrl: matchingAudio ? matchingAudio.link : null, // Add audioUrl or set to null if no match
			};
		});
		console.log("final data", data);

		return data;
	} catch (error) {
		console.error("Error fetching channel videos:", error);

		// More detailed error handling
		if (error.response) {
			console.error("YouTube API Error Response:", {
				status: error.response.status,
				data: error.response.data,
			});
		}

		throw error;
	}
}

export async function getAudioData(videoId) {
	// First endpoint configuration
	const firstUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
	const firstOptions = {
		method: "GET",
		headers: {
			"x-rapidapi-key": process.env.YOUTUBE_MP3_RAPIDAPI_KEY, // Use an environment variable
			"x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
		},
	};

	try {
		// First API request
		const firstResponse = await fetch(firstUrl, firstOptions);

		if (!firstResponse.ok) {
			throw new Error(`HTTP error! Status: ${firstResponse.status}`);
		}

		const firstResult = await firstResponse.json();

		// Check if the message indicates success
		if (firstResult.msg === "success") {
			console.log("AUdio resp: ", firstResult);
			return firstResult; // Return the successful response
		} else {
			console.log("First API failed, attempting fallback...");
		}
	} catch (error) {
		console.log("Error fetching from first API:", error);
	}

	// Fallback endpoint configuration
	const fallbackUrl = `https://youtube-mp3-download3.p.rapidapi.com/downloads/convert_audio?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}&format=mp3`;
	const fallbackOptions = {
		method: "GET",
		headers: {
			"x-rapidapi-key": process.env.YOUTUBE_MP3_RAPIDAPI_KEY, // Use the same environment variable
			"x-rapidapi-host": "youtube-mp3-download3.p.rapidapi.com",
		},
	};

	try {
		// Fallback API request
		const fallbackResponse = await fetch(fallbackUrl, fallbackOptions);

		if (!fallbackResponse.ok) {
			throw new Error(
				`Fallback HTTP error! Status: ${fallbackResponse.status}`
			);
		}

		const fallbackResult = await fallbackResponse.json(); // The fallback API returns text

		// Parse the fallback result if needed (adjust based on the API response structure)
		console.log("Fallback API result:", fallbackResult);

		return fallbackResult;
	} catch (error) {
		console.log("Error fetching from fallback API:", error);
		return { error: "Failed to fetch audio data from both APIs" };
	}
}

export async function syncChannelVideos(channelId, userId) {
	// Fetch the user's credit balance
	console.log("Syncing channel...: ", channelId);
	console.log("Syncing user...: ", userId);

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { credits: true },
	});
	console.log("Got user credits: ", user);

	if (!user) {
		throw new Error("User not found");
	}

	const userCredits = user.credits;
	if (userCredits <= 0) {
		console.log("User has no credits to sync videos.");
		return {
			success: false,
			message: "Insufficient credits",
			videos: [],
		};
	}

	console.log("User's current credit balance:", userCredits);

	// Find the last video for this channel
	const lastVideo = await prisma.video.findFirst({
		where: { channelId },
		orderBy: { publishedAt: "desc" },
	});

	console.log("Channel last video:", lastVideo);

	// Fetch new videos published after the last video
	const videos = await getChannelVideos(channelId, lastVideo?.publishedAt);
	console.log("Channel videos:", videos);

	// Ensure there are videos to process
	if (!videos || videos.length === 0) {
		console.log("No new videos found for this channel.");
		return {
			success: true,
			message: "No new videos found",
			videos: [],
		};
	}

	// Limit videos to the user's credit balance
	const videosToSync = videos.slice(0, userCredits);

	const readyVideos = videosToSync.map((video) => ({
		id: video.id,
		channelId: video.channelId,
		title: video.title,
		description: video.description,
		thumbnailUrl: video.thumbnail,
		duration: video.duration?.toString(),
		publishedAt: new Date(formatDate(video.upload_date)),
		audioUrl: video?.audioUrl || null,
	}));

	console.log("Ready videos to sync:", readyVideos);

	// Insert videos in bulk
	await prisma.video.createMany({
		data: readyVideos,
		skipDuplicates: true, // Prevent errors for already-existing videos
	});
	console.log("Successfully created videos");

	// Connect videos to the user in bulk
	const videoIds = readyVideos.map((video) => ({ id: video.id }));
	console.log("Video ids", videoIds);
	await prisma.user.update({
		where: { id: userId },
		data: {
			videos: { connect: videoIds },
			credits: { decrement: readyVideos.length }, // Deduct credits
		},
	});
	console.log(
		"Successfully created user videos connection and updated credits"
	);

	// Return the synced videos
	return {
		success: true,
		message: "Videos synced successfully",
		videos: readyVideos,
	};
}

export async function syncUserChannelVideos(userId) {
	console.log("User to sync: ", userId);
	const channels = await prisma.channel.findMany({
		where: {
			subscribers: {
				some: {
					userId: userId,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
	console.log("channels", channels);

	// Ensure there are channels to process
	if (!channels || channels.length === 0) {
		console.log("User not subscribed to any channel.");
		return {
			success: true,
			message: "No channels found",
			videos: [],
		};
	}

	// Limit the number of concurrent tasks
	const limit = pLimit(5); // Adjust concurrency level as needed
	console.log("Limits", limit);

	const syncResults = await Promise.all(
		channels.map(async (channel) => {
			return syncChannelVideos(channel.id, userId);
		})
	);

	return syncResults.flat();
}
