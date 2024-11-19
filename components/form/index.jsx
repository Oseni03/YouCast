"use client";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "react-toastify";
import Uploader from "./uploader";
import { Spinner } from "../ui/Spinner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// {
//   title: string;
//   description: string;
//   helpText: string;
//   inputAttrs: {
//     name: string;
//     type: string;
//     defaultValue: string;
//     placeholder?: string;
//     maxLength?: number;
//     pattern?: string;
//   };
//   handleSubmit: any;
// }

export default function Form({
	title,
	description,
	helpText,
	inputAttrs,
	handleSubmit,
}) {
	const { id } = useParams();
	const router = useRouter();
	const { update } = useSession();
	return (
		<form
			action={async (data) => {
				handleSubmit(data, id, inputAttrs.name).then(async (res) => {
					if (res.error) {
						toast.error(res.error);
					} else {
						if (id) {
							router.refresh();
						} else {
							await update();
							router.refresh();
						}
						toast.success(
							`Successfully updated ${inputAttrs.name}!`
						);
					}
				});
			}}
			className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
		>
			<div className="relative flex flex-col space-y-4 p-5 sm:p-10">
				<h2 className="font-cal text-xl dark:text-white">{title}</h2>
				<p className="text-sm text-stone-500 dark:text-stone-400">
					{description}
				</p>
				{inputAttrs.name === "image" || inputAttrs.name === "logo" ? (
					<Uploader
						defaultValue={inputAttrs.defaultValue}
						name={inputAttrs.name}
					/>
				) : (
					<Input
						{...inputAttrs}
						required
						className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
					/>
				)}
			</div>
			<div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
				<p className="text-sm text-stone-500 dark:text-stone-400">
					{helpText}
				</p>
				<FormButton />
			</div>
		</form>
	);
}

function FormButton() {
	const { pending } = useFormStatus();
	return (
		<Button
			className={cn(
				"flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
				pending
					? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
					: "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
			)}
			disabled={pending}
		>
			{pending ? <Spinner /> : <p>Save Changes</p>}
		</Button>
	);
}
