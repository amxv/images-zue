import type { ComponentProps } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from "@/components/ui/tooltip"

import { Button } from "./ui/button"

export function SidebarToggle({
	className
}: ComponentProps<typeof SidebarTrigger>) {
	const { toggleSidebar, open } = useSidebar()

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					data-testid="sidebar-toggle-button"
					onClick={toggleSidebar}
					variant="outline"
					className="md:px-2 md:h-fit"
				>
					{open ? (
						<ChevronLeft size={16} />
					) : (
						<ChevronRight size={16} />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent align="start">Toggle Sidebar</TooltipContent>
		</Tooltip>
	)
}
