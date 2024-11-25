import { object, string } from "zod";

export const signInSchema = object({
	email: string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Invalid email"),

	password: string({ required_error: "Password is required" })
		.min(1, "Password is required")
		.min(8, "Password must be more than 8 characters")
		.max(32, "Password must be less than 32 characters"),
});

export const FeedbackSchema = object({
	title: string({ required_error: "Title is required" }),
	description: string({ required_error: "Description is required" }),
});

export const UrlFormSchema = object({
	url: string({ required_error: "Video url is required" }),
});

export const CategoryFormSchema = object({
	name: string({ required_error: "category name is required" }),
});

export const ContactFormSchema = object({
	full_name: string({ required_error: "First name is required" }),
	email: string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Invalid email"),
	message: string({ required_error: "Message is required" }),
});

export const PlanFormSchema = object({
	plan_id: string({ required_error: "Plan is required" }),
});

export const profileFormSchema = object({
	first_name: string(),
	last_name: string(),
});
