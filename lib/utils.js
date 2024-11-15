import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export const formatDuration = (seconds) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatDate = (dateString) => {
	// Convert YYYYMMDD to readable format
	const year = dateString.substring(0, 4);
	const month = dateString.substring(4, 6);
	const day = dateString.substring(6, 8);
	return new Date(`${year}-${month}-${day}`).toLocaleDateString();
};

export const formatVideo = (videoData) => {
	const data = {
		id: videoData.id,
		title: videoData.title,
		description: videoData.description,
		thumbnail: videoData.thumbnailUrl,
		duration: parseInt(videoData.duration),
		channelId: videoData.channel.id,
		channelTitle: videoData.channel.title,
		upload_date: videoData.publishedAt
			.toISOString()
			.split("T")[0]
			.replace(/-/g, ""),
		audioUrl: videoData.audioUrl,
	};
	return data;
};
