"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogImage,
	DialogSubtitle,
	DialogClose,
	DialogContainer,
} from "@/components/motion-ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UrlDialog } from "../components/url-dialog";
import { prisma } from "@/lib/db";
import { useState, useEffect } from "react";
import { UrlForm } from "../components/url-form";
import { toast } from "react-toastify";
import Pagination from "@/components/pagination";
import SyncAudiosButton from "./components/sync-audios-button";
import AudioDeleteDialog from "./components/audio-delete-dialog";

function Page() {
	const [audios, setAudios] = useState([]);
	const [error, setError] = useState("");
	const [isLoading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [query, setQuery] = useState(null);

	useEffect(() => {
		const fetchAudios = async () => {
			try {
				const response = await fetch(
					`/api/videos?page=${page}&query=${query}`,
					{
						method: "GET",
					}
				);

				if (response.ok) {
					const userVideos = await response.json();
					setAudios(userVideos?.videos);
				} else {
					console.log(
						"Error fetching audio files:",
						await response.json()
					);
				}
			} catch (error) {
				console.log("Error fetching audio files:", error);
			}
		};

		fetchAudios();
	}, [page, query]);

	const handleSubmit = async ({ url }) => {
		setLoading(true);

		try {
			const response = await fetch("/api/videos", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url }),
			});

			const data = await response.json();

			if (response.ok) {
				// Update the audios state with the new video data
				setAudios((prevAudios) => [data, ...prevAudios]);
			} else {
				console.log("Error processing YouTube video:", data.error);
				toast.info(data.error);
				setError(data.error);
			}
		} catch (error) {
			console.log("Error submitting YouTube video:", error);
			toast.error(data.error);
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	const dialogTrigger = (
		<Button>
			<PlusCircle className="size-4 mr-2" />
			<span>Add audio</span>
		</Button>
	);
	return (
		<>
			<div className="flex flex-col space-y-2 sm:flex-row sm:items-center justify-between mb-4">
				<Input
					placeholder="Filter library..."
					onChange={(e) => setQuery(e.target.value.toLowerCase())}
					className="max-w-sm"
				/>
				<UrlDialog
					trigger={dialogTrigger}
					title={"Add audio"}
					description={"Add a new audio to your library"}
					content={
						<UrlForm
							submitHandler={handleSubmit}
							error={error}
							isLoading={isLoading}
						/>
					}
				/>
			</div>
			<div className="grid space-y-3">
				<SyncAudiosButton setAudios={setAudios} />
				{audios.map((audio) => (
					<Dialog
						key={audio.id}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 24,
						}}
						id={audio.id}
					>
						<DialogTrigger
							style={{
								borderRadius: "4px",
							}}
							className="border border-gray-200/60 bg-white shadow-md"
						>
							<div className="flex items-center space-x-3 p-3">
								<DialogImage
									src={audio.thumbnail}
									alt={audio.title}
									className="h-8 w-8 object-cover object-top"
									style={{
										borderRadius: "4px",
									}}
								/>
								<div className="flex flex-col">
									<DialogTitle className="text-sm font-medium text-black">
										{audio.title}
									</DialogTitle>
									<DialogSubtitle className="text-sm text-gray-600">
										{audio.channelTitle}
									</DialogSubtitle>
								</div>
							</div>
							<div className="px-3 mb-3">
								<audio controls className="mt-2 w-full">
									<source
										src={audio.audioUrl}
										type="audio/mpeg"
									/>
									Your browser does not support the audio
									element.
								</audio>
							</div>
						</DialogTrigger>
						<DialogContainer>
							<DialogContent
								style={{
									borderRadius: "12px",
								}}
								className="relative h-auto w-[500px] border border-gray-100 bg-white"
							>
								<ScrollArea className="h-[90vh]" type="scroll">
									<div className="relative p-6">
										<div className="flex justify-center py-10">
											<DialogImage
												src={audio.thumbnail}
												alt="What I Talk About When I Talk About Running - book cover"
												className="h-auto w-[200px]"
											/>
										</div>
										<div className="">
											<div className="flex justify-between items-center">
												<DialogTitle className="text-black">
													{audio.title}
												</DialogTitle>
												<AudioDeleteDialog
													audioId={audio.id}
													setter={setAudios}
												/>
											</div>
											<DialogSubtitle className="font-light text-muted-foreground">
												{audio.channelTitle}
											</DialogSubtitle>
											<div className="mt-4 text-sm text-gray-800">
												<p>{audio.description}</p>
											</div>
										</div>
									</div>
								</ScrollArea>
								<DialogClose className="text-zinc-500" />
							</DialogContent>
						</DialogContainer>
					</Dialog>
				))}
				<Pagination
					page={page}
					setPage={setPage}
					isLoading={isLoading}
				/>
			</div>
		</>
	);
}

export default Page;
