"use client"

import { startTransition, useMemo, useOptimistic, useState } from "react"

import { saveChatModelAsCookie } from "@/app/(chat)/actions"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { chatModels } from "@/lib/ai/models"
import { cn } from "@/lib/utils"

import { entitlementsByUserType } from "@/lib/ai/entitlements"
import type { Session } from "next-auth"
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons"
import { BrainIcon } from "./brain-icon"

export function ModelSelector({
	session,
	selectedModelId,
	className
}: {
	session: Session
	selectedModelId: string
} & React.ComponentProps<typeof Button>) {
	const [open, setOpen] = useState(false)
	const [optimisticModelId, setOptimisticModelId] =
		useOptimistic(selectedModelId)

	const userType = session.user.type
	const { availableChatModelIds } = entitlementsByUserType[userType]

	const availableChatModels = chatModels.filter((chatModel) =>
		availableChatModelIds.includes(chatModel.id)
	)

	const selectedChatModel = useMemo(
		() =>
			availableChatModels.find(
				(chatModel) => chatModel.id === optimisticModelId
			),
		[optimisticModelId, availableChatModels]
	)

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger
				asChild
				className={cn(
					"w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
					className
				)}
			>
				<Button
					data-testid="model-selector"
					variant="outline"
					className="md:px-2 md:h-[34px] px-2"
				>
					<BrainIcon size={12} />
					<span className="hidden md:inline">
						{selectedChatModel?.name}
					</span>
					<div
						className={cn(
							"transition-transform duration-200",
							open && "rotate-180"
						)}
					>
						<ChevronDownIcon />
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-[350px] p-4">
				<DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-2">
					Chat Models
				</DropdownMenuLabel>
				<div className="flex flex-col gap-2">
					{availableChatModels.map((chatModel) => {
						const { id } = chatModel
						const isSelected = id === optimisticModelId

						return (
							<button
								key={id}
								data-testid={`model-selector-item-${id}`}
								type="button"
								onClick={() => {
									setOpen(false)
									startTransition(() => {
										setOptimisticModelId(id)
										saveChatModelAsCookie(id)
									})
								}}
								className={cn(
									"p-3 rounded-lg border text-left transition-colors group",
									isSelected
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50 hover:bg-accent/50"
								)}
							>
								<div className="flex items-start justify-between">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium text-sm truncate">
												{chatModel.name}
											</span>
											{isSelected && (
												<div className="text-primary flex-shrink-0">
													<CheckCircleFillIcon />
												</div>
											)}
										</div>
										<div className="text-xs text-muted-foreground line-clamp-2">
											{chatModel.description}
										</div>
									</div>
								</div>
							</button>
						)
					})}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
