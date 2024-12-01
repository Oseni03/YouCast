"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { updateTransactionStatus } from "@/lib/actions";

function Page() {
	const searchParams = useSearchParams();
	const status = searchParams.get("status");
	const tx_ref = searchParams.get("tx_ref");

	// Determine transaction status
	let transactionStatus;
	switch (status) {
		case "successful":
			transactionStatus = "SUCCESS";
			break;
		case "failed":
			transactionStatus = "FAILED";
			break;
		case "cancelled":
			transactionStatus = "CANCELLED";
			break;
	}

	useEffect(() => {
		const updateTransaction = async () => {
			// Update transaction status
			const data = await updateTransactionStatus(
				tx_ref,
				transactionStatus
			);
			console.log("Updated trnx: ", data);
			const transaction = data.data;

			// Additional logic for successful transactions (e.g., credit user)
			if (transactionStatus === "SUCCESS") {
				// Implement user credit allocation logic
				const updatedCredits =
					Number(transaction?.user?.credits || 0) +
					transaction.credits;

				await prisma.user.update({
					where: { id: transaction.userId },
					data: { credits: updatedCredits },
				});

				logger.info("One-off purchase processed", {
					userId: transaction.user.id,
					credits: updatedCredits,
				});
			}
		};

		updateTransaction();
	}, [transactionStatus, tx_ref]);

	console.log("Payment status: ", status);
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

export default Page;
