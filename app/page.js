import { AccordionComponent } from "@/components/homepage/accordion-component";
import HeroSection from "@/components/homepage/hero-section";
import Newsletter from "@/components/homepage/newsletter";
import Pricing from "@/components/homepage/pricing";
import Features from "@/components/homepage/features";
import PageWrapper from "@/components/wrapper/page-wrapper";
import config from "@/config";

export default function Home() {
	return (
		<PageWrapper>
			<div className="flex flex-col justify-center items-center w-full mt-[1rem] p-3">
				<HeroSection />
			</div>
			<div className="flex my-[8rem] w-full justify-center items-center">
				<Features />
			</div>
			{config.auth.enabled && config.payments.enabled && (
				<div>
					<Pricing />
				</div>
			)}
			<div className="flex my-[8rem] w-full justify-center items-center px-4">
				<Newsletter />
			</div>
			{/* <div className="flex justify-center items-center w-full my-[8rem]">
				<AccordionComponent />
			</div> */}
		</PageWrapper>
	);
}
