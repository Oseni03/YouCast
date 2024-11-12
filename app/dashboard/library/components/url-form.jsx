"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { ZodForm } from "@/components/zod-form";
import { UrlFormSchema } from "@/lib/zod";
import { useSession } from "next-auth/react";
import { useYoutubeProcessor } from "@/hooks/use-youtube-processor";

export function UrlForm() {
	const {
		mutate: processVideo,
		data: result,
		error,
		isLoading,
		reset,
	} = useYoutubeProcessor();

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

	return (
		<>
			<ZodForm
				schema={UrlFormSchema}
				defaultValues={{ url: "" }}
				fields={[
					{
						name: "url",
						type: "text",
						label: "Video url",
						placeholder: "Enter the video url",
					},
				]}
				submitLabel="Extract"
				onSubmit={handleSubmit}
				error={error}
			/>
		</>
	);
}
