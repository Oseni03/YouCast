import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
	try {
		const { userId, title, description } = await req.json();

		const feedback = await prisma.feedback.create({
			data: {
				title,
				description,
			},
		});
		console.log(feedback);

		return NextResponse.json({
			feedback: {
				userId: userId,
				title: feedback.title,
				description: feedback.description,
			},
		});
	} catch (error) {
		return NextResponse.json({ error: error }, { status: 500 });
	}
}
