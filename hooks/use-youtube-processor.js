import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useYoutubeProcessor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (url) => processYoutubeVideo(url),
		onSuccess: (data) => {
			console.log(data)
			// Optionally cache the result using the video ID as a key
			queryClient.setQueryData(["video", data.videoData.id], data);
		},
	});
}

async function processYoutubeVideo(url) {
	const response = await fetch("/api/videos", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ url }),
	});

	const data = await response.json();
	console.log(data)

	if (!response.ok) {
		switch (data.code) {
			case "VIDEO_UNAVAILABLE":
				throw new Error("This video is unavailable or private");
			case "VIDEO_BLOCKED":
				throw new Error("This video is not available in your region");
			case "SIGN_IN_REQUIRED":
				throw new Error("This video requires age verification");
			default:
				throw new Error(data.error || "Failed to process video");
		}
	}

	return data;
}
