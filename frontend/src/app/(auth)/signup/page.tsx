import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
	title: "Create Account — Opticast",
	description:
		"Join Opticast and start converting your YouTube videos into podcasts.",
};

export default function SignupPage() {
	return <AuthForm mode="signup" />;
}
