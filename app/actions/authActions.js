"use server";

import { signIn, signOut } from "next-auth/react";
import { AuthError } from "next-auth";

export async function handleCredentialSignin({ email, password }) {
	try {
		await signIn("credentials", {
			email,
			password,
		});
	} catch (error) {
		// if (error instanceof AuthError) {
		// 	switch (error.type) {
		// 		case "CredentialsSignin":
		// 			return { message: "Invalid credentials" };
		// 		default:
		// 			return { message: "Something went wrong." };
		// 	}
		// }
		throw error;
	}
}

export async function handleSignOut() {
	await signOut({ redirect: "/" });
}
