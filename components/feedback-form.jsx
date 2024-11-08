"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { ZodForm } from "./zod-form";
import { FeedbackSchema } from "@/lib/zod";
import { useSession } from "next-auth/react";

export function FeedbackForm() {
	const [error, setError] = useState("");
	const { data: session } = useSession();

	const onSubmit = async ({ title, description }) => {
		console.log("title", title);
		try {
			const res = await fetch("/api/feedback", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: session.user.id,
					title,
					description,
				}),
			});

			if (res.ok) {
				if (result?.error) {
					setError(result.error);
					return;
				}

				toast.success("Feedback sent successful.");
			} else {
				const data = await res.json();
				setError(data.error);
			}
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<>
			<ZodForm
				schema={FeedbackSchema}
				defaultValues={{ title: "", description: "" }}
				fields={[
					{
						name: "title",
						type: "text",
						label: "Title",
						placeholder: "Enter your feedback title",
					},
					{
						name: "description",
						type: "textarea",
						label: "Description",
						placeholder: "Enter description",
					},
				]}
				submitLabel="Submit"
				onSubmit={onSubmit}
				error={error}
			/>
		</>
	);
}
