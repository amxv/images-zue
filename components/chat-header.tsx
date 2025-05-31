"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { ModelSelector } from "@/components/model-selector"
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
	selectedVisibilityType,
	isReadonly,
	session
}: {
	chatId: string
	selectedModelId: string
	selectedVisibilityType: VisibilityType
	isReadonly: boolean
	session: Session
}) {
	const router = useRouter()
	const { open } = useSidebar()

	return (
		<header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
			<SidebarToggle />

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						className="md:px-2 px-2 md:h-fit"
						onClick={() => {
							router.push("/")
							router.refresh()
						}}
					>
						<PlusIcon />
						<span className="md:sr-only">New Chat</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>New Chat</TooltipContent>
			</Tooltip>

			<div className="flex items-center gap-2 ml-auto">
				{!isReadonly && (
					<ModelSelector
						session={session}
						selectedModelId={selectedModelId}
						className="order-1 md:order-2"
					/>
				)}

				{!isReadonly && (
					<VisibilitySelector
						chatId={chatId}
						selectedVisibilityType={selectedVisibilityType}
						className="order-1 md:order-3"
					/>
				)}

				{session?.user && <SidebarUserNav user={session.user} />}
			</div>
		</header>
	)
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
	return prevProps.selectedModelId === nextProps.selectedModelId
})
