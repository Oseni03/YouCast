"use client";
import { SessionProvider } from "next-auth/react";

function AuthWrapper({ children }) {
	return <SessionProvider>{children}</SessionProvider>;
}

export default AuthWrapper;
