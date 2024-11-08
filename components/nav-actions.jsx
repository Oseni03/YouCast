import * as React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserDropdownMenu from "./user-dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FeedbackForm } from "./feedback-form";

export function NavActions() {
	return (
		<div className="flex items-center gap-2 text-sm">
			<FeedbackDialog>
				<Button variant="outline" size="sm" className="rounded-full">
					feedback
				</Button>
			</FeedbackDialog>
			<UserDropdownMenu />
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
