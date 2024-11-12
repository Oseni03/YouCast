"use client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useSelectedLayoutSegments } from "next/navigation";

export const DashboardBreadcrumb = () => {
	const segments = useSelectedLayoutSegments();

	let breadcrumb;
	if (segments.length < 1) {
		breadcrumb = "YouCast: Get the audio-version of YouTube videos";
	} else {
		if (segments[0] == "library") {
			breadcrumb = "Manage your audio library";
		} else if (segments[0] == "channels") {
			breadcrumb = "Manage your channel subscription";
		} else if (segments[0] == "categories") {
			breadcrumb = "Manage your categories";
		}
	}
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbPage className="line-clamp-1">
						{breadcrumb}
					</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
};
