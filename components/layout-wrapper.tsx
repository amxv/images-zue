"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { ChatHeader } from "./chat-header"
import { ChatHeaderProvider, useChatHeader } from "./chat-header-context"

interface LayoutWrapperProps {
	children: React.ReactNode
}

function LayoutContent({ children }: LayoutWrapperProps) {
	const { data: session } = useSession()
	const pathname = usePathname()
	const { headerState } = useChatHeader()

	// Don't show header on auth pages
	const isAuthPage =
		pathname.startsWith("/login") || pathname.startsWith("/register")

	// Only show header for logged-in users and not on auth pages
	const showHeader = session?.user && !isAuthPage

	if (!showHeader) {
		return <>{children}</>
	}

	return (
		<div className="flex flex-col h-dvh">
			{headerState && session && (
				<ChatHeader
					chatId={headerState.chatId}
					selectedModelId={headerState.selectedModelId}
					selectedImageModelId={headerState.selectedImageModelId}
					selectedAspectRatio={headerState.selectedAspectRatio}
					selectedGuidanceScale={headerState.selectedGuidanceScale}
					selectedVisibilityType={headerState.selectedVisibilityType}
					isReadonly={headerState.isReadonly}
					session={session}
				/>
			)}
			<div className="flex-1 overflow-hidden bg-background">
				{children}
			</div>
		</div>
	)
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
	return (
		<ChatHeaderProvider>
			<LayoutContent>{children}</LayoutContent>
		</ChatHeaderProvider>
	)
}
