"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { Spinner } from "./ui/Spinner";
import Image from "next/image";
import { formatDuration, formatDate } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ErrorMessage from "./error-message";

function VideoUrlForm() {
	const [url, setUrl] = useState("");
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [result, setResult] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		console.log(url);
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit}>
			{error && <ErrorMessage error={error} />}
			<div className="mt-10 flex items-center justify-center">
				<div className="flex w-full max-w-md items-center space-x-2">
					<Input
						type="text"
						placeholder="Enter video URL"
						name="url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
					/>
					<Button type="submit" disabled={isLoading}>
						{isLoading && <Spinner />} Get audio
					</Button>
				</div>
			</div>
			{result && (
				<div className="space-y-4 animate-in fade-in-50 mt-5">
					<div className="aspect-video">
						<Image
							src={result.videoData.thumbnail}
							alt={result.videoData.title}
							className="w-full h-full object-cover rounded-lg"
						/>
					</div>

					<div className="space-y-2">
						<h3 className="text-lg font-semibold">
							{result.videoData.title}
						</h3>
						<p className="text-sm text-gray-600">
							Channel: {result.videoData.channel}
						</p>
						<p className="text-sm text-gray-600">
							Views: {result.videoData.views.toLocaleString()}
						</p>
						<p className="text-sm text-gray-600">
							Duration:{" "}
							{formatDuration(result.videoData.duration)}
						</p>
						<p className="text-sm text-gray-600">
							Upload Date:{" "}
							{formatDate(result.videoData.uploadDate)}
						</p>
						<div className="mt-4">
							<h4 className="text-md font-semibold mb-2">
								Extracted Audio
							</h4>
							<audio
								controls
								className="w-full"
								key={result.audioPath} // Force audio element to reset when source changes
							>
								<source
									src={result.audioPath}
									type="audio/mp3"
								/>
								Your browser does not support the audio element.
							</audio>
						</div>
					</div>
				</div>
			)}
		</form>
	);
}

export default VideoUrlForm;
