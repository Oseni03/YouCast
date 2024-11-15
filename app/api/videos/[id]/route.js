import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
	try {
		// Extract video ID from the query params
		const videoId = params.id;

		if (!videoId) {
			return Response.json(
				{ error: "Video ID is required" },
				{ status: 400 }
			);
		}

		// Fetch video data by ID
		const video = await prisma.video.findUnique({
			where: { id: videoId },
			include: {
				channel: true, // Include related channel data if needed
			},
		});

		if (!video) {
			return Response.json({ error: "Video not found" }, { status: 404 });
		}

		return Response.json(video);
	} catch (error) {
		console.error("Error fetching video:", error);
		return Response.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request, { params }) {
	try {
		// Extract video ID from the request body
		const { id } = await params;

		if (!id) {
			return Response.json(
				{ error: "Video ID is required" },
				{ status: 400 }
			);
		}

		// Delete the video from the database
		const deletedVideo = await prisma.video.delete({
			where: { id },
		});

		return Response.json({ success: true, deletedVideo });
	} catch (error) {
		console.error("Error deleting video:", error);

		if (error.code === "P2025") {
			// Prisma specific error code for record not found
			return Response.json({ error: "Video not found" }, { status: 404 });
		}

		return Response.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
