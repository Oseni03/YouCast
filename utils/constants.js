export const TITLE_TAILWIND_CLASS =
	"text-2xl sm:text-2xl md:text-3xl lg:text-4xl";
export const PAGINATION_PAGE_SIZE = 10;

export const SUBSCRIPTION_PLANS = [
	{
		title: "Starter",
		monthlyPrice: 10,
		credits: 100,
		description: "Perfect for small projects and testing",
		features: [
			"100 credits per month",
			"Basic API access",
			"Community support",
			"Credits roll over for 30 days",
		],
		priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY,
		priceIdOneOff: process.env.NEXT_PUBLIC_STRIPE_STARTER_ONE_OFF,
		actionLabel: "Start Free Trial",
	},
	{
		title: "Pro",
		monthlyPrice: 25,
		credits: 500,
		description: "For growing businesses with higher usage",
		features: [
			"500 credits per month",
			"Advanced API features",
			"Priority support",
			"Credits roll over for 60 days",
			"Custom rate limits",
		],
		actionLabel: "Get Pro",
		priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY,
		priceIdOneOff: process.env.NEXT_PUBLIC_STRIPE_PRO_ONE_OFF,
		popular: true,
	},
	{
		title: "Enterprise",
		monthlyPrice: 99,
		credits: 2000,
		description: "For large-scale operations needing maximum resources",
		features: [
			"2000 credits per month",
			"Full API access",
			"Dedicated support",
			"Credits roll over for 90 days",
			"Custom integrations",
			"SLA guarantee",
		],
		actionLabel: "Contact Sales",
		priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY,
		priceIdOneOff: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ONE_OFF,
		exclusive: true,
	},
];

export const MAXCREDITS = 2500;
