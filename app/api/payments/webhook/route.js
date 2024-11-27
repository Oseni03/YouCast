import { prisma } from "@/lib/db";
import { getPlanByPriceIdOneOff } from "@/lib/utils";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { logger } from "@/lib/logger"; // Assuming you have a logger utility

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2023-10-16", // Use the latest API version
});

async function safeGetCustomerEmail(customerId) {
	try {
		const customer = await stripe.customers.retrieve(customerId);
		return customer.email ?? null;
	} catch (error) {
		logger.error("Failed to retrieve customer email", {
			customerId,
			error: error instanceof Error ? error.message : error,
		});
		return null;
	}
}

async function handleSubscriptionEvent(event, type) {
	const subscription = event.data.object;

	const customerEmail = await safeGetCustomerEmail(subscription.customer);
	if (!customerEmail) {
		logger.error("Cannot process subscription event - no customer email", {
			subscriptionId: subscription.id,
			type,
		});
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

		const updateUserSubscription = async () => {
			await prisma.user.update({
				data: {
					subscription: type === "deleted" ? null : subscription.id,
				},
				where: { email: customerEmail },
			});
		};

		const data = await prisma.subscriptions.upsert({
			create: subscriptionData,
			update: subscriptionData,
			where: { subscription_id: subscription.id },
			select: {
				subscription_id: true,
				user_id: true,
				email: true,
				start_date: true,
				plan_id: true,
			},
		});

		await updateUserSubscription();

		logger.info(`Subscription ${type} processed successfully`, {
			subscriptionId: subscription.id,
			email: customerEmail,
		});

		return NextResponse.json({
			status: 200,
			message: `Subscription ${type} success`,
			data,
		});
	} catch (error) {
		logger.error(`Error processing subscription ${type}`, {
			error: error instanceof Error ? error.message : error,
			subscriptionId: subscription.id,
		});

		return NextResponse.json({
			status: 500,
			error: `Error during subscription ${type}`,
		});
	}
}

async function handleInvoiceEvent(event, status) {
	const invoice = event.data.object;

	const customerEmail = await safeGetCustomerEmail(invoice.customer);
	if (!customerEmail) {
		logger.error("Cannot process invoice event - no customer email", {
			invoiceId: invoice.id,
			status,
		});
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

		const data = await prisma.invoices.upsert({
			create: invoiceData,
			update: invoiceData,
			where: { invoice_id: invoice.id },
			select: {
				invoice_id: true,
				subscription_id: true,
				amount_paid: true,
				status: true,
			},
		});

		logger.info(`Invoice payment ${status} processed`, {
			invoiceId: invoice.id,
			email: customerEmail,
		});

		return NextResponse.json({
			status: 200,
			message: `Invoice payment ${status}`,
			data,
		});
	} catch (error) {
		logger.error(`Error processing invoice payment ${status}`, {
			error: error instanceof Error ? error.message : error,
			invoiceId: invoice.id,
		});

		return NextResponse.json({
			status: 500,
			error: `Error processing invoice payment ${status}`,
		});
	}
}

async function handleCheckoutSessionCompleted(event) {
	const session = event.data.object;
	const metadata = session?.metadata;
	logger.info("Metadata", metadata);

	if (!metadata) {
		logger.error("No metadata found in checkout session", {
			sessionId: session.id,
		});
		return NextResponse.json({
			status: 400,
			error: "Missing metadata",
		});
	}

	try {
		if (metadata.subscription === "true") {
			// Handle subscription checkout
			const subscriptionId = session.subscription;

			await stripe.subscriptions.update(subscriptionId, { metadata });

			await prisma.$transaction([
				prisma.invoices.update({
					where: { email: metadata.email },
					data: { user_id: metadata.userId },
				}),
				prisma.user.update({
					where: { id: metadata.userId },
					data: { subscription: session.id },
				}),
			]);

			logger.info("Subscription metadata updated", {
				subscriptionId,
				userId: metadata.userId,
			});

			return NextResponse.json({
				status: 200,
				message: "Subscription metadata updated successfully",
			});
		} else {
			// Handle one-off purchase
			const dateTime = new Date(session.created * 1000);

			const paymentData = {
				user_id: metadata.userId,
				stripe_id: session.id,
				email: metadata.email,
				amount: session.amount_total / 100,
				customer_details: JSON.stringify(session.customer_details),
				payment_intent: session.payment_intent,
				payment_time: dateTime,
				payment_date: dateTime,
				currency: session.currency,
			};

			const plan = getPlanByPriceIdOneOff(metadata.priceId);
			const updatedCredits =
				Number(metadata.userCredits || 0) + plan.credits;

			await prisma.$transaction([
				prisma.payments.create({ data: paymentData }),
				prisma.user.update({
					where: { id: metadata.userId },
					data: { credits: updatedCredits },
				}),
			]);

			logger.info("One-off purchase processed", {
				userId: metadata?.userId,
				credits: updatedCredits,
			});

			return NextResponse.json({
				status: 200,
				message: "Payment and credits updated successfully",
				credits: updatedCredits,
			});
		}
	} catch (error) {
		logger.error("Error processing checkout session", {
			error: error instanceof Error ? error.message : error,
			metadata,
		});

		return NextResponse.json({
			status: 500,
			error: "Error processing checkout session",
		});
	}
}

export async function POST(req) {
	const reqText = await req.text();
	const sig = req.headers.get("stripe-signature");

	if (!sig) {
		logger.error("Missing Stripe signature");
		return NextResponse.json({
			status: 400,
			error: "Missing signature",
		});
	}

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
				logger.warn("Unhandled event type", { type: event.type });
				return NextResponse.json({
					status: 400,
					error: "Unhandled event type",
				});
		}
	} catch (err) {
		logger.error("Webhook processing error", {
			error: err instanceof Error ? err.message : err,
		});

		return NextResponse.json({
			status: 500,
			error: "Webhook processing error",
		});
	}
}
