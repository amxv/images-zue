"use client"

import type { UseChatHelpers } from "@ai-sdk/react"
import { motion } from "framer-motion"
import { memo } from "react"
import { Button } from "./ui/button"
import type { VisibilityType } from "./visibility-selector"

interface SuggestedActionsProps {
	chatId: string
	append: UseChatHelpers["append"]
	selectedVisibilityType: VisibilityType
}

function PureSuggestedActions({
	chatId,
	append,
	selectedVisibilityType
}: SuggestedActionsProps) {
	const suggestedActions = [
		{
			title: "Create a professional",
			label: "headshot photo",
			action: "Generate a professional business headshot with clean background and professional lighting"
		},
		{
			title: "Design a company",
			label: "presentation slide",
			action: "Create a clean, modern presentation slide template with professional graphics"
		},
		{
			title: "Generate a business",
			label: "infographic design",
			action: "Design a professional infographic for business data visualization with charts and icons"
		},
		{
			title: "Create a corporate",
			label: "event banner",
			action: "Design a professional corporate event banner with elegant typography and branding elements"
		}
	]

	return (
		<div
			data-testid="suggested-actions"
			className="grid sm:grid-cols-2 gap-2 w-full"
		>
			{suggestedActions.map((suggestedAction, index) => (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.05 * index }}
					key={`suggested-action-${suggestedAction.title}-${index}`}
					className={index > 1 ? "hidden sm:block" : "block"}
				>
					<Button
						variant="ghost"
						onClick={async () => {
							window.history.replaceState(
								{},
								"",
								`/chat/${chatId}`
							)

							append({
								role: "user",
								content: suggestedAction.action
							})
						}}
						className="text-left border rounded-3xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
					>
						<span className="font-medium">
							{suggestedAction.title}
						</span>
						<span className="text-muted-foreground">
							{suggestedAction.label}
						</span>
					</Button>
				</motion.div>
			))}
		</div>
	)
}

export const SuggestedActions = memo(
	PureSuggestedActions,
	(prevProps, nextProps) => {
		if (prevProps.chatId !== nextProps.chatId) return false
		if (
			prevProps.selectedVisibilityType !==
			nextProps.selectedVisibilityType
		)
			return false

		return true
	}
)
