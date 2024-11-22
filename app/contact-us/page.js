import { ContactForm } from "./components/contact-form";
import AuthPage from "../(auth)/components/auth-page";

const Page = () => {
	const config = {
		title: "Contact us for anything",
		description: "Our goal is to be as helpful as possible.",
		form: <ContactForm />,
	};
	return (
		<>
			<AuthPage config={config} />
		</>
	);
};

export default Page;
