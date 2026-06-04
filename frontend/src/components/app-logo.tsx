import Image from "next/image";

interface AppLogoProps {
	width?: number;
	height?: number;
	className?: string;
	alt?: string;
}

export function AppLogo({
	width = 32,
	height = 32,
	className = "",
	alt = "Opticast logo",
}: AppLogoProps) {
	return (
		<Image
			src="/logo.png"
			alt={alt}
			width={width}
			height={height}
			className={className}
			priority
		/>
	);
}
