"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { ModelSelector } from "@/components/model-selector"
import { ImageModelSelector } from "@/components/image-model-selector"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { SidebarUserNav } from "@/components/sidebar-user-nav"
import { Button } from "@/components/ui/button"
import type { Session } from "next-auth"
import { memo } from "react"
import { PlusIcon, VercelIcon } from "./icons"
import { useSidebar } from "./ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { VisibilitySelector, type VisibilityType } from "./visibility-selector"

function PureChatHeader({
	chatId,
	selectedModelId,
	selectedImageModelId,
	selectedAspectRatio,
	selectedGuidanceScale,
	selectedVisibilityType,
	isReadonly,
	session
}: {
	chatId: string
	selectedModelId: string
	selectedImageModelId: string
	selectedAspectRatio: string
	selectedGuidanceScale: string
	selectedVisibilityType: VisibilityType
	isReadonly: boolean
	session: Session
}) {
	const router = useRouter()
	const { open } = useSidebar()

	return (
		<header className="flex sticky top-0 bg-background/95 backdrop-blur-sm pt-4 pb-3 md:pt-5 md:pb-4 items-center px-2 md:px-4 gap-1 md:gap-2 z-50">
			{/* Left section */}
			<div className="flex items-center gap-1 md:gap-2">
				<SidebarToggle />

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							className="px-2 h-8 md:h-fit"
							onClick={() => {
								router.push("/")
								router.refresh()
							}}
						>
							<PlusIcon />
							<span className="sr-only">New Chat</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>New Chat</TooltipContent>
				</Tooltip>
			</div>

			{/* Center section with model selectors - absolutely positioned */}
			<div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
				{!isReadonly && (
					<ModelSelector
						session={session}
						selectedModelId={selectedModelId}
						className="h-8 md:h-[34px]"
					/>
				)}

				{!isReadonly && (
					<ImageModelSelector
						session={session}
						selectedImageModelId={selectedImageModelId}
						selectedAspectRatio={selectedAspectRatio}
						selectedGuidanceScale={selectedGuidanceScale}
						className="h-8 md:h-[34px]"
					/>
				)}
			</div>

			{/* Right section with visibility selector and user nav */}
			<div className="flex items-center gap-1 md:gap-2 ml-auto">
				{!isReadonly && (
					<VisibilitySelector
						chatId={chatId}
						selectedVisibilityType={selectedVisibilityType}
					/>
				)}

				{session?.user && <SidebarUserNav user={session.user} />}
			</div>
		</header>
	)
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
	return (
		prevProps.chatId === nextProps.chatId &&
		prevProps.selectedModelId === nextProps.selectedModelId &&
		prevProps.selectedImageModelId === nextProps.selectedImageModelId &&
		prevProps.selectedAspectRatio === nextProps.selectedAspectRatio &&
		prevProps.selectedGuidanceScale === nextProps.selectedGuidanceScale &&
		prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
		prevProps.isReadonly === nextProps.isReadonly &&
		prevProps.session === nextProps.session
	)
})
