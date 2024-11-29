import React from "react";
import { toast } from "react-toastify";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CircleX, Delete } from "lucide-react";

const AudioDeleteDialog = ({ audioId, setter }) => {
	const handleDeleteAudio = async (videoId) => {
		try {
			const response = await fetch(`/api/videos/${videoId}`, {
				method: "DELETE",
			});

			const result = await response.json();

			if (response.ok) {
				// Update the channels state by filtering out the deleted channel
				setter((prevAudios) =>
					prevAudios.filter((aud) => aud.id !== videoId)
				);
				toast.success("Audio deleted successfully!");
			} else {
				toast.error("Failed to delete audio: " + result.error);
			}
		} catch (error) {
			toast.error(error);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="icon" className="text-red-500">
					<CircleX />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently
						delete the audio from your library.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className="bg-red-500"
						onClick={() => handleDeleteAudio(audioId)}
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default AudioDeleteDialog;
