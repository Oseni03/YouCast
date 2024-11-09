import * as React from "react";
import { UserProfile } from "./user-profile";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FeedbackForm } from "./feedback-form";
import ShimmerButton from "./ui/shimmer-button";

export function NavActions() {
	return (
		<div className="flex items-center gap-2 text-sm">
			<FeedbackDialog>
				<ShimmerButton className="shadow-2xl">
					<span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
						feedback
					</span>
				</ShimmerButton>
			</FeedbackDialog>
			<UserProfile />
		</div>
	);
}

const FeedbackDialog = ({ children }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-[725px]">
				<DialogHeader>
					<DialogTitle className="text-2xl text-center text-primary">
						Send Feedback
					</DialogTitle>
					<DialogDescription className="text-center">
						Let us know what we can improve
					</DialogDescription>
				</DialogHeader>
				<FeedbackForm />
			</DialogContent>
		</Dialog>
	);
};
