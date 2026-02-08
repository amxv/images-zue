"use client"

import { usePathname } from "next/navigation"
import type { User as NextAuthUser } from "next-auth"
import { AppSidebar } from "@/components/app-sidebar"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface ConditionalSidebarProps {
	children: React.ReactNode
	user: NextAuthUser | undefined
	isCollapsed: boolean
}

export function ConditionalSidebar({
	children,
	user,
	isCollapsed
}: ConditionalSidebarProps) {
	const pathname = usePathname()

	if (pathname === "/") {
		return <>{children}</>
	}

	return (
		<SidebarProvider defaultOpen={!isCollapsed}>
			<AppSidebar user={user} />
			<SidebarInset>
				<LayoutWrapper>{children}</LayoutWrapper>
			</SidebarInset>
		</SidebarProvider>
	)
}
