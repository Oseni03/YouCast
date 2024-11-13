import {
	extractAudioAdvanced,
	getVideoData,
	YouTubeError,
	download,
	getVideoId,
} from "@/lib/youtube";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth"; // Assuming NextAuth is used
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust the path based on your setup
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// Helper function to download video
async function downloadVideo(url, videoId) {
	const downloadDir = path.resolve("public", "downloads");
	const videoPath = path.join(downloadDir, `${videoId}.mp4`);

	// Ensure download directory exists
	if (!fs.existsSync(downloadDir)) {
		fs.mkdirSync(downloadDir, { recursive: true });
	}

	// Download video if it doesn't exist
	if (!fs.existsSync(videoPath)) {
		await download(url, videoPath);
	}

	return videoPath;
}

// Configure output paths
const AUDIO_DIR = path.resolve("public", "audio");
if (!fs.existsSync(AUDIO_DIR)) {
	fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export async function POST(request) {
	try {
		// Get the current user session
		const session = await getServerSession(authOptions);
		const user = session?.user;

		const {
			url,
			audioFormat = "mp3",
			audioBitrate = "128k",
		} = await request.json();

		if (!url) {
			return Response.json({ error: "URL is required" }, { status: 400 });
		}

		// Validate YouTube URL
		const youtubeUrlPattern =
			/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
		if (!youtubeUrlPattern.test(url)) {
			return Response.json(
				{ error: "Invalid YouTube URL" },
				{ status: 400 }
			);
		}

		// Check if the video is already in the database
		let videoData;
		const existingVideo = await prisma.video.findFirst({
			where: {
				id: getVideoId(url),
				users: {
					some: {
						id: user?.id,
					},
				},
			},
			include: {
				users: true,
			},
		});

		if (existingVideo) {
			videoData = {
				id: existingVideo.id,
				title: existingVideo.title,
				description: existingVideo.description,
				thumbnail: existingVideo.thumbnailUrl,
				duration: parseInt(existingVideo.duration),
				view_count: 0, // Not available from database
				channel: existingVideo.channel.channelId,
				upload_date: existingVideo.publishedAt
					.toString()
					.split("T")[0]
					.replace(/-/g, ""),
				audio: {
					url: existingVideo.audioUrl,
					format: audioFormat,
					bitrate: audioBitrate,
				},
			};
		} else {
			// Get video metadata
			videoData = await getVideoData(url);

			// Generate unique filename based on video ID and timestamp
			const filename = `${videoData.id}_${Date.now()}`;
			const outputPath = path.join(
				AUDIO_DIR,
				`${filename}.${audioFormat}`
			);

			// Download video
			const videoPath = await downloadVideo(url, videoData.id);

			// Extract audio with specified format and options
			const audioPath = await extractAudioAdvanced(videoPath, {
				format: audioFormat,
				bitrate: audioBitrate,
				outputPath,
			});

			// Clean up downloaded video file
			fs.unlinkSync(videoPath);

			// Calculate relative paths for client
			const audioUrl = `/audio/${path.basename(audioPath)}`;

			// Save video data to the database if the user is authenticated
			if (user) {
				const newVideo = await prisma.video.create({
					data: {
						id: videoData.id,
						channelId: videoData.channel,
						title: videoData.title,
						description: videoData.description,
						thumbnailUrl: videoData.thumbnail,
						duration: videoData.duration.toString(),
						publishedAt: new Date(videoData.upload_date),
						audioUrl,
						users: {
							connect: {
								id: user.id,
							},
						},
					},
				});

				videoData.audio = {
					url: audioUrl,
					format: audioFormat,
					bitrate: audioBitrate,
				};
			}
		}

		// Return success response with all data
		return NextResponse.json({
			success: true,
			video: videoData,
		});
	} catch (error) {
		// console.log("Error processing YouTube video:", error);

		if (error instanceof YouTubeError) {
			return NextResponse.json(
				{ error: error.message, code: error.code },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Internal server error", code: "INTERNAL_ERROR" },
			{ status: 500 }
		);
	}
}

export async function GET(request) {
	try {
		// Get the current session to identify the user
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Fetch all videos owned by the current user's channels
		const userVideos = await prisma.video.findMany({
			where: {
				channel: {
					subscribers: {
						some: {
							id: session.user.id,
						},
					},
				},
			},
			include: {
				channel: true, // Include related channel data if needed
			},
			orderBy: {
				publishedAt: "desc",
			},
		});

		return Response.json(userVideos);
	} catch (error) {
		// console.log("Error retrieving user videos:", error);
		return Response.json({ error: error }, { status: 500 });
	}
}
