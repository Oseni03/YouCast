import {
	getVideoData,
	YouTubeError,
	getVideoId,
	getAudioData,
} from "@/lib/youtube";
import { formatDate, formatVideo } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth"; // Assuming NextAuth is used
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust the path based on your setup
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		// Check user session
		const session = await getServerSession(authOptions);
		const user = session?.user;

		// Validate request and URL
		const { url } = await request.json();
		if (!url)
			return NextResponse.json(
				{ error: "URL is required" },
				{ status: 400 }
			);
		if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url)) {
			return NextResponse.json(
				{ error: "Invalid YouTube URL" },
				{ status: 400 }
			);
		}

		// Check if video already exists for the user
		const videoId = getVideoId(url);
		let videoData = await prisma.video.findFirst({
			where: {
				id: videoId,
				users: { some: { id: user?.id } },
			},
			include: { channel: true },
		});

		if (videoData) {
			console.log("Data found in the database");
			// Map existing video to expected structure
			videoData = formatVideo(videoData);
		} else {
			// Fetch video data and audio URL
			const [videos, audioData] = await Promise.all([
				getVideoData([videoId]),
				getAudioData(videoId),
			]);

			// Save video and audio details to the database for authenticated users
			videoData = videos[0];
			if (user) {
				await prisma.channel.upsert({
					where: { id: videoData.channelId },
					update: {},
					create: {
						id: videoData.channelId,
						title: videoData.channelTitle,
					},
				});

				await prisma.video.create({
					data: {
						id: videoData.id,
						channelId: videoData.channelId,
						title: videoData.title,
						description: videoData.description,
						thumbnailUrl:
							videoData.thumbnail || audioData.thumbnail,
						duration:
							videoData.duration?.toString() ||
							audioData?.duration?.toString(),
						publishedAt: new Date(
							formatDate(videoData.upload_date)
						),
						audioUrl: audioData.link || audioData.url,
						users: { connect: { id: user.id } },
					},
				});
			}
			console.log("Data saved");
			videoData.audioUrl = audioData.link;
		}
		// Return success response
		return NextResponse.json(videoData);
	} catch (error) {
		const errorMessage =
			error instanceof YouTubeError
				? { error: error.message, code: error.code }
				: { error: "Internal server error", code: "INTERNAL_ERROR" };
		return NextResponse.json(errorMessage, {
			status: error instanceof YouTubeError ? 400 : 500,
		});
	}
}

export async function GET(request) {
	try {
		// Get the current session to identify the user
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get pagination parameters from the URL
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const query = parseInt(searchParams.get("query") || null);

		let videos = null;

		if (query) {
			videos = await prisma.video.findMany({
				where: {
					title: {
						contains: query, // Search for titles that contain the query
						mode: "insensitive", // Make it case-insensitive
					},
				},
				include: {
					channel: {
						select: {
							id: true,
							title: true,
							thumbnailUrl: true,
						},
					},
				},
				take: limit,
				skip: (page - 1) * limit,
				orderBy: {
					publishedAt: "desc",
				},
			});
		} else {
			// Fetch paginated videos owned by the current user's channels
			videos = await prisma.video.findMany({
				where: {
					users: {
						some: {
							id: session.user?.id,
						},
					},
				},
				include: {
					channel: {
						select: {
							id: true,
							title: true,
							thumbnailUrl: true,
						},
					},
				},
				take: limit,
				skip: (page - 1) * limit,
				orderBy: {
					publishedAt: "desc",
				},
			});
		}

		// Format the videos
		const formattedVideos = videos
			.map((video) => {
				try {
					return formatVideo(video);
				} catch (error) {
					console.log(`Error formatting video ${video.id}:`, error);
					return null;
				}
			})
			.filter(Boolean); // Remove any null values from failed formatting

		return Response.json({
			videos: formattedVideos,
			page,
			pageSize: limit,
		});
	} catch (error) {
		return Response.json(
			{ error: error.message || "Internal Server Error" },
			{ status: 500 }
		);
	}
}
