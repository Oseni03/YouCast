/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "utfs.io",
				port: "",
				pathname: "/f/**",
			},
			{
				protocol: "https",
				hostname: "seo-heist.s3.amazonaws.com",
				port: "",
				pathname: "/**", // Allows all paths under this domain
			},
		],
	},
};

export default nextConfig;
