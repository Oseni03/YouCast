import { signInSchema } from "@/lib/zod";
import { ZodForm } from "@/components/zod-form";

export function UserAuthForm({ onSubmit, error }) {
	return (
		<>
			<ZodForm
				schema={signInSchema}
				defaultValues={{ email: "", password: "" }}
				fields={[
					{
						name: "email",
						type: "email",
						label: "Email",
						placeholder: "Enter your email address",
					},
					{
						name: "password",
						type: "password",
						label: "Password",
						placeholder: "Enter password",
					},
				]}
				submitLabel="Sign In"
				onSubmit={onSubmit}
				error={error}
			/>
		</>
	);
}
