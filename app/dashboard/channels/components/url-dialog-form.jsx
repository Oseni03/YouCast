import React from "react";
import { UrlDialog } from "../../components/url-dialog";
import { UrlForm } from "../../components/url-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const UrlDialogForm = ({ handleSubmit, error }) => {
	const dialogTrigger = (
		<Button>
			<PlusCircle className="size-4 mr-2" />
			<span>Add channel</span>
		</Button>
	);

	return (
		<UrlDialog
			trigger={dialogTrigger}
			title="Subscribe to channel"
			description="Add a new YouTube channel subscription to your list."
			content={<UrlForm submitHandler={handleSubmit} error={error} />}
		/>
	);
};

export default UrlDialogForm;
