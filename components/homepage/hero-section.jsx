"use client";
import React from "react";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";
import AppImage from "@/public/app-screen-1.png";
import Link from "next/link";
import { Button } from "../ui/button";
import { BorderBeam } from "../magicui/border-beam";
import { ArrowRightIcon } from "lucide-react";
import AnimatedShinyText from "../ui/animated-shiny-text";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const HeroSection = () => {
	const isDesktop = useMediaQuery({ minWidth: 1024 });

	return (
		<section className="">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col lg:flex-row justify-center lg:justify-start items-center">
					<div className="lg:w-5/12 text-center lg:text-left">
						<div className="my-10">
							<div className="z-10 flex items-center justify-center lg:justify-start my-3">
								<div
									className={cn(
										"group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
									)}
								>
									<AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
										<span>
											✨ Introducing {siteConfig.name}
										</span>
										<ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
									</AnimatedShinyText>
								</div>
							</div>
							<h1 className="text-4xl sm:text-5xl font-bold mb-4">
								{siteConfig.heroIntro}
							</h1>
							<p className="text-lg mb-8">
								{siteConfig.description}
							</p>
						</div>
						<div className="grid sm:flex sm:flex-row sm:justify-center sm:items-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
							<Button>
								<Link href={"/auth/signup"}>Try for Free</Link>
							</Button>
							<Button variant="outline">Star on GitHub</Button>
						</div>
						<div className="flex flex-wrap gap-4 mt-10">
							<div className="flex items-center">
								<div className="border p-2 rounded-full bg-white text-primary inline-flex items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										className="bi bi-credit-card"
										viewBox="0 0 16 16"
									>
										<path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z" />
										<path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z" />
									</svg>
								</div>
								<span className="ml-2 text-sm">
									No credit card required
								</span>
							</div>
							<div className="flex items-center">
								<div className="border p-2 rounded-full bg-white text-primary inline-flex items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										className="bi bi-cash-stack"
										viewBox="0 0 16 16"
									>
										<path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
										<path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z" />
									</svg>
								</div>
								<span className="ml-2 text-sm">
									Free credits
								</span>
							</div>
						</div>
					</div>
					<div className="lg:w-7/12 mt-10 lg:mt-0 lg:pl-12">
						<div className="relative">
							<div
								className="bg-light-subtle p-4 md:p-6 rounded-lg border scene"
								data-relative-input="true"
							>
								<div data-depth="0.09">
									<figure>
										<Image
											src={AppImage}
											alt="landing"
											className="w-full rounded-lg shadow border"
											width={800}
											height={450}
										/>
									</figure>
								</div>
							</div>
							<BorderBeam size={300} duration={12} delay={9} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
