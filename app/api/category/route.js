import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PAGINATION_PAGE_SIZE } from "@/utils/constants";
import slugify from "slugify";

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { name } = await request.json();
		const slug = slugify(name);

		const category = await prisma.category.create({
			data: {
				name,
				slug,
				user: {
					connect: { id: session.user.id },
				},
			},
		});

		return NextResponse.json(category);
	} catch (error) {
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "Category with this slug already exists" },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to create category" },
			{ status: 500 }
		);
	}
}

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(
			searchParams.get("limit") || PAGINATION_PAGE_SIZE
		);

		const categories = await prisma.category.findMany({
			where: {
				user: {
					id: session.user.id,
				},
			},
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json({
			categories,
			page,
			pageSize: limit,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}
