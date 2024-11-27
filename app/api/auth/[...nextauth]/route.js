// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		CredentialsProvider({
			name: "Credentials",
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please enter an email and password");
				}

				const selectUserFields = {
					id: true,
					email: true,
					password: true,
					first_name: true,
					last_name: true,
					credits: true,
				};

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
					select: selectUserFields,
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

				return user;
			},
		}),
	],
	pages: {
		signIn: "/auth/signin",
		// error: "/auth/error",
	},
	callbacks: {
		async jwt({ token, user, account, profile }) {
			if (user) {
				// Include additional user fields in the token
				token.id = user.id;
				token.first_name = user.first_name;
				token.last_name = user.last_name;
				token.credits = user.credits;
			}
			if (account) {
				token.accessToken = account.access_token;
				token.id = profile.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				// Add the additional fields to the session user object
				session.user.id = token.id;
				session.user.first_name = token.first_name;
				session.user.last_name = token.last_name;
				session.user.credits = token.credits;
				session.accessToken = token.accessToken;
			}
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
