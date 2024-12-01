import { getPlanById } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/lib/actions";
import axios from "axios";

export async function POST(req) {
	const body = await req.json();
	const { userId, userCredits, email, priceId } = body;

	// Validate inputs
	if (!userId || !userCredits || !email || !priceId) {
		return NextResponse.json({ error: "Missing required fields" });
	}

	const price = getPlanById(priceId);
	if (!price) {
		return NextResponse.json({ error: "Invalid price ID" });
	}

	if (!process.env.NEXTAUTH_URL || !process.env.FLW_SECRET_KEY) {
		return NextResponse.json({ error: "Missing environment variables" });
	}

	try {
		// Create a pending transaction
		const txn_resp = await createTransaction({
			userId,
			amount: parseFloat(price.amount),
			credits: price.credits,
			currency: price.currency,
		});
		if (!txn_resp.success) {
			return NextResponse.json(txn_resp);
		}

		const transaction = txn_resp.data;

		// Make Flutterwave API call
		const resp = await fetch("https://api.flutterwave.com/v3/payments", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				tx_ref: transaction.id,
				amount: price.amount,
				currency: price.currency,
				redirect_url: `${process.env.NEXTAUTH_URL}/dashboard/payment`,
				customer: { email, name: userId },
				meta: {
					transactionId: transaction.id,
					userId,
					userCredits,
					priceId,
				},
				customizations: {
					title: "Credit payment",
					description: `Credits: ${price.credits}`,
				},
			}),
		});

		// Parsing the JSON response
		if (!resp.ok) {
			throw new Error(`HTTP error! status: ${resp.status}`);
		}

		const response = await resp.json();
		console.log("Session response:", response);

		if (!response.data?.link) {
			throw new Error("Invalid provider response");
		}

		// Update transaction with provider reference
		await prisma.transaction.update({
			where: { id: transaction.id },
			data: {
				providerReference: response.data?.tx_ref,
				providerResponse: response.data,
			},
		});

		return NextResponse.json({
			url: response.data.link,
			transactionId: response.data?.tx_ref,
		});
	} catch (error) {
		console.error("Payment process error:", error.message);
		return NextResponse.json({
			error: error.message || "Failed to create checkout session",
		});
	}
}
