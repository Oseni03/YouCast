// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare, hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

console.log("NextAuth API endpoint loaded");

const handler = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please enter an email and password");
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
				});

				if (!user) {
					throw new Error("No user found with this email");
				}

				const isPasswordValid = await compare(
					credentials.password,
					user.password
				);

				if (!isPasswordValid) {
					throw new Error("Invalid password");
				}

				user;
			},
		}),
	],
	pages: {
		signIn: "/auth/signin",
		// error: "/auth/error",
	},
	callbacks: {
		async jwt({ token, user }) {
			console.log("JWT token:", token, user);
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			console.log("Session:", session);
			if (session.user) {
				session.user.id = token.id;
			}
			return session;
		},
	},
});

export { handler as GET, handler as POST };
