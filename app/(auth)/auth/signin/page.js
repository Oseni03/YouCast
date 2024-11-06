"use client";
import { useState } from "react";
import { UserAuthForm } from "../../components/user-auth-form";
import AuthPage from "../../components/auth-page";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
	const router = useRouter();
	const [globalError, setGlobalError] = useState("");

	const onSubmit = async ({ email, password }) => {
		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
				callbackUrl: "/",
			});

			if (result?.error) {
				setGlobalError(result.error);
				return;
			}
			console.log("sign -n succesful", result);

			router.push("/dashboard");
		} catch (error) {
			setGlobalError(error.message);
		}
	};

	const config = {
		title: "Login to your account",
		description: "Enter your credentials below to login to your account",
		form: <UserAuthForm onSubmit={onSubmit} error={globalError} />,
		consent: true,
		link: {
			href: "/auth/signup",
			name: "Sign up",
		},
	};
	return <AuthPage config={config} />;
}
