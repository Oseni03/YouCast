import React from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AudioTable = ({ audios }) => (
	<Table>
		<TableCaption>A list of latest audios.</TableCaption>
		<TableHeader>
			<TableRow>
				<TableHead className="">TITLE</TableHead>
				<TableHead className="text-right">ACTION</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{audios?.map((audio) => (
				<TableRow key={audio.id}>
					<TableCell className="font-medium">{audio.title}</TableCell>
					<TableCell className="text-right">
						<Link href={`/dashboard/library#${audio.id}`}>
							<Button className="bg-primary">View</Button>
						</Link>
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default AudioTable;
