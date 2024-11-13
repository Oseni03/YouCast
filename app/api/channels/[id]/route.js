import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
	try {
		const channelId = params.id;

		// Delete the channel
		await prisma.channel.delete({
			where: { id: channelId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.log("Error deleting channel:", error);
		return NextResponse.json(
			{ error: "Failed to delete channel" },
			{ status: 500 }
		);
	}
}
