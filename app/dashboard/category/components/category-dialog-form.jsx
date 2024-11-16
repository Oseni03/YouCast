import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ZodForm } from "@/components/zod-form";
import { CategoryFormSchema } from "@/lib/zod";

const CategoryDialog = ({ trigger, title, description, content }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-w-[725px]">
				<DialogHeader>
					<DialogTitle className="text-2xl text-center text-primary">
						{title}
					</DialogTitle>
					<DialogDescription className="text-center">
						{description}
					</DialogDescription>
				</DialogHeader>
				{content}
			</DialogContent>
		</Dialog>
	);
};

const CategoryForm = ({ submitHandler, error, isLoading }) => {
	return (
		<>
			<ZodForm
				schema={CategoryFormSchema}
				defaultValues={{ name: "" }}
				fields={[
					{
						name: "name",
						type: "text",
						label: "Category name",
						placeholder: "Enter category name",
					},
				]}
				submitLabel="Add"
				onSubmit={submitHandler}
				error={error}
				isLoading={isLoading}
			/>
		</>
	);
};

export const CategoryDialogForm = ({ handleSubmit, error }) => {
	const dialogTrigger = (
		<Button>
			<PlusCircle className="size-4 mr-2" />
			<span>Add channel</span>
		</Button>
	);

	return (
		<CategoryDialog
			trigger={dialogTrigger}
			title="Create category"
			description="Add a new category for your subscriptions."
			content={
				<CategoryForm submitHandler={handleSubmit} error={error} />
			}
		/>
	);
};
