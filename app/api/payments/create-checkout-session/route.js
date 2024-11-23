import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
	const body = await req.json();
	const { userId, email, priceId, subscription } = body;

	try {
		const sessionConfig = {
			payment_method_types: ["card"],
			line_items: [{ price: priceId, quantity: 1 }],
			metadata: { userId, email, subscription },
			success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.FRONTEND_URL}/cancel`,
		};

		// Add subscription-specific mode
		if (subscription) {
			sessionConfig.mode = "subscription";
			sessionConfig.allow_promotion_codes = true;
		} else {
			sessionConfig.mode = "payment";
		}

		const session = await stripe.checkout.sessions.create(sessionConfig);

		return NextResponse.json({ sessionId: session.id });
	} catch (error) {
		console.error("Error creating checkout session:", error);
		return NextResponse.json({
			error: "Failed to create checkout session",
		});
	}
}
