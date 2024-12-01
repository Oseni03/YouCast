import { prisma } from "@/lib/db";
import { getPlanById, getPlanByPriceIdOneOff } from "@/lib/utils";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger"; // Assuming you have a logger utility
import { updateTransactionStatus } from "@/lib/actions";

export async function POST(req) {
	const body = await req.json();
	const signature = req.headers.get("verif-hash");

	// Check for the signature
	const secretHash = process.env.FLW_SECRET_HASH;
	if (!signature || signature !== secretHash) {
		// This response is not from Flutterwave; discard
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { tx_ref, status, id } = body.data;
		console.log("Webhook data: ", body.data);

		// Determine transaction status
		let transactionStatus;
		switch (status) {
			case "successful":
				transactionStatus = "SUCCESS";
				break;
			case "failed":
				transactionStatus = "FAILED";
				break;
			case "cancelled":
				transactionStatus = "CANCELLED";
				break;
		}

		// Update transaction status
		const transaction = await updateTransactionStatus(
			tx_ref,
			transactionStatus,
			body.data
		);
		console.log("Updated trnx: ", transaction);

		// Additional logic for successful transactions (e.g., credit user)
		if (transactionStatus === "SUCCESS") {
			// Implement user credit allocation logic
			const updatedCredits =
				Number(metadata.userCredits || 0) + transaction.credits;

			await prisma.user.update({
				where: { id: metadata.userId },
				data: { credits: updatedCredits },
			});

			logger.info("One-off purchase processed", {
				userId: transaction.user.id,
				credits: updatedCredits,
			});
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook processing error:", error);
		return NextResponse.json(
			{ error: "Processing failed" },
			{ status: 500 }
		);
	}
}
