import localFont from "next/font/local";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/components/theme-provider";
import AuthWrapper from "@/components/wrapper/auth-wrapper";
import Provider from "./provider";
import { siteConfig } from "@/config/site";
import "react-toastify/dist/ReactToastify.css";

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
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,

	twitter: {
		card: "summary_large_image",
		title: siteConfig.name,
		description: siteConfig.description,
		creator: "@Oseni03",
		creatorId: "",
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
