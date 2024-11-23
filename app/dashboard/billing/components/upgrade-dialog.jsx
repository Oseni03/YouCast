"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ZodForm } from "@/components/zod-form";
import { PlanFormSchema } from "@/lib/zod";
import { SUBSCRIPTION_PLANS } from "@/utils/constants";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";

const PlanForm = ({ onSubmit }) => {
	return (
		<ZodForm
			schema={PlanFormSchema}
			defaultValues={{
				plan_id: "",
			}}
			fields={[
				{
					name: "plan_id",
					type: "radio",
					label: "Choose plan",
					options: SUBSCRIPTION_PLANS.map((plan) => ({
						value: plan.priceIdMonthly,
						label: plan.title,
						key: plan.priceIdMonthly,
					})),
				},
			]}
			submitLabel="Upgrade"
			onSubmit={onSubmit}
		/>
	);
};

export const UpgradeDialog = () => {
	const { data: session } = useSession();
	const user = session?.user;
	const [stripePromise, setStripePromise] = useState(null);

	useEffect(() => {
		setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY));
	}, []);

	const handleCheckout = async ({ plan_id }) => {
		console.log(plan_id);
		try {
			const response = await fetch(
				"/api/payments/create-checkout-session",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: user?.id,
						email: user?.email,
						priceId: plan_id,
						subscription: true,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to create checkout session");
			}

			const data = await response.json();

			if (data.sessionId) {
				const stripe = await stripePromise;
				return stripe?.redirectToCheckout({
					sessionId: data.sessionId,
				});
			}

			toast.error("Failed to create checkout session");
		} catch (error) {
			console.error("Error during checkout:", error);
			toast.error("Error during checkout");
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Upgrade plan</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Upgrade Plan</DialogTitle>
					<DialogDescription>
						Subscribe to a higher plan for more credit.
					</DialogDescription>
				</DialogHeader>
				<PlanForm onSubmit={handleCheckout} />
			</DialogContent>
		</Dialog>
	);
};
