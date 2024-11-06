// app/api/auth/signup/route.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
// import { prisma } from "@/prisma";
const prisma = new PrismaClient();

export async function POST(req) {
	try {
		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "User already exists" },
				{ status: 400 }
			);
		}

		const hashedPassword = await hash(password, 12);

		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
			},
		});

		return NextResponse.json({
			user: { id: user.id, email: user.email },
		});
	} catch (error) {
		return NextResponse.json({ error: error }, { status: 500 });
	}
}
