import { ZodForm } from "@/components/zod-form";
import { UrlFormSchema } from "@/lib/zod";

export function UrlForm({ submitHandler, error }) {
	return (
		<>
			<ZodForm
				schema={UrlFormSchema}
				defaultValues={{ url: "" }}
				fields={[
					{
						name: "url",
						type: "text",
						label: "URL",
						placeholder: "Enter the YouTube url",
					},
				]}
				submitLabel="Add"
				onSubmit={submitHandler}
				error={error}
			/>
		</>
	);
}
