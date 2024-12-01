export const TITLE_TAILWIND_CLASS =
	"text-2xl sm:text-2xl md:text-3xl lg:text-4xl";
export const PAGINATION_PAGE_SIZE = 10;

export const SUBSCRIPTION_PLANS = [
	{
		id: "698",
		title: "Starter",
		amount: 10,
		currency: "USD",
		credits: 150,
		description: "Best for occasional video downloads and channel tracking",
		features: [
			"Up to 150 credits per month for video conversions and tracking",
		],
		actionLabel: "Get Starter",
	},
	{
		id: "699",
		title: "Pro",
		amount: 25,
		currency: "USD",
		credits: 500,
		description:
			"Ideal for enthusiasts and small teams managing multiple channels",
		features: [
			"Up to 500 credits per month for video conversions and tracking",
		],
		actionLabel: "Get Pro",
		popular: true,
	},
	{
		id: "670",
		title: "Enterprise",
		amount: 99,
		currency: "USD",
		credits: 2000,
		description:
			"Designed for agencies and power users handling large-scale operations",
		features: [
			"Up to 2000 credits per month for video conversions and tracking",
		],
		actionLabel: "Get Enterprise",
		exclusive: true,
	},
];

export const MAXCREDITS = 2500;
