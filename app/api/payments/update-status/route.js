import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req) {
	const body = await req.json();

	const { tx_ref, transactionStatus } = body;

	if (!tx_ref || !transactionStatus) {
		return NextResponse.json({ error: "Missing required fields" });
	}

	try {
		const transaction = await prisma.transaction.update({
			where: { id: tx_ref },
			data: {
				status: transactionStatus,
				updatedAt: new Date(),
			},
			include: {
				user: {
					select: {
						id: true,
						credits: true,
					},
				},
			},
		});

		// Additional logic for successful transactions
		if (transactionStatus === "SUCCESS") {
			const updatedCredits =
				Number(transaction.user?.credits || 0) + transaction.credits;

			await prisma.user.update({
				where: { id: transaction.userId },
				data: { credits: updatedCredits },
			});
		}

		return NextResponse.json({ success: true, transaction });
	} catch (error) {
		console.error("Error updating transaction:", error);
		return NextResponse.json({ error: "Internal server error" });
	}
}
