"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ChannelTable from "./components/channel-table";
import Pagination from "@/components/pagination";
import UrlDialogForm from "./components/url-dialog-form";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/input"; // Assuming this exists

// FilterInput Component
const FilterInput = ({ handleFiltering }) => (
	<Input
		placeholder="Filter channels..."
		onChange={handleFiltering}
		className="max-w-sm"
	/>
);

function Page() {
	const [channels, setChannels] = useState([]);
	const [isLoading, setLoading] = useState(false);
	const [page, setPage] = useState(1);

	// Fetch subscribed channels
	useEffect(() => {
		async function fetchSubscribedChannels() {
			setLoading(true);
			try {
				const response = await fetch(`/api/channels?page=${page}`);
				const data = await response.json();
				setChannels(data.channels);
			} catch (error) {
				toast.error("Failed to load channels.");
			} finally {
				setLoading(false);
			}
		}
		fetchSubscribedChannels();
	}, [page]);

	// Handle filtering
	const handleFiltering = async (e) => {
		const query = e.target.value.toLowerCase();
		// Perform API call for filtering (omitted here for brevity)
	};

	// Handle channel addition
	const handleSubmit = async ({ url, category }) => {
		try {
			const response = await fetch("/api/channels", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url, category }),
			});
			if (!response.ok) throw new Error("Failed to add channel.");
			const newChannel = await response.json();
			setChannels((prev) => [...prev, newChannel]);
			toast.success("Channel added successfully!");
		} catch (error) {
			toast.error(error.message || "Failed to add channel.");
		}
	};

	return (
		<div>
			<div className="flex flex-col space-y-2 sm:flex-row sm:items-center justify-between mb-4">
				<FilterInput handleFiltering={handleFiltering} />
				<UrlDialogForm handleSubmit={handleSubmit} />
			</div>
			{isLoading ? (
				<div className="flex justify-center items-center">
					<Spinner />
				</div>
			) : (
				<ChannelTable channels={channels} setChannels={setChannels} />
			)}
			<Pagination page={page} setPage={setPage} isLoading={isLoading} />
		</div>
	);
}

export default Page;
