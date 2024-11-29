import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
	try {
		const body = await req.json();
		const { customerId } = body;

		const session = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
		});
		return NextResponse.json({
			success: true,
			url: session.url,
			sessionId: session.id, // Include full session details if needed
		});
	} catch (error) {
		return NextResponse.json({
			success: false,
			error: error,
		});
	}
}
