"use client";
import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { UrlDialog } from "../components/url-dialog";
import { UrlForm } from "../components/url-form";
import { toast } from "react-toastify";

function Page() {
	const [channels, setChannels] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchSubscribedChannels() {
			try {
				const response = await fetch("/api/channels");
				const data = await response.json();
				setChannels(data.channels);
			} catch (error) {
				console.error(error.message);
			}
		}

		fetchSubscribedChannels();
	}, []);

	const handleFiltering = async (e) => {
		const query = e.target.value.toLowerCase();

		try {
			const filteredChannels = await prisma.channels.findMany({
				where: {
					title: {
						contains: query, // Search for titles that contain the query
						mode: "insensitive", // Make it case-insensitive
					},
				},
				take: 10,
			});

			// Log the filtered results or update state to display them
			console.log(filteredChannels); // You can update state here to display filtered videos
			setChannels(filteredChannels);
		} catch (error) {
			console.error("Error fetching filtered videos:", error);
		}
	};

	const dialogTrigger = (
		<Button>
			<PlusCircle className="size-4 mr-2" />
			<span>Add channel</span>
		</Button>
	);

	const deleteDialogTrigger = (
		<Button variant="outline" size="sm" className="border-red-500">
			Delete
		</Button>
	);

	async function handleSubmit({ url }) {
		try {
			const response = await fetch("/api/channels", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ channelUrl: url }),
			});

			const result = await response.json();

			if (response.ok) {
				// Update channels state with the new channel added
				setChannels((prevChannels) => [...prevChannels, result]);
			} else {
				console.log("Error:", result.error);
				setError(result.error);
			}
		} catch (error) {
			setError("An unexpected error occurred. Please try again.");
		}
	}

	const handleDeleteChannel = async (channelId) => {
		try {
			const response = await fetch(`/api/channel/${channelId}`, {
				method: "DELETE",
			});

			const result = await response.json();

			if (response.ok) {
				// Update the channels state by filtering out the deleted channel
				setChannels((prevChannels) =>
					prevChannels.filter((channel) => channel.id !== channelId)
				);
				toast.success("Channel deleted successfully!");
			} else {
				console.error("Error:", result.error);
				toast.error("Failed to delete channel: " + result.error);
			}
		} catch (error) {
			console.error("An unexpected error occurred:", error);
			toast.error("An unexpected error occurred. Please try again.");
		}
	};
	return (
		<div>
			<div className="flex flex-col space-y-2 sm:flex-row sm:items-center justify-between mb-4">
				<Input
					placeholder="Filter channels..."
					onChange={handleFiltering}
					className="max-w-sm"
				/>
				<UrlDialog
					trigger={dialogTrigger}
					title={"Subscribe to channel"}
					description={
						"Add a new YouTube channel subscription to your list."
					}
					content={
						<UrlForm submitHandler={handleSubmit} error={error} />
					}
				/>
			</div>
			<Table>
				<TableCaption>A list of your subscribed channels.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">TITLE</TableHead>
						<TableHead>CATEGORY</TableHead>
						<TableHead className="text-right">ACTION</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{channels.map((channel) => (
						<TableRow key={channel.id}>
							<TableCell className="font-medium">
								{channel.title}
							</TableCell>
							<TableCell>{channel.category}</TableCell>
							<TableCell className="text-right">
								<DeleteDialog
									trigger={deleteDialogTrigger}
									channelId={channel.id}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="flex my-3">
				<div className="ml-auto space-x-2 ">
					<Button variant="outline" size="sm">
						Previous
					</Button>
					<Button variant="outline" size="sm">
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}

export default Page;

const DeleteDialog = ({ trigger, channelId }) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently
						delete your account and remove your data from our
						servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className="bg-red-500"
						onClick={() => handleDeleteChannel(channelId)}
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
