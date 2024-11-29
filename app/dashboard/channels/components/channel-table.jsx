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
import ChannelDeleteDialog from "./channel-delete-dialog";

const ChannelTable = ({ channels, setChannels }) => (
	<Table>
		<TableCaption>A list of your subscribed channels.</TableCaption>
		<TableHeader>
			<TableRow>
				<TableHead>TITLE</TableHead>
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
						<ChannelDeleteDialog
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
