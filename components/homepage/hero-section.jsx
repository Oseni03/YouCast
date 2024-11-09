import { cn } from "@/lib/utils";
import Link from "next/link";
import TypingAnimation from "../ui/typing-animation";
import AnimatedGridPattern from "../ui/animated-grid-pattern";

export default function HeroSection() {
	return (
		<div className="relative isolate px-6 pt-14 lg:px-8">
			<div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
				<div className="hidden sm:mb-8 sm:flex sm:justify-center">
					<div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
						Announcing our next round of funding.{" "}
						<a href="#" className="font-semibold text-indigo-600">
							<span
								aria-hidden="true"
								className="absolute inset-0"
							/>
							Read more <span aria-hidden="true">&rarr;</span>
						</a>
					</div>
				</div>
				<div className="text-center">
					{/* <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
						Data to enrich your online business
					</h1> */}
					<TypingAnimation
						className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl dark:text-white"
						text="Nextjs Starter Kit: Build & Ship Fast"
					/>
					<p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
						Anim aute id magna aliqua ad ad non deserunt sunt. Qui
						irure qui lorem cupidatat commodo. Elit sunt amet fugiat
						veniam occaecat.
					</p>
					<div className="mt-10 flex items-center justify-center gap-x-6">
						<Link
							href="#"
							className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							Get started
						</Link>
						<Link
							href="#"
							className="text-sm/6 font-semibold text-gray-900"
						>
							Learn more <span aria-hidden="true">→</span>
						</Link>
					</div>
					<AnimatedGridPattern
						numSquares={30}
						maxOpacity={0.1}
						duration={3}
						repeatDelay={1}
						className={cn(
							"[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
							"inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
						)}
					/>
				</div>
			</div>
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
			>
				<div
					style={{
						clipPath:
							"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
					}}
					className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
				/>
			</div>
		</div>
	);
}