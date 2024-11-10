// src/app/api/channels/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getChannelData, syncChannelVideos } from "@/lib/youtube";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { channelUrl } = await request.json();
		const channelData = await getChannelData(channelUrl);

		// Create or update channel
		const channel = await prisma.channel.upsert({
			where: { id: channelData.id },
			update: channelData,
			create: channelData,
		});

		// Subscribe user to channel
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				subscriptions: {
					connect: { id: channel.id },
				},
			},
		});

		// Sync channel videos
		await syncChannelVideos(channelData.id);

		return NextResponse.json(channel);
	} catch (error) {
		console.error("Error creating channel:", error);
		return NextResponse.json(
			{ error: "Failed to create channel" },
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

		const channels = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				subscriptions: {
					include: {
						videos: {
							orderBy: { publishedAt: "desc" },
							take: 10,
						},
					},
				},
			},
		});

		return NextResponse.json(channels?.subscriptions || []);
	} catch (error) {
		console.error("Error fetching channels:", error);
		return NextResponse.json(
			{ error: "Failed to fetch channels" },
			{ status: 500 }
		);
	}
}
