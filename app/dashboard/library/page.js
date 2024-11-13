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
import { useState } from "react";
import { UrlForm } from "../components/url-form";
import { toast } from "react-toastify";
import { useYoutubeProcessor } from "@/hooks/use-youtube-processor";

const audioLibrary = [
	{
		id: "1",
		title: "Relaxing Nature Sounds",
		description:
			"A soothing blend of nature sounds including birds, rivers, and gentle wind to help you relax and unwind.",
		channelName: "Nature Bliss",
		image: "https://example.com/images/nature-sounds.jpg",
		audio: "https://example.com/audio/nature-sounds.mp3",
	},
	{
		id: "2",
		title: "Guided Meditation for Beginners",
		description:
			"A peaceful, guided meditation session for beginners to help clear the mind and reduce stress.",
		channelName: "Mindful Moments",
		image: "https://example.com/images/guided-meditation.jpg",
		audio: "https://example.com/audio/guided-meditation.mp3",
	},
	{
		id: "3",
		title: "Jazz Vibes",
		description:
			"A collection of smooth jazz tunes to create a calm and relaxing atmosphere.",
		channelName: "Jazz Lounge",
		image: "https://example.com/images/jazz-vibes.jpg",
		audio: "https://example.com/audio/jazz-vibes.mp3",
	},
	{
		id: "4",
		title: "Sleep Sounds: Ocean Waves",
		description:
			"Relax with the sound of ocean waves, perfect for sleeping or background ambience.",
		channelName: "Sleep Therapy",
		image: "https://example.com/images/ocean-waves.jpg",
		audio: "https://example.com/audio/ocean-waves.mp3",
	},
	{
		id: "5",
		title: "Daily News Update",
		description:
			"Stay informed with the latest headlines and news highlights from around the world.",
		channelName: "News Central",
		image: "https://example.com/images/daily-news.jpg",
		audio: "https://example.com/audio/daily-news.mp3",
	},
	{
		id: "6",
		title: "The History of Technology",
		description:
			"An exploration of the most important technological advancements through the ages.",
		channelName: "Tech Talks",
		image: "https://example.com/images/tech-history.jpg",
		audio: "https://example.com/audio/tech-history.mp3",
	},
	{
		id: "7",
		title: "Morning Motivation",
		description:
			"Get inspired with motivational speeches and advice to start your day positively.",
		channelName: "Motivation Hub",
		image: "https://example.com/images/morning-motivation.jpg",
		audio: "https://example.com/audio/morning-motivation.mp3",
	},
	{
		id: "8",
		title: "Deep House Mix",
		description:
			"A curated mix of deep house tracks to keep you in a relaxed yet energized mood.",
		channelName: "House Beats",
		image: "https://example.com/images/deep-house.jpg",
		audio: "https://example.com/audio/deep-house.mp3",
	},
	{
		id: "9",
		title: "Science Explained: Black Holes",
		description:
			"An in-depth explanation of black holes and their mysteries, simplified for everyone.",
		channelName: "Science Hub",
		image: "https://example.com/images/black-holes.jpg",
		audio: "https://example.com/audio/black-holes.mp3",
	},
	{
		id: "10",
		title: "Focus Music",
		description:
			"Ambient music to help you focus on work, study, or any task that requires concentration.",
		channelName: "Focus Zone",
		image: "https://example.com/images/focus-music.jpg",
		audio: "https://example.com/audio/focus-music.mp3",
	},
];

function Page() {
	const [audios, setAudios] = useState(audioLibrary);
	const {
		mutate: processVideo,
		data: result,
		error,
		isLoading,
		reset,
	} = useYoutubeProcessor();

	const handleFiltering = async (e) => {
		const query = e.target.value.toLowerCase();

		try {
			// Query Prisma to filter videos based on title (case-insensitive)
			const filteredVideos = await prisma.video.findMany({
				where: {
					title: {
						contains: query, // Search for titles that contain the query
						mode: "insensitive", // Make it case-insensitive
					},
				},
				take: 10,
			});

			// Log the filtered results or update state to display them
			console.log(filteredVideos); // You can update state here to display filtered videos
			setAudios(filteredVideos);
		} catch (error) {
			console.error("Error fetching filtered videos:", error);
		}
	};

	const handleSubmit = async ({ url }) => {
		reset();

		processVideo(url, {
			onSuccess: () => {
				toast.success("Audio processed successfully!");
				console.log(result);
			},
			onError: (error) => {
				toast.error(error.message);
				console.log(error);
			},
		});
	};

	const dialogTrigger = (
		<Button>
			<PlusCircle className="size-4 mr-2" />
			<span>Add audio</span>
		</Button>
	);
	return (
		<div>
			<div className="flex flex-col space-y-2 sm:flex-row sm:items-center justify-between mb-4">
				<Input
					placeholder="Filter library..."
					onChange={handleFiltering}
					className="max-w-sm"
				/>
				<UrlDialog
					trigger={dialogTrigger}
					title={"Add audio"}
					description={"Add a new audio to your library"}
					content={
						<UrlForm submitHandler={handleSubmit} error={error} />
					}
				/>
			</div>
			<div className="grid space-y-3">
				{audios.map((audio) => (
					<Dialog
						key={audio.id}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 24,
						}}
					>
						<DialogTrigger
							style={{
								borderRadius: "4px",
							}}
							className="border border-gray-200/60 bg-white shadow-md"
						>
							<div className="flex items-center space-x-3 p-3">
								<DialogImage
									src="https://m.media-amazon.com/images/I/71skAxiMC2L._AC_UF1000,1000_QL80_.jpg"
									alt={audio.title}
									className="h-8 w-8 object-cover object-top"
									style={{
										borderRadius: "4px",
									}}
								/>
								<div className="flex flex-col w-full">
									<div className="flex items-center w-full">
										<DialogTitle className="text-[10px] font-medium text-black sm:text-xs">
											{audio.title}
										</DialogTitle>
										<DropdownMenu className="ml-auto">
											<DropdownMenuTrigger className="p-2 hover:bg-black/5 rounded-full transition-colors">
												<MoreVertical className="w-5 h-5 text-gray-600" />
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-48"
											>
												<DropdownMenuItem className="cursor-pointer">
													Add to Playlist
												</DropdownMenuItem>
												<DropdownMenuItem className="cursor-pointer">
													Share Track
												</DropdownMenuItem>
												<DropdownMenuItem className="cursor-pointer">
													View Artist
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="cursor-pointer">
													View Album
												</DropdownMenuItem>
												<DropdownMenuItem className="cursor-pointer">
													Download
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									<DialogSubtitle className="text-[10px] text-gray-600 sm:text-xs">
										{audio.channelName}
									</DialogSubtitle>
								</div>
							</div>
							<div className="px-3 mb-3">
								<audio controls className="mt-2 w-full">
									<source
										src="your-audio-file.mp3"
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
												src="https://m.media-amazon.com/images/I/71skAxiMC2L._AC_UF1000,1000_QL80_.jpg"
												alt="What I Talk About When I Talk About Running - book cover"
												className="h-auto w-[200px]"
											/>
										</div>
										<div className="">
											<div className="flex">
												<DialogTitle className="text-black">
													{audio.title}
												</DialogTitle>
												<DropdownMenu className="ml-auto">
													<DropdownMenuTrigger className="p-2 hover:bg-black/5 rounded-full transition-colors">
														<MoreVertical className="w-5 h-5 text-gray-600" />
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="w-48"
													>
														<DropdownMenuItem className="cursor-pointer">
															Add to Playlist
														</DropdownMenuItem>
														<DropdownMenuItem className="cursor-pointer">
															Share Track
														</DropdownMenuItem>
														<DropdownMenuItem className="cursor-pointer">
															View Artist
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem className="cursor-pointer">
															View Album
														</DropdownMenuItem>
														<DropdownMenuItem className="cursor-pointer">
															Download
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<DialogSubtitle className="font-light text-gray-400">
												{audio.channelName}
											</DialogSubtitle>
											<div className="mt-4 text-sm text-gray-700">
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
