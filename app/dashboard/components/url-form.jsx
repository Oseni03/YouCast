"use client";
import { ZodForm } from "@/components/zod-form";
import { UrlFormSchema } from "@/lib/zod";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export function UrlForm({
	submitHandler,
	error,
	isLoading,
	isLibrary = false,
}) {
	const [categories, setCategories] = useState([]);

	const getCategories = async () => {
		try {
			const response = await fetch(`/api/category?limit=100`, {
				method: "GET",
			});
			if (response.ok) {
				const data = await response.json(); // Parse JSON
				setCategories(data.categories); // Access the categories array
			} else {
				const data = await response.json(); // Parse error message
				toast.error(data.error || "Failed to fetch categories");
				setCategories([]);
			}
		} catch (err) {
			setCategories([]);
			toast.error(err.message || "An error occurred");
		}
	};

	let fields = null;
	let defaultValues = null;

	if (!isLibrary) {
		getCategories();

		defaultValues = { url: "", category: "" };
		fields = [
			{
				name: "url",
				type: "text",
				label: "URL",
				placeholder: "Enter the YouTube URL",
			},
			{
				name: "category",
				type: "select",
				label: "Category",
				placeholder: "Select category",
				options: categories.map((cat) => ({
					value: cat.id,
					label: cat.name,
				})), // Corrected map callback
			},
		];
	} else {
		defaultValues = { url: "", category: "" };
		fields = [
			{
				name: "url",
				type: "text",
				label: "URL",
				placeholder: "Enter the YouTube URL",
			},
		];
	}

	return (
		<>
			<ZodForm
				schema={UrlFormSchema}
				defaultValues={defaultValues}
				fields={fields}
				submitLabel="Add"
				onSubmit={submitHandler}
				error={error}
				isLoading={isLoading}
			/>
		</>
	);
}
