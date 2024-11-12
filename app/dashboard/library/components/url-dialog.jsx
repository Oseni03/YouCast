import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { UrlForm } from "./url-form";

export function UrlDialog({ children }) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-[725px]">
				<DialogHeader>
					<DialogTitle className="text-2xl text-center text-primary">
						Extract video audio
					</DialogTitle>
					<DialogDescription className="text-center">
						Add a new audio to your list
					</DialogDescription>
				</DialogHeader>
				<UrlForm />
			</DialogContent>
		</Dialog>
	);
}
