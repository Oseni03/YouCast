import localFont from "next/font/local";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/components/theme-provider";
import "react-toastify/dist/ReactToastify.css";
import AuthWrapper from "@/components/wrapper/auth-wrapper";
import Provider from "./provider";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata = {
	// metadataBase: new URL("https://starter.rasmic.xyz"),
	title: {
		default: "Nextjs Starter Kit",
		template: `%s | Nextjs Starter Kit`,
	},
	description:
		"The Ultimate Nextjs 14 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
	openGraph: {
		description:
			"The Ultimate Nextjs 14 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
		images: [
			"https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png",
		],
		url: "https://starter.rasmic.xyz/",
	},
	twitter: {
		card: "summary_large_image",
		title: "Nextjs Starter Kit",
		description:
			"The Ultimate Nextjs 14 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
		siteId: "",
		creator: "@rasmic",
		creatorId: "",
		images: [
			"https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png",
		],
	},
};

export default function RootLayout({ children }) {
	return (
		<AuthWrapper>
			<html lang="en" className="h-screen" suppressHydrationWarning>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<Provider>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<ToastContainer />
							{children}
						</ThemeProvider>
					</Provider>
				</body>
			</html>
		</AuthWrapper>
	);
}
