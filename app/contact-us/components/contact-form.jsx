"use client";
import { ZodForm } from "@/components/zod-form";
import { saveContact } from "@/lib/actions";
import { ContactFormSchema } from "@/lib/zod";

export const ContactForm = () => {
	return (
		<ZodForm
			schema={ContactFormSchema}
			defaultValues={{
				full_name: "",
				email: "",
				message: "",
			}}
			fields={[
				{
					name: "full_name",
					type: "text",
					label: "Full Name",
					placeholder: "Enter your full name",
				},
				{
					name: "email",
					type: "email",
					label: "Email",
					placeholder: "Enter your email address",
				},
				{
					name: "message",
					type: "textarea",
					label: "Message",
					placeholder: "Write to us",
				},
			]}
			submitLabel="Send"
			onSubmit={saveContact}
		/>
	);
};
