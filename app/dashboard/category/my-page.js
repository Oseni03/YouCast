"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CategoryTable from "./components/category-table";
import Pagination from "@/components/pagination";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/input"; // Assuming this exists
import { CategoryDialogForm } from "./components/category-dialog-form";

// FilterInput Component
const FilterInput = ({ handleFiltering }) => (
	<Input
		placeholder="Filter category..."
		onChange={handleFiltering}
		className="max-w-sm"
	/>
);

function Page() {
	const [categories, setCategories] = useState([]);
	const [isLoading, setLoading] = useState(false);
	const [page, setPage] = useState(1);

	useEffect(() => {
		async function fetchCategories() {
			setLoading(true);
			try {
				const response = await fetch(`/api/category?page=${page}`);
				const data = await response.json();
				setCategories(data.categories);
			} catch (error) {
				toast.error("Failed to load categories.");
			} finally {
				setLoading(false);
			}
		}
		fetchCategories();
	}, [page]);

	// Handle filtering
	const handleFiltering = async (e) => {
		const query = e.target.value.toLowerCase();
		// Perform API call for filtering (omitted here for brevity)
	};

	// Handle category addition
	const handleSubmit = async ({ name }) => {
		try {
			const response = await fetch("/api/category", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			});
			if (!response.ok) throw new Error("Failed to add category.");
			const newCategory = await response.json();
			setCategories((prev) => [...prev, newCategory]);
			toast.success("Category added successfully!");
		} catch (error) {
			toast.error(error.message || "Failed to add category.");
		}
	};

	return (
		<div>
			<div className="flex flex-col space-y-2 sm:flex-row sm:items-center justify-between mb-4">
				<FilterInput handleFiltering={handleFiltering} />
				<CategoryDialogForm handleSubmit={handleSubmit} />
			</div>
			{isLoading ? (
				<div className="flex justify-center items-center">
					<Spinner />
				</div>
			) : (
				<CategoryTable
					categories={categories}
					setCategories={setCategories}
				/>
			)}
			<Pagination page={page} setPage={setPage} isLoading={isLoading} />
		</div>
	);
}

export default Page;
