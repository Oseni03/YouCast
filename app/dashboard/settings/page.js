import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Form from "@/components/form";
import { editUser, updateImage } from "@/lib/actions";

async function Page() {
	const session = await getServerSession();

	return (
		<div className="flex max-w-screen-xl flex-col space-y-12">
			<div className="flex flex-col space-y-6">
				<h1 className="font-cal text-3xl font-bold dark:text-white">
					Settings
				</h1>
				{/* <Form
					title="Thumbnail image"
					description="The thumbnail image for your post. Accepted formats: .png, .jpg, .jpeg"
					helpText="Max file size 50MB. Recommended size 1200x630."
					inputAttrs={{
						name: "logo",
						type: "file",
						defaultValue: session.user?.image,
					}}
					handleSubmit={updateImage}
				/> */}
				<Form
					title="First name"
					description="Your name on this app."
					helpText="Please use 32 characters maximum."
					inputAttrs={{
						name: "first_name",
						type: "text",
						defaultValue: session.user.first_name,
						placeholder: "Brendon",
						maxLength: 32,
					}}
					handleSubmit={editUser}
				/>
				<Form
					title="Last name"
					description="Your name on this app."
					helpText="Please use 32 characters maximum."
					inputAttrs={{
						name: "last_name",
						type: "text",
						defaultValue: session.user.last_name,
						placeholder: "Urie",
						maxLength: 32,
					}}
					handleSubmit={editUser}
				/>
				<Form
					title="Email"
					description="Your email on this app."
					helpText="Please enter a valid email."
					inputAttrs={{
						name: "email",
						type: "email",
						defaultValue: session.user.email,
						placeholder: "panic@thedis.co",
					}}
					handleSubmit={editUser}
				/>
			</div>
		</div>
	);
}

export default Page;
