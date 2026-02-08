import { auth } from "./(auth)/auth"
import { LandingPage } from "@/components/landing-page"

export default async function HomePage() {
	const session = await auth()
	return <LandingPage isAuthenticated={!!session?.user} />
}
