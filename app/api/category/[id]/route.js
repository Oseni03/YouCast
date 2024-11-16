import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
	try {
		// Extract category ID from the request body
		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 }
			);
		}

		// Delete the category from the database
		const deletedCategory = await prisma.category.delete({
			where: { id },
		});

		return NextResponse.json({ success: true, deletedCategory });
	} catch (error) {
		if (error.code === "P2025") {
			// Prisma specific error code for record not found
			return NextResponse.json(
				{ error: "Category not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
