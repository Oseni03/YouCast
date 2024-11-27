import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
	const body = await req.json();
	const { userId, userCredits, email, priceId, subscription } = body;

	if (!priceId) {
		throw new Error("Price ID required");
	}

	try {
		const sessionConfig = {
			// ui_mode: "embedded",
			customer_email: email,
			payment_method_types: ["card"],
			line_items: [{ price: priceId, quantity: 1 }],
			metadata: { userId, userCredits, email, subscription, priceId },
			success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
		};

		// Add subscription-specific mode
		if (subscription) {
			sessionConfig.mode = "subscription";
			sessionConfig.allow_promotion_codes = true;
		} else {
			sessionConfig.mode = "payment";
		}

		const session = await stripe.checkout.sessions.create(sessionConfig);
		return NextResponse.json({
			url: session.url,
			sessionId: session.id, // Include full session details if needed
		});
	} catch (error) {
		console.error("Error creating checkout session:", error);
		return NextResponse.json({
			error: "Failed to create checkout session",
		});
	}
}
