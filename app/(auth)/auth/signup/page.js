"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { UserAuthForm } from "../../components/user-auth-form";
import AuthPage from "../../components/auth-page";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

// export const metadata = {
// 	title: "Sign up",
// 	description: "Authentication forms built using the components.",
// };

export default function Page() {
	const router = useRouter();
	const { data: session } = useSession();

	if (session?.user) {
		router.push("/dashboard");
	}
	const [globalError, setGlobalError] = useState("");

	const handleSubmit = async ({ email, password }) => {
		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (res.ok) {
				const result = await signIn("credentials", {
					email,
					password,
					redirect: false,
				});

				if (result?.error) {
					setGlobalError(result.error);
					return;
				}

				router.push("/dashboard");
				toast.success("Sign up successful.");
			} else {
				const data = await res.json();
				setGlobalError(data.error);
			}
		} catch (error) {
			setGlobalError(error.message);
		}
	};

	const config = {
		title: "Register a new account",
		description: "Enter your credentials below to register a new account",
		form: <UserAuthForm onSubmit={handleSubmit} error={globalError} />,
		consent: true,
		link: {
			href: "/auth/signin",
			name: "Sign in",
		},
	};
	return <AuthPage config={config} />;
}
