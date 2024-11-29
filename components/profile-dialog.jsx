"use client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { ZodForm } from "./zod-form";
import { profileFormSchema } from "@/lib/zod";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateUserProfile } from "@/lib/actions";
import { getUser } from "@/lib/actions";

export const ProfileDialog = ({ children }) => {
	const { data: session } = useSession();
	const userId = session?.user.id;
	const [user, setUser] = useState({});
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function getUserData() {
			const result = await getUser(userId);
			console.log(result);
			if (result.success) {
				setUser(result.user);
			}
		}
		getUserData();
	}, [userId]);

	const updateProfile = async ({ first_name, last_name }) => {
		setLoading(true);
		console.log(first_name, last_name);

		const result = await updateUserProfile(user.id, first_name, last_name);

		if (result.status === "success") {
			toast.success(result.message);
		} else {
			toast.error(result.message);
			setError(result.error);
		}
		setLoading(false);
	};
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Profile settings</DialogTitle>
					<DialogDescription>
						Subscribe to a higher plan for more credit.
					</DialogDescription>
				</DialogHeader>
				<ZodForm
					schema={profileFormSchema}
					defaultValues={{
						first_name: user?.first_name || "",
						last_name: user?.last_name || "",
					}}
					fields={[
						{
							name: "first_name",
							type: "text",
							label: "First Name",
							placeholder: "Enter your first name",
						},
						{
							name: "last_name",
							type: "text",
							label: "Last Name",
							placeholder: "Enter your last name",
						},
					]}
					error={error}
					isLoading={isLoading}
					submitLabel="Update"
					onSubmit={updateProfile}
				/>
			</DialogContent>
		</Dialog>
	);
};
