import { Cloud, FileAudio } from "lucide-react";
import { FaBusinessTime } from "react-icons/fa";
import { cn } from "@/lib/utils";
import MediaImage from "@/public/illustartions/media.png";
import ChannelImage from "@/public/illustartions/channels.png";
import CloudImage from "@/public/illustartions/cloud.png";
import Image from "next/image";

const features = [
	{
		name: "Instant Audio Extraction from YouTube Videos.",
		description:
			"Easily convert any YouTube video into audio with a simple URL input. Enjoy high-quality audio files optimized for your needs, whether it's for offline listening or content creation.",
		icon: FileAudio,
		image: MediaImage,
	},
	{
		name: "Automatic Channel Monitoring.",
		description:
			"Subscribe to your favorite YouTube channels and get notified whenever new videos are uploaded. Instantly access audio versions without manually converting each video.",
		icon: FaBusinessTime,
		className: "lg:flex-row-reverse",
		image: ChannelImage,
	},
	{
		name: "Seamless Cloud Integration.",
		description:
			"Your extracted audio files are securely uploaded to the cloud, giving you fast access and reliable storage. Share or download audio files effortlessly from anywhere.",
		icon: Cloud,
		image: CloudImage,
	},
];

export default function Features() {
	return (
		<div className="overflow-hidden ">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{features.map((feature, index) => (
					<div
						key={index}
						className={cn(
							"mx-auto flex max-w-2xl flex-col gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:flex-row items-center",
							feature.className
						)}
					>
						<div className="lg:pr-8 lg:pt-4">
							<div className="lg:max-w-lg">
								<dl className="mt-10 max-w-xl space-y-8 leading-7 text-gray-600 lg:max-w-none">
									<div
										key={feature.name}
										className="relative pl-9"
									>
										<dt className="inline font-semibold dark:text-gray-100 text-gray-900">
											<feature.icon
												className="absolute left-1 top-1 h-5 w-5"
												aria-hidden="true"
											/>
											{feature.name}
										</dt>{" "}
										<dd className="inline dark:text-gray-400">
											{feature.description}
										</dd>
									</div>
								</dl>
							</div>
						</div>
						<Image
							src={feature.image}
							width={400}
							height={400}
							alt={feature.name}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
