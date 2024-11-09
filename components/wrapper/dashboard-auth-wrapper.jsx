"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const DashboardAuthWrapper = ({ children }) => {
	const router = useRouter();
	const { data: session } = useSession({
		required: true,
		onUnauthenticated() {
			router.push("/");
		},
	});
	return <>{children}</>;
};
