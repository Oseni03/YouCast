import {
	extractAudioAdvanced,
	getVideoData,
	YouTubeError,
} from "@/lib/youtube";

export async function POST(request) {
	try {
		const { url } = await request.json();

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

		// Process video data and audio extraction concurrently
		const [videoData, audioPath] = await Promise.all([
			getVideoData(url),
			// extractAudioAdvanced()
		]);

		return Response.json({
			success: true,
			videoData: {
				id: videoData.id,
				title: videoData.title,
				description: videoData.description,
				thumbnail: videoData.thumbnail,
				duration: videoData.duration,
				views: videoData.view_count,
				channel: videoData.channel,
				uploadDate: videoData.upload_date,
			},
			audioPath: audioPath.replace("public", ""),
		});
	} catch (error) {
		console.error("Error processing YouTube URL:", error);

		if (error instanceof YouTubeError) {
			return Response.json(
				{ error: error.message, code: error.code },
				{ status: 400 }
			);
		}

		return Response.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
