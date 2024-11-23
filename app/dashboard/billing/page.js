"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Check, X } from "lucide-react";
import { CancelPlanDialog } from "./components/cancel-plan-dialog";
import { UpgradeDialog } from "./components/upgrade-dialog";

const Page = () => {
	const includedFeatures = [
		"Browse Website with ads",
		"Build static sites",
		"1 spaces",
		"10 MB storage",
		"75 MB data / month",
		"500 requests / month",
		"Subdomain",
		"SSL certificate",
	];

	const notIncludedFeatures = [
		"Access to HTML video",
		"Priority support",
		"Advance static sites",
		"Analytics",
		"SEO",
		"Easy Integration Add ons",
		"Pages for static website hosting",
		"Web-based support",
	];

	return (
		<div className="max-w-4xl mx-auto space-y-4">
			<h1 className="text-2xl font-semibold mb-8">Billing</h1>

			{/* Current Plan Card */}
			<Card className="">
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-3">
						<CardTitle className="font-normal">
							Current plan
						</CardTitle>
						<div className="flex gap-3">
							<CancelPlanDialog />
							<UpgradeDialog />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Current Monthly Bill Card */}
						<Card>
							<CardContent className="p-6">
								<h3 className="text-smmb-2">
									Current monthly bill
								</h3>
								<p className="text-2xl font-semibold mb-4">
									$19.00
								</p>
								<Button
									variant="link"
									className="p-0 h-auto font-normal"
								>
									Switch to yearly billing
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</CardContent>
						</Card>

						{/* Next Payment Due Card */}
						<Card>
							<CardContent className="p-6">
								<h3 className="text-sm mb-2">
									Next payment due
								</h3>
								<p className="text-2xl font-semibold mb-4">
									30 Jan, 2024
								</p>
								<Button variant="link">
									View payment history
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>

			{/* Free Plan Trial Card */}
			<Card className="relative overflow-hidden">
				<CardHeader>
					<CardTitle>
						<h2 className="text-2xl font-semibold mb-2">
							Free Plan - 30 Days Trial
						</h2>
					</CardTitle>
					<CardDescription>
						For new web developers ready to create their first site.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
						{/* Included Features */}
						<div>
							<h3 className="text-sm font-medium mb-4">
								Included:
							</h3>
							<ul className="space-y-3">
								{includedFeatures.map((feature, index) => (
									<li
										key={index}
										className="flex items-center"
									>
										<Check className="h-4 w-4 mr-2" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Not Included Features */}
						<div>
							<h3 className="text-sm font-medium mb-4">
								Not included:
							</h3>
							<ul className="space-y-3">
								{notIncludedFeatures.map((feature, index) => (
									<li
										key={index}
										className="flex items-center"
									>
										<X className="h-4 w-4 text-red-500 mr-2" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="mt-8">
						<Button
							variant="link"
							className="p-0 h-auto font-normal"
						>
							See all features and compare plans
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Page;
