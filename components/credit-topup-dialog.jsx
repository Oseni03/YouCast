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
import { MAXCREDITS, SUBSCRIPTION_PLANS } from "@/utils/constants";
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
						value: plan.priceIdOneOff,
						label: `${plan.title} (${plan.credits})`,
						key: plan.priceIdOneOff,
					})),
				},
			]}
			submitLabel="Upgrade"
			onSubmit={onSubmit}
		/>
	);
};

export const CreditTopupDialog = ({ user }) => {
	const handleCheckout = async ({ plan_id }) => {
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
						userCredits: user?.credits,
						email: user?.email,
						priceId: plan_id,
						subscription: false,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to create checkout session"
				);
			}

			const data = await response.json();
			console.log("Response: ", data);

			if (data.url) {
				// Redirect directly to Stripe checkout URL
				window.location.href = data.url;
				return;
			}
		} catch (error) {
			console.error("Error during checkout:", error);
			toast.error("Error during checkout");
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant={
						user?.credits >= MAXCREDITS ? "secondary" : "default"
					}
					disabled={user?.credits >= MAXCREDITS}
				>
					{user?.credits >= MAXCREDITS
						? "Maximum Credits Reached"
						: "Top Up Credits"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Credit Top Up</DialogTitle>
					<DialogDescription>
						Top up your credit balance.
					</DialogDescription>
				</DialogHeader>
				<PlanForm onSubmit={handleCheckout} />
			</DialogContent>
		</Dialog>
	);
};
