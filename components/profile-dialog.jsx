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
import { useState } from "react";
import { toast } from "react-toastify";
import { prisma } from "@/lib/db";

const ProfileForm = () => {
	const { data: session } = useSession();
	const user = session?.user;
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const updateProfile = async ({ first_name, last_name }) => {
		setLoading(true);
		console.log(first_name, last_name);

		try {
			await prisma.user.update({
				where: {
					id: user.id, // Update based on session user ID
				},
				data: { first_name, last_name },
			});
			toast.success("Profile updated.");
			// return { success: true, response };
		} catch (error) {
			console.error(error);
			setError("Error updating profile");
		} finally {
			setLoading(false);
		}
	};
	return (
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
	);
};

export const ProfileDialog = ({ children }) => {
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
				<ProfileForm />
			</DialogContent>
		</Dialog>
	);
};