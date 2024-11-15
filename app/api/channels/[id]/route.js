import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(request, { params }) {
	try {
		// Get the current session to identify the user
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const channelId = await params.id;
		console.log("Channel ID: ", channelId);

		// Update the channel by removing the current user from subscribers
		await prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				subscribers: {
					disconnect: {
						id: session.user.id,
					},
				},
			},
		});
		console.log("Successfully unsubscribed");

		return NextResponse.json({
			success: true,
			message: "Successfully unsubscribed from channel",
		});
	} catch (error) {
		console.log("Error unsubscribing from channel:", error);

		// Handle specific errors
		if (error.code === "P2025") {
			return NextResponse.json(
				{ error: "Channel not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to unsubscribe from channel" },
			{ status: 500 }
		);
	}
}
