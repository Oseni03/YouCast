"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ChannelTable from "./channels/components/channel-table";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import AudioTable from "./components/audio-table";
import EmptyPlaceholder from "@/components/EmptyPlaceholder";
import Link from "next/link";

function Page() {
	const [channels, setChannels] = useState([]);
	const [audios, setAudios] = useState([]);
	const [isLoading, setLoading] = useState(false);

	// Fetch subscribed channels
	useEffect(() => {
		async function fetchSubscribedChannels() {
			setLoading(true);
			try {
				const response = await fetch(`/api/channels?limit=5`);
				if (response.ok) {
					const data = await response.json();
					setChannels(data.channels);
				}
			} catch (error) {
				toast.error("Failed to load channels.");
			} finally {
				setLoading(false);
			}
		}

		const fetchAudios = async () => {
			try {
				const response = await fetch(`/api/videos?limit=5`, {
					method: "GET",
				});

				if (response.ok) {
					const data = await response.json();
					setAudios(data?.videos);
				}
			} catch (error) {
				toast.error("Failed to load audios");
			}
		};
		Promise.all([fetchSubscribedChannels(), fetchAudios()]);
	}, []);

	return (
		<div className="grid space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Audio Library</CardTitle>
				</CardHeader>
				<CardContent>
					{audios.length > 0 ? (
						<>
							<AudioTable audios={audios} />
							<Button size="sm" className="ml-auto">
								View all
							</Button>
						</>
					) : (
						<EmptyPlaceholder
							title={"No videos"}
							description={"Visit the library tab to add"}
						/>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Channels</CardTitle>
				</CardHeader>
				<CardContent>
					{channels.length > 0 ? (
						<>
							<ChannelTable
								channels={channels}
								setChannels={setChannels}
							/>
							<Button size="sm" className="ml-auto">
								View all
							</Button>
						</>
					) : (
						<EmptyPlaceholder
							title={"No subscribed channel"}
							description={"Visit the channel tab to add"}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default Page;
