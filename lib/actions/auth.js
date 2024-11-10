// src/actions/authActions.js
import { signOut } from "next-auth/react";
import { toast } from "react-toastify";

export async function handleLogout(router) {
	try {
		await signOut({ redirect: false });
		router.push("/");
	} catch (error) {
		console.log(error);
		toast.error("Error logging out");
	}
}
