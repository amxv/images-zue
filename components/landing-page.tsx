"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Space_Grotesk } from "next/font/google"
import {
	Sparkles,
	Image as ImageIcon,
	Wand2,
	History,
	Brain,
	FileImage,
	Eye,
	FolderOpen,
	RatioIcon,
	PenLine,
	Clock,
	Images,
	Bookmark,
	Moon,
	Smartphone,
	Presentation,
	FileText,
	Table2,
	ArrowRight,
	Upload,
	MousePointerClick,
	Clipboard,
	LinkIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ZueLogo } from "@/components/zue-logo"

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-space-grotesk"
})

const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

const staggerContainer = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.1 } }
}

interface LandingPageProps {
	isAuthenticated: boolean
}

// --- Section Components ---

function StickyNav({ isAuthenticated }: { isAuthenticated: boolean }) {
	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 16)
		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled
					? "bg-background/80 backdrop-blur-lg border-b border-border"
					: "bg-transparent"
			}`}
		>
			<div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
				<div className="flex items-center gap-3">
					<ZueLogo size="8" />
					<span className={`text-lg font-semibold ${spaceGrotesk.className}`}>
						ZUE Images
					</span>
				</div>
				<Button asChild size="sm">
					<Link href={isAuthenticated ? "/generate" : "/login"}>
						{isAuthenticated ? "Go to App" : "Sign In"}
					</Link>
				</Button>
			</div>
		</nav>
	)
}

function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
	return (
		<section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />
			<div className="relative max-w-4xl mx-auto px-6 text-center">
				<motion.h1
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight ${spaceGrotesk.className}`}
				>
					Turn words into
					<br />
					professional images.
				</motion.h1>
				<motion.p
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.15 }}
					className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
				>
					Describe what you want to create. ZUE Images selects the right AI
					model, crafts the prompt, and generates production-ready visuals — all
					through a simple conversation.
				</motion.p>
				<motion.div
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.3 }}
					className="mt-10"
				>
					<Button asChild size="lg" className="text-base px-8 h-12">
						<Link href={isAuthenticated ? "/generate" : "/login"}>
							{isAuthenticated ? "Go to App" : "Sign In"}
							<ArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</motion.div>
			</div>
		</section>
	)
}

function ProblemSection() {
	return (
		<section className="py-20 md:py-28">
			<div className="max-w-4xl mx-auto px-6">
				<motion.h2
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className={`text-3xl md:text-4xl font-bold tracking-tight text-center ${spaceGrotesk.className}`}
				>
					Creating visual content should not require a design degree.
				</motion.h2>
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-10 grid md:grid-cols-2 gap-8 text-muted-foreground"
				>
					<p className="text-base leading-relaxed">
						You need images for your next campaign, your client deck, your
						product launch. But the options aren&apos;t great. Hiring a designer
						takes days and costs hundreds per asset. Stock photography looks
						generic.
					</p>
					<p className="text-base leading-relaxed">
						And most AI tools drop you into a maze of sliders, parameters, and
						technical settings you didn&apos;t ask for. You shouldn&apos;t need
						to know what &ldquo;guidance scale&rdquo; or &ldquo;inference
						steps&rdquo; mean just to get a clean product shot.
					</p>
				</motion.div>
			</div>
		</section>
	)
}

function HowItWorksSection() {
	const steps = [
		{
			number: "1",
			title: "Describe your vision",
			description:
				"Type what you need in the chat. \"Design a minimalist logo for a coffee shop called Brew & Bean.\" That's all it takes.",
			icon: PenLine
		},
		{
			number: "2",
			title: "Get your image",
			description:
				"The AI selects the right model, crafts the prompt, and generates your image in a dedicated workspace alongside the conversation.",
			icon: ImageIcon
		},
		{
			number: "3",
			title: "Refine with words",
			description:
				"Want changes? Say so. \"Make the font bolder and change the color to deep brown.\" The system switches to editing mode automatically.",
			icon: Wand2
		},
		{
			number: "4",
			title: "Browse every version",
			description:
				"Every iteration is saved. Navigate back through previous versions, compare changes side by side, and download any version you want.",
			icon: History
		}
	]

	return (
		<section className="py-20 md:py-28 bg-muted/30">
			<div className="max-w-5xl mx-auto px-6">
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="text-center"
				>
					<h2
						className={`text-3xl md:text-4xl font-bold tracking-tight ${spaceGrotesk.className}`}
					>
						Describe it. Generate it. Refine it.
					</h2>
					<p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
						ZUE Images works through conversation. Describe what you need in
						plain language, and an AI assistant handles the technical
						decisions.
					</p>
				</motion.div>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
				>
					{steps.map((step) => (
						<motion.div
							key={step.number}
							variants={fadeUp}
							className="relative rounded-2xl border border-border bg-card p-6"
						>
							<div className="flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">
								{step.number}
							</div>
							<h3 className="font-semibold text-lg mb-2">{step.title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{step.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

function KeyBenefitsSection() {
	const benefits = [
		{
			icon: Brain,
			title: "Intelligent Model Selection",
			description:
				"You don't need to know which AI model is best for logos, typography, or photorealistic portraits. The platform detects your intent and routes to the right model automatically."
		},
		{
			icon: FileImage,
			title: "Production-Ready Output",
			description:
				"Generate images at up to 2K resolution across five aspect ratios. Every image is downloadable as PNG, copyable to clipboard, and viewable at up to 3x zoom."
		},
		{
			icon: Eye,
			title: "Full Creative Transparency",
			description:
				"After every generation, an inspector panel shows exactly what happened: the original prompt, enhanced prompt, model selected, and every parameter involved."
		},
		{
			icon: FolderOpen,
			title: "Organize and Reuse Your Work",
			description:
				"Save your best prompts to a personal library. Organize generated images into collections by project, theme, or client. Browse everything in a searchable gallery."
		}
	]

	return (
		<section className="py-20 md:py-28">
			<div className="max-w-5xl mx-auto px-6">
				<motion.h2
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className={`text-3xl md:text-4xl font-bold tracking-tight text-center ${spaceGrotesk.className}`}
				>
					Built for the work you actually do.
				</motion.h2>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-16 grid sm:grid-cols-2 gap-8"
				>
					{benefits.map((benefit) => (
						<motion.div
							key={benefit.title}
							variants={fadeUp}
							className="rounded-2xl border border-border bg-card p-6"
						>
							<benefit.icon className="size-6 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{benefit.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

const imageModels = [
	{
		name: "GPT Image 1.5 (High)",
		provider: "OpenAI",
		description:
			"Native multimodal image model with exceptional text rendering and instruction following. Generates images up to 4x faster with precise editing."
	},
	{
		name: "Nano Banana Pro",
		provider: "Google",
		description:
			"Gemini 3 Pro-based model with industry-leading text rendering, real-time web grounding, and up to 4K resolution."
	},
	{
		name: "HunyuanImage 3.0 Instruct",
		provider: "Tencent",
		description:
			"World's largest open-source image model at 80B parameters. Excels at complex reasoning with a \"think first, then generate\" approach."
	},
	{
		name: "Seedream 4.5",
		provider: "ByteDance",
		description:
			"Comprehensive improvements in editing consistency, dense text rendering, and material accuracy for glass, metal, and cloth."
	},
	{
		name: "FLUX.2 [max]",
		provider: "Black Forest Labs",
		description:
			"Highest-quality FLUX.2 model, pushing image quality and editing consistency to frontier levels for professional workflows."
	},
	{
		name: "Wan 2.6 Image",
		provider: "Alibaba",
		description:
			"All-round diffusion-based model with enhanced consistency, controllability, and commercial-grade reliability."
	},
	{
		name: "Seedream 4.0",
		provider: "ByteDance",
		description:
			"Unified multimodal architecture with 10x faster inference. Strong at 2K outputs, structured layouts, and infographics."
	},
	{
		name: "Nano Banana",
		provider: "Google",
		description:
			"Gemini 2.5 Flash-based model designed for iterative creative workflows, generating images 2-3x faster than comparable models."
	},
	{
		name: "Reve V1",
		provider: "Reve",
		description:
			"12B parameter model that debuted at #1 on the Artificial Analysis Image Arena with exceptional photorealistic detail."
	},
	{
		name: "FLUX.2 [pro]",
		provider: "Black Forest Labs",
		description:
			"Production-grade model balancing speed and quality for professional workloads, supporting up to 4MP resolution."
	},
	{
		name: "FLUX.2 [flex]",
		provider: "Black Forest Labs",
		description:
			"Open-weights model excelling at complex text rendering and typography with multi-reference editing."
	},
	{
		name: "FLUX.2 [klein] 9B",
		provider: "Black Forest Labs",
		description:
			"Fastest FLUX.2 model delivering sub-second inference with open Apache 2.0 licensing."
	},
	{
		name: "Eigen Image",
		provider: "Eigen AI",
		description:
			"Competitive model delivering clean, precise output with strong structural coherence."
	},
	{
		name: "Qwen Image Edit Max",
		provider: "Alibaba",
		description:
			"Advanced editing model with layer-based editing, precise object manipulation, and geometric reasoning."
	}
]

const providerColors: Record<string, string> = {
	OpenAI: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	Google: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
	Tencent: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
	ByteDance: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
	"Black Forest Labs": "bg-violet-500/10 text-violet-700 dark:text-violet-400",
	Alibaba: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
	Reve: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
	"Eigen AI": "bg-amber-500/10 text-amber-700 dark:text-amber-400"
}

function AIImageModelsSection() {
	return (
		<section className="py-20 md:py-28 bg-muted/30">
			<div className="max-w-5xl mx-auto px-6">
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="text-center"
				>
					<h2
						className={`text-3xl md:text-4xl font-bold tracking-tight ${spaceGrotesk.className}`}
					>
						14 top-ranked AI image models. One interface.
					</h2>
					<p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
						Different images require different tools. ZUE Images gives you
						access to the highest-ranked models from leading AI providers — and
						selects the right one for each job.
					</p>
				</motion.div>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
				>
					{imageModels.map((model) => (
						<motion.div
							key={model.name}
							variants={fadeUp}
							className="rounded-xl border border-border bg-card p-5"
						>
							<div className="flex items-center gap-2 mb-2">
								<span
									className={`text-xs font-medium px-2 py-0.5 rounded-full ${
										providerColors[model.provider] || "bg-muted text-muted-foreground"
									}`}
								>
									{model.provider}
								</span>
							</div>
							<h3 className="font-semibold text-sm mb-1">{model.name}</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{model.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

function ChatAIModelsSection() {
	const chatModels = [
		{
			name: "Claude Sonnet 4",
			provider: "Anthropic",
			description: "Balanced reasoning and creative direction."
		},
		{
			name: "Claude Sonnet 4 (Reasoning)",
			provider: "Anthropic",
			description: "Enhanced step-by-step reasoning for complex creative briefs."
		},
		{
			name: "GPT-4.1",
			provider: "OpenAI",
			description: "OpenAI's flagship model. The platform default for chat."
		},
		{
			name: "o4-mini",
			provider: "OpenAI",
			description: "Fast and efficient for quick interactions and everyday tasks."
		},
		{
			name: "Gemini 2.5 Pro",
			provider: "Google",
			description:
				"Advanced multimodal model with deep context understanding."
		},
		{
			name: "Gemini 2.5 Flash",
			provider: "Google",
			description: "Fast and responsive for quick creative exchanges."
		}
	]

	const chatProviderColors: Record<string, string> = {
		Anthropic: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
		OpenAI: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
		Google: "bg-blue-500/10 text-blue-700 dark:text-blue-400"
	}

	return (
		<section className="py-20 md:py-28">
			<div className="max-w-4xl mx-auto px-6">
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="text-center"
				>
					<h2
						className={`text-3xl md:text-4xl font-bold tracking-tight ${spaceGrotesk.className}`}
					>
						Choose the AI that guides your creative process.
					</h2>
					<p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
						The conversational assistant that interprets your requests is powered
						by your choice of six language models. Switch between them at any
						time.
					</p>
				</motion.div>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
				>
					{chatModels.map((model) => (
						<motion.div
							key={model.name}
							variants={fadeUp}
							className="rounded-xl border border-border bg-card p-5"
						>
							<span
								className={`text-xs font-medium px-2 py-0.5 rounded-full ${
									chatProviderColors[model.provider] || "bg-muted text-muted-foreground"
								}`}
							>
								{model.provider}
							</span>
							<h3 className="font-semibold text-sm mt-3 mb-1">{model.name}</h3>
							<p className="text-xs text-muted-foreground">
								{model.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

function BeyondSingleImagesSection() {
	const artifacts = [
		{
			icon: ImageIcon,
			title: "Images",
			description:
				"The core experience. Generate, edit, version, and download production-ready visuals."
		},
		{
			icon: Presentation,
			title: "Slides",
			description:
				"Provide markdown content, and the platform generates a complete slide deck with professional visuals."
		},
		{
			icon: FileText,
			title: "Text",
			description:
				"Generate written content — emails, articles, essays — with real-time streaming and inline editing."
		},
		{
			icon: Table2,
			title: "Sheets",
			description:
				"Create structured tabular data and spreadsheets from natural language descriptions."
		}
	]

	return (
		<section className="py-20 md:py-28 bg-muted/30">
			<div className="max-w-5xl mx-auto px-6">
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="text-center"
				>
					<h2
						className={`text-3xl md:text-4xl font-bold tracking-tight ${spaceGrotesk.className}`}
					>
						Generate presentations, spreadsheets, and written content too.
					</h2>
				</motion.div>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
				>
					{artifacts.map((artifact) => (
						<motion.div
							key={artifact.title}
							variants={fadeUp}
							className="rounded-2xl border border-border bg-card p-6 text-center"
						>
							<artifact.icon className="size-8 text-muted-foreground mx-auto mb-4" />
							<h3 className="font-semibold text-lg mb-2">{artifact.title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{artifact.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

function ImageInputSection() {
	const methods = [
		{
			icon: Upload,
			title: "Upload",
			description: "Attach files directly through the chat (JPEG, PNG, GIF, WebP, BMP — up to 10MB)."
		},
		{
			icon: MousePointerClick,
			title: "Drag and drop",
			description: "Drag images onto the conversation from your desktop or file manager."
		},
		{
			icon: Clipboard,
			title: "Paste",
			description: "Paste screenshots and images directly from your clipboard."
		},
		{
			icon: LinkIcon,
			title: "Link",
			description: "Reference images via URL in your message for instant editing."
		}
	]

	return (
		<section className="py-20 md:py-28">
			<div className="max-w-5xl mx-auto px-6">
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="text-center"
				>
					<h2
						className={`text-3xl md:text-4xl font-bold tracking-tight ${spaceGrotesk.className}`}
					>
						Every way to get images in.
					</h2>
					<p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
						The platform detects your input and automatically switches to the right editing mode. No manual configuration needed.
					</p>
				</motion.div>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
				>
					{methods.map((method) => (
						<motion.div
							key={method.title}
							variants={fadeUp}
							className="rounded-2xl border border-border bg-card p-6 text-center"
						>
							<method.icon className="size-6 text-muted-foreground mx-auto mb-3" />
							<h3 className="font-semibold text-sm mb-1">{method.title}</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{method.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

function WorkflowFeaturesSection() {
	const features = [
		{
			icon: RatioIcon,
			title: "Five aspect ratios",
			description:
				"Square, widescreen, portrait, landscape, and classic portrait. Every model, every format."
		},
		{
			icon: Sparkles,
			title: "Prompt enhancement",
			description:
				"Short prompts are automatically enriched. Detailed prompts pass through unchanged."
		},
		{
			icon: Clock,
			title: "Version history",
			description:
				"Every edit creates a new version. Browse, compare, and download any iteration."
		},
		{
			icon: Images,
			title: "Gallery",
			description:
				"A searchable grid of every image you've generated, with filters and full details."
		},
		{
			icon: FolderOpen,
			title: "Collections",
			description:
				"Group images by project, client, or theme. Set visibility to public or private."
		},
		{
			icon: Bookmark,
			title: "Saved prompts",
			description:
				"Build a personal prompt library. Categorize, tag, and track usage."
		},
		{
			icon: Moon,
			title: "Dark mode",
			description: "Full dark and light mode support, following your system preference."
		},
		{
			icon: Smartphone,
			title: "Responsive",
			description:
				"Works on desktop, tablet, and mobile with touch-friendly controls."
		}
	]

	return (
		<section className="py-20 md:py-28 bg-muted/30">
			<div className="max-w-5xl mx-auto px-6">
				<motion.h2
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className={`text-3xl md:text-4xl font-bold tracking-tight text-center ${spaceGrotesk.className}`}
				>
					Features that respect how you work.
				</motion.h2>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
				>
					{features.map((feature) => (
						<motion.div
							key={feature.title}
							variants={fadeUp}
							className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5"
						>
							<feature.icon className="size-5 text-muted-foreground" />
							<div>
								<h3 className="font-semibold text-sm">{feature.title}</h3>
								<p className="text-xs text-muted-foreground mt-1 leading-relaxed">
									{feature.description}
								</p>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

function FinalCTASection({ isAuthenticated }: { isAuthenticated: boolean }) {
	return (
		<section className="py-24 md:py-32">
			<div className="max-w-3xl mx-auto px-6 text-center">
				<motion.h2
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className={`text-3xl md:text-4xl font-bold tracking-tight ${spaceGrotesk.className}`}
				>
					Your next image is a conversation away.
				</motion.h2>
				<motion.p
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-4 text-muted-foreground text-lg"
				>
					Describe what you need. The right AI model, the right parameters, the
					right prompt — handled for you.
				</motion.p>
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mt-8"
				>
					<Button asChild size="lg" className="text-base px-8 h-12">
						<Link href={isAuthenticated ? "/generate" : "/login"}>
							{isAuthenticated ? "Go to App" : "Sign In"}
							<ArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</motion.div>
			</div>
		</section>
	)
}

function Footer() {
	return (
		<footer className="border-t border-border py-8">
			<div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<ZueLogo size="8" />
					<span>ZUE Images</span>
				</div>
				<span>&copy; {new Date().getFullYear()} ZUE</span>
			</div>
		</footer>
	)
}

// --- Main Component ---

export function LandingPage({ isAuthenticated }: LandingPageProps) {
	return (
		<div className="min-h-dvh bg-background text-foreground">
			<StickyNav isAuthenticated={isAuthenticated} />
			<main>
				<HeroSection isAuthenticated={isAuthenticated} />
				<ProblemSection />
				<HowItWorksSection />
				<KeyBenefitsSection />
				<AIImageModelsSection />
				<ChatAIModelsSection />
				<BeyondSingleImagesSection />
				<ImageInputSection />
				<WorkflowFeaturesSection />
				<FinalCTASection isAuthenticated={isAuthenticated} />
			</main>
			<Footer />
		</div>
	)
}
