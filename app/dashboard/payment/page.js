"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentStatusContent() {
	const searchParams = useSearchParams();
	const status = searchParams.get("status");
	const tx_ref = searchParams.get("tx_ref");

	// Determine transaction status
	const transactionStatus =
		status === "successful"
			? "SUCCESS"
			: status === "failed"
			? "FAILED"
			: status === "cancelled"
			? "CANCELLED"
			: null;

	// Client-side effect for transaction update
	const updateTransaction = async () => {
		if (!tx_ref || !transactionStatus) return;

		try {
			const response = await fetch("/api/payment/update-status", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tx_ref, transactionStatus }),
			});

			if (!response.ok) {
				console.error(
					"Failed to update transaction:",
					await response.text()
				);
				return;
			}

			const data = await response.json();
			console.log("Transaction updated successfully:", data);
		} catch (error) {
			console.error("Error updating transaction:", error);
		}
	};

	// Trigger update on render
	updateTransaction();

	return (
		<div className="flex flex-col justify-center items-center h-screen">
			<h1 className="text-3xl font-semibold text-center">
				{status === "successful"
					? "Payment successful"
					: "Payment Unsuccessful"}
			</h1>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PaymentStatusContent />
		</Suspense>
	);
}
