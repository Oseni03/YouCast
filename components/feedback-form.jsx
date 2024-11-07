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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/zod";
import { Spinner } from "@/components/ui/Spinner";
import ErrorMessage from "@/components/error-message";

export function FeedbackForm({ onSubmit, error }) {
	const form = useForm({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: "", password: "" },
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
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input type="text" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									{/* <Textarea
										placeholder="tell us what you think"
										className="min-h-[100px]"
										{...field}
                                        /> */}
									<Input
										type="text"
										placeholder="tell us what you think"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting && <Spinner />}
						Submit
					</Button>
				</form>
			</Form>
		</>
	);
}
