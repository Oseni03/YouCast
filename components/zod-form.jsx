"use client";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
	SelectTrigger,
	SelectContent,
	SelectOption,
} from "@/components/ui/select"; // Adjust based on your Select component structure
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/Spinner";
import ErrorMessage from "@/components/error-message";

// Reusable form component
export function ZodForm({
	schema, // Zod schema for validation
	defaultValues, // Default values for the form
	fields, // Array of field configurations
	submitLabel = "Submit", // Button label text
	onSubmit, // Function to handle form submission
	error, // Error message to display
}) {
	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues,
	});

	return (
		<>
			{error && <ErrorMessage error={error} />}
			<Form {...form}>
				<form
					method="post"
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid space-y-3"
				>
					{fields.map(
						({
							name,
							type,
							label,
							placeholder,
							options,
							autoComplete = "off",
						}) => (
							<FormField
								key={name}
								control={form.control}
								name={name}
								render={({ field }) => (
									<FormItem>
										<FormLabel>{label}</FormLabel>
										<FormControl>
											<FormInput
												type={type}
												placeholder={placeholder}
												options={options}
												autoComplete={autoComplete}
												field={field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)
					)}

					<Button
						type="submit"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting && <Spinner />}
						{submitLabel}
					</Button>
				</form>
			</Form>
		</>
	);
}

const FormInput = ({ type, placeholder, options, autoComplete, field }) => {
	if (type === "text") {
		return (
			<Input
				type="text"
				placeholder={placeholder}
				autoComplete={autoComplete}
				{...field}
			/>
		);
	} else if (type === "email") {
		return (
			<Input
				type="email"
				placeholder={placeholder}
				autoComplete={autoComplete}
				{...field}
			/>
		);
	} else if (type === "password") {
		return (
			<Input
				type="password"
				placeholder={placeholder}
				autoComplete={autoComplete}
				{...field}
			/>
		);
	} else if (type === "textarea") {
		return <Textarea placeholder={placeholder} {...field} />;
	} else if (type === "select") {
		return (
			<Select {...field}>
				<SelectTrigger>
					{field.value || "Select an option"}
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectOption key={option.value} value={option.value}>
							{option.label}
						</SelectOption>
					))}
				</SelectContent>
			</Select>
		);
	}
};