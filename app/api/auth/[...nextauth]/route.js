import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Use a singleton pattern for Prisma
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") global.prisma = prisma;

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

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
					select: {
						id: true,
						email: true,
						password: true,
						first_name: true,
						last_name: true,
						credits: true,
					},
				});

				if (!user || !user.password) {
					throw new Error(
						"No user found with this email or password is invalid."
					);
				}

				const isPasswordValid = await compare(
					credentials.password,
					user.password
				);

				if (!isPasswordValid) {
					throw new Error("Invalid password");
				}

				return {
					id: user.id,
					email: user.email,
					first_name: user.first_name,
					last_name: user.last_name,
					credits: user.credits,
				};
			},
		}),
	],
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error", // Define custom error page
	},
	secret: process.env.NEXTAUTH_SECRET, // Ensure the secret is defined
	session: {
		strategy: "jwt", // Using JSON Web Tokens for sessions
		maxAge: 7 * 24 * 60 * 60, // 7 days
		updateAge: 24 * 60 * 60, // Update session every 24 hours
	},
	callbacks: {
		async jwt({ token, user, account }) {
			// Include additional user fields in the token
			if (user) {
				token.id = user.id;
				token.first_name = user.first_name;
				token.last_name = user.last_name;
				token.credits = user.credits;
			}
			if (account && account.access_token) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }) {
			// Populate session with token data
			if (session.user) {
				session.user.id = token.id;
				session.user.first_name = token.first_name;
				session.user.last_name = token.last_name;
				session.user.credits = token.credits;
				session.accessToken = token.accessToken;
			}
			return session;
		},
	},
	debug: process.env.NODE_ENV === "development", // Enable debug logs in development
	events: {
		async signIn(message) {
			console.log("User signed in", message);
		},
		async signOut(message) {
			console.log("User signed out", message);
		},
		async error(error) {
			console.error("NextAuth error", error);
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
