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
import DeleteDialog from "./delete-dialog";

const ChannelTable = ({ channels, setChannels }) => (
	<Table>
		<TableCaption>A list of your subscribed channels.</TableCaption>
		<TableHeader>
			<TableRow>
				<TableHead className="w-[100px]">TITLE</TableHead>
				<TableHead className="text-right">ACTION</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{channels?.map((channel) => (
				<TableRow key={channel.id}>
					<TableCell className="font-medium">
						{channel.title}
					</TableCell>
					<TableCell className="text-right">
						<DeleteDialog
							channelId={channel.id}
							setter={setChannels}
						/>
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default ChannelTable;
