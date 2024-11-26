import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getCustomerEmail(customerId) {
	try {
		const customer = await stripe.customers.retrieve(customerId);
		return customer.email;
	} catch (error) {
		console.error("Error fetching customer:", error);
		return null;
	}
}

async function handleSubscriptionEvent(event, type) {
	const subscription = event.data.object;
	const customerEmail = await getCustomerEmail(subscription.customer);

	if (!customerEmail) {
		return NextResponse.json({
			status: 500,
			error: "Customer email could not be fetched",
		});
	}

	try {
		const subscriptionData = {
			subscription_id: subscription.id,
			stripe_user_id: subscription.customer,
			status: subscription.status,
			start_date: new Date(subscription.created * 1000).toISOString(),
			plan_id: subscription.items.data[0]?.price.id,
			user_id: subscription.metadata?.userId || "",
			email: customerEmail,
		};

		if (type === "deleted") {
			data = await prisma.subscriptions.update({
				select: [
					"subscription_id",
					"user_id",
					"email",
					"start_date",
					"end_date",
					"plan_id",
				],
				data: { status: "cancelled", email: customerEmail },
				where: { subscription_id: subscription.id },
			});

			try {
				await prisma.user.update({
					data: { subscription: null },
					where: { email: customerEmail },
				});
			} catch (error) {
				console.error(
					"Error updating user subscription status:",
					error
				);
				return NextResponse.json({
					status: 500,
					error: "Error updating user subscription status",
				});
			}
		} else {
			data = await prisma.subscriptions.upsert({
				select: [
					"subscription_id",
					"user_id",
					"email",
					"start_date",
					"end_date",
					"plan_id",
				],
				create: subscriptionData,
				update: subscriptionData,
				where: { subscription_id: subscription.id },
			});

			// try {
			// 	await prisma.user.update({
			// 		data: { subscription: subscription.id },
			// 		where: { email: customerEmail },
			// 	});
			// } catch (error) {
			// 	console.error(
			// 		"Error updating user subscription status:",
			// 		error
			// 	);
			// 	return NextResponse.json({
			// 		status: 500,
			// 		error: "Error updating user subscription status",
			// 	});
			// }
		}
	} catch (error) {
		console.error(`Error during subscription ${type}:`, error);
		return NextResponse.json({
			status: 500,
			error: `Error during subscription ${type}`,
		});
	}

	return NextResponse.json({
		status: 200,
		message: `Subscription ${type} success`,
		data,
	});
}

async function handleInvoiceEvent(event, status) {
	const invoice = event.data.object;
	const customerEmail = await getCustomerEmail(invoice.customer);

	if (!customerEmail) {
		return NextResponse.json({
			status: 500,
			error: "Customer email could not be fetched",
		});
	}

	try {
		const invoiceData = {
			invoice_id: invoice.id,
			subscription_id: invoice.subscription,
			amount_paid:
				status === "succeeded" ? invoice.amount_paid / 100 : undefined,
			amount_due:
				status === "failed" ? invoice.amount_due / 100 : undefined,
			currency: invoice.currency,
			status,
			user_id: invoice.metadata?.userId,
			email: customerEmail,
		};

		const data = prisma.invoices.upsert({
			create: invoiceData,
			update: invoiceData,
			where: { invoice_id: invoice.id },
		});

		// CHECK TO SEE IF USER CREDITS GETS UPDATED AFTER A SUBSCRIPTION CYCLE

		return NextResponse.json({
			status: 200,
			message: `Invoice payment ${status}`,
			data,
		});
	} catch (error) {
		console.error(`Error inserting invoice (payment ${status}):`, error);
		return NextResponse.json({
			status: 500,
			error: `Error inserting invoice (payment ${status})`,
		});
	}
}

async function handleCheckoutSessionCompleted(event) {
	const session = event.data.object;
	const metadata = session?.metadata;

	if (metadata?.subscription === "true") {
		const subscriptionId = session.subscription;
		try {
			await stripe.subscriptions.update(subscriptionId, { metadata });

			await prisma.invoices.update({
				data: { user_id: metadata?.userId },
				where: { email: metadata?.email },
			});

			await prisma.user.update({
				data: { subscription: session.id },
				where: { id: metadata?.userId },
			});

			return NextResponse.json({
				status: 200,
				message: "Subscription metadata updated successfully",
			});
		} catch (error) {
			console.error("Error updating subscription metadata:", error);
			return NextResponse.json({
				status: 500,
				error: "Error updating subscription metadata",
			});
		}
	} else {
		const dateTime = new Date(session.created * 1000).toISOString();
		try {
			const user = await prisma.user.findUnique({
				include: [id, email, credits, subscription],
				where: { id: metadata?.userId },
			});

			const paymentData = {
				user_id: metadata?.userId,
				stripe_id: session.id,
				email: metadata?.email,
				amount: session.amount_total / 100,
				customer_details: JSON.stringify(session.customer_details),
				payment_intent: session.payment_intent,
				payment_time: dateTime,
				currency: session.currency,
			};

			await prisma.payments.create({ data: paymentData });

			const updatedCredits =
				Number(user?.credits || 0) + session.amount_total / 100;

			const updatedUser = prisma.user.update({
				data: { credits: updatedCredits },
				where: { id: metadata?.userId },
			});

			return NextResponse.json({
				status: 200,
				message: "Payment and credits updated successfully",
				updatedUser,
			});
		} catch (error) {
			console.error("Error handling checkout session:", error);
			return NextResponse.json({
				status: 500,
				error,
			});
		}
	}
}

export async function POST(req) {
	const reqText = await req.text();
	const sig = request.headers.get("Stripe-Signature");

	try {
		const event = await stripe.webhooks.constructEventAsync(
			reqText,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET
		);

		switch (event.type) {
			case "customer.subscription.created":
				return handleSubscriptionEvent(event, "created");
			case "customer.subscription.updated":
				return handleSubscriptionEvent(event, "updated");
			case "customer.subscription.deleted":
				return handleSubscriptionEvent(event, "deleted");
			case "invoice.payment_succeeded":
				return handleInvoiceEvent(event, "succeeded");
			case "invoice.payment_failed":
				return handleInvoiceEvent(event, "failed");
			case "checkout.session.completed":
				return handleCheckoutSessionCompleted(event);
			default:
				return NextResponse.json({
					status: 400,
					error: "Unhandled event type",
				});
		}
	} catch (err) {
		console.error("Error constructing Stripe event:", err);
		return NextResponse.json({
			status: 500,
			error: "Webhook Error: Invalid Signature",
		});
	}
}
