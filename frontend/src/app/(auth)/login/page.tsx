import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
	title: "Sign In — Opticast",
	description:
		"Sign in to your Opticast account to access your podcast studio.",
};

export default function LoginPage() {
	return <AuthForm mode="login" />;
}
