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
		breadcrumb = "Components Management & Engagement Tracking";
	} else {
		if (segments[0] == "discover") {
			breadcrumb = "Discover the latest components";
		} else if (segments[0] == "components") {
			breadcrumb = "Manage your UI components all in one place";
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
