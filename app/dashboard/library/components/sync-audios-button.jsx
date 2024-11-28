"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-toastify";

function SyncAudiosButton({ setAudios }) {
	const [isLoading, setIsLoading] = useState(false);

	const handleSync = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/sync-videos", {
				method: "POST",
			});
			const data = await response.json();
			console.log("Synced response data: ", data);

			if (!response.ok) {
				throw new Error(data.error || "Failed to sync videos.");
			}
			setAudios((prevAudios) => [...data, ...prevAudios]);
			toast.success("Videos synchronized successfully!");
		} catch (error) {
			console.log(error);
			toast.error(error.message || "An error occurred.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			onClick={handleSync}
			disabled={isLoading}
			className="disabled:opacity-50"
		>
			{isLoading ? "Syncing..." : "Sync Audios"}
		</Button>
	);
}

export default SyncAudiosButton;
