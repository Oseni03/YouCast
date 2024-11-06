"use client";
import { useState } from "react";
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

export function UserAuthForm({ onSubmit, error }) {
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
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="Enter your email address"
										autoComplete="off"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Enter password"
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
						Sign In
					</Button>
				</form>
			</Form>
		</>
	);
}
