"use client";
import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { SUBSCRIPTION_PLANS } from "@/utils/constants";

const PricingHeader = ({ title, subtitle }) => (
	<section className="text-center">
		<h1 className="text-4xl font-bold mt-2 tracking-tight text-gray-900 dark:text-white">
			{title}
		</h1>
		<p className="text-gray-600 dark:text-gray-400 pt-1">{subtitle}</p>
		<br />
	</section>
);

const CreditDisplay = ({ credits, bonusCredits }) => (
	<div className="flex items-center gap-2 mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
		<Coins className="text-yellow-500" size={20} />
		<span className="text-sm font-medium">
			{credits} Credits
			{bonusCredits > 0 && (
				<span className="text-green-500 ml-1">
					+{bonusCredits} bonus
				</span>
			)}
		</span>
	</div>
);

const PricingCard = ({
	user,
	handleCheckout,
	title,
	priceIdMonthly,
	monthlyPrice,
	description,
	features,
	credits,
	actionLabel,
	popular,
	exclusive,
}) => (
	<Card
		className={cn(
			`w-72 flex flex-col justify-between py-1 ${
				popular ? "border-rose-400" : "border-zinc-700"
			} mx-auto sm:mx-0`,
			{
				"animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] transition-colors":
					exclusive,
			}
		)}
	>
		<div>
			<CardHeader className="pb-4 pt-4">
				<CardTitle className="text-zinc-700 dark:text-zinc-300 text-lg">
					{title}
				</CardTitle>
				<div className="flex gap-0.5">
					<h2 className="text-3xl font-bold">
						{monthlyPrice ? `$${monthlyPrice}` : "Custom"}
					</h2>
					<span className="flex flex-col justify-end text-sm mb-1">
						{monthlyPrice ? "/month" : null}
					</span>
				</div>
				<CreditDisplay credits={credits} bonusCredits={0} />
				<CardDescription className="pt-1.5 h-12">
					{description}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				{features.map((feature) => (
					<div key={feature} className="flex gap-2">
						<CheckCircle2
							size={18}
							className="my-auto text-green-400"
						/>
						<p className="pt-0.5 text-zinc-700 dark:text-zinc-300 text-sm">
							{feature}
						</p>
					</div>
				))}
			</CardContent>
		</div>
		<CardFooter className="mt-2">
			<Button
				onClick={() => {
					if (user?.id) {
						handleCheckout(priceIdMonthly, true);
					} else {
						toast.info("You must be logged in to make a purchase");
					}
				}}
				className="relative inline-flex w-full items-center justify-center rounded-md bg-black text-white dark:bg-white px-6 font-medium dark:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
			>
				{actionLabel}
			</Button>
		</CardFooter>
	</Card>
);

export default function CreditBasedPricing() {
	const { data: session } = useSession();
	const user = session?.user;
	const [stripePromise, setStripePromise] = useState(null);

	useEffect(() => {
		setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY));
	}, []);

	const handleCheckout = async (priceId, subscription) => {
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
						priceId,
						subscription,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to create checkout session");
			}

			const data = await response.json();
			console.log(data);

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
		<div>
			<PricingHeader
				title="Choose Your Credit Plan"
				subtitle="Flexible pricing with credits that scale with your needs"
			/>
			<section className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-8 mt-8">
				{SUBSCRIPTION_PLANS.map((plan) => (
					<PricingCard
						key={plan.title}
						user={user}
						handleCheckout={handleCheckout}
						{...plan}
					/>
				))}
			</section>
		</div>
	);
}
