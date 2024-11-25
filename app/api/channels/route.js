// src/app/api/channels/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getChannelData } from "@/lib/youtube";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PAGINATION_PAGE_SIZE } from "@/utils/constants";

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { url } = await request.json();
		const channelData = await getChannelData(url);

		if (!channelData) {
			return NextResponse.json(
				{ error: "Failed to fetch channel data" },
				{ status: 400 }
			);
		}

		// Create or update channel
		const channel = await prisma.channel.upsert({
			where: { id: channelData.id },
			update: channelData,
			create: channelData,
		});

		// Create subscription (if it doesn't exist)
		await prisma.subscription.upsert({
			where: {
				// Using the composite unique constraint
				userId_channelId: {
					userId: session.user.id,
					channelId: channel.id,
				},
			},
			update: {}, // No updates needed if it exists
			create: {
				userId: session.user.id,
				channelId: channel.id,
			},
		});

		// // Sync channel videos
		// await syncChannelVideos(channelData.id);

		// Return channel with subscription status
		const channelWithSubscription = await prisma.channel.findUnique({
			where: { id: channel.id },
			include: {
				subscribers: {
					where: {
						userId: session.user.id,
					},
				},
			},
		});

		return NextResponse.json(channelWithSubscription);
	} catch (error) {
		return NextResponse.json(
			{ error: error || "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get pagination parameters from the URL
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(
			searchParams.get("limit") || PAGINATION_PAGE_SIZE
		);

		// Get channels using the Subscription relation
		const channels = await prisma.channel.findMany({
			where: {
				subscribers: {
					some: {
						userId: session.user.id,
					},
				},
			},
			include: {
				subscribers: {
					where: {
						userId: session.user.id,
					},
					select: {
						createdAt: true, // Include subscription date
					},
				},
				_count: {
					select: {
						subscribers: true, // Get total subscriber count
					},
				},
			},
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
			},
		});

		// Get total count for pagination
		const totalChannels = await prisma.channel.count({
			where: {
				subscribers: {
					some: {
						userId: session.user.id,
					},
				},
			},
		});

		// Format the response
		const formattedChannels = channels.map((channel) => ({
			...channel,
			subscribedAt: channel.subscribers[0]?.createdAt,
			subscriberCount: channel._count.subscribers,
			// Remove the raw subscribers array from response
			subscribers: undefined,
			_count: undefined,
		}));

		return NextResponse.json({
			channels: formattedChannels,
			page,
			pageSize: limit,
			totalChannels,
			totalPages: Math.ceil(totalChannels / limit),
		});
	} catch (error) {
		return NextResponse.json(
			{ error: error.message || "Failed to fetch channels" },
			{ status: 500 }
		);
	}
}
