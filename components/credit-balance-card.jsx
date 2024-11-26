"use client";

import { useSession } from "next-auth/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CreditTopupDialog } from "./credit-topup-dialog";
import { MAXCREDITS } from "@/utils/constants";

function CreditBalanceCard() {
	const { data: session } = useSession();
	const user = session?.user;

	const progress = (user?.credits || 0 / MAXCREDITS) * 100;

	return (
		<div className="mt-auto">
			<Card>
				<CardHeader className="p-2 pt-4 md:p-4">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl">
								Credit Balance
							</CardTitle>
							<CardDescription>
								Available credits for usage
							</CardDescription>
						</div>
						<Wallet className="h-6 w-6 text-primary" />
					</div>
				</CardHeader>
				<CardContent className="p-2 pb-4 md:p-4">
					<div className="space-y-4">
						<div className="flex flex-col space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">
									Available
								</span>
								<span className="font-medium">
									{user?.credits?.toLocaleString() || 0}{" "}
									credits
								</span>
							</div>
							<Progress value={progress} className="h-2" />
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>0</span>
								<span>{MAXCREDITS.toLocaleString()}</span>
							</div>
						</div>

						<div className="flex flex-col space-y-2">
							<CreditTopupDialog />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default CreditBalanceCard;
