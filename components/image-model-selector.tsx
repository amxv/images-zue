"use client"

import {
	startTransition,
	useMemo,
	useOptimistic,
	useState,
	useCallback
} from "react"

import {
	saveImageModelAsCookie,
	saveAspectRatioAsCookie,
	saveGuidanceScaleAsCookie
} from "@/app/(chat)/actions"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { imageModels, modelSupportsGuidanceScale } from "@/lib/ai/models"
import { cn } from "@/lib/utils"

import { entitlementsByUserType } from "@/lib/ai/entitlements"
import type { Session } from "next-auth"
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons"
import { ImageIcon, Minus, Plus } from "lucide-react"

const aspectRatios = [
	{ value: "1:1", label: "Square (1:1)" },
	{ value: "16:9", label: "Landscape (16:9)" },
	{ value: "9:16", label: "Portrait (9:16)" },
	{ value: "4:3", label: "Landscape (4:3)" },
	{ value: "3:4", label: "Portrait (3:4)" }
]

export function ImageModelSelector({
	session,
	selectedImageModelId,
	selectedAspectRatio = "1:1",
	selectedGuidanceScale = "10",
	className
}: {
	session: Session
	selectedImageModelId: string
	selectedAspectRatio?: string
	selectedGuidanceScale?: string
} & React.ComponentProps<typeof Button>) {
	const [open, setOpen] = useState(false)
	const [optimisticImageModelId, setOptimisticImageModelId] =
		useOptimistic(selectedImageModelId)

	// Use regular state for the new props to avoid infinite renders
	const [localAspectRatio, setLocalAspectRatio] =
		useState(selectedAspectRatio)
	const [localGuidanceScale, setLocalGuidanceScale] = useState(
		selectedGuidanceScale
	)

	const userType = session.user.type
	const { availableImageModelIds } = entitlementsByUserType[userType]

	const availableImageModels = useMemo(
		() =>
			imageModels.filter((imageModel) =>
				availableImageModelIds.includes(imageModel.id)
			),
		[availableImageModelIds]
	)

	// Separate models by capability
	const textToImageModels = useMemo(
		() =>
			availableImageModels.filter(
				(model) =>
					model.capabilities.textToImage &&
					!model.capabilities.imageToImage &&
					!model.capabilities.multiImage
			),
		[availableImageModels]
	)

	const imageToImageModels = useMemo(
		() =>
			availableImageModels.filter(
				(model) =>
					model.capabilities.imageToImage &&
					!model.capabilities.textToImage &&
					!model.capabilities.multiImage
			),
		[availableImageModels]
	)

	const multiImageModels = useMemo(
		() =>
			availableImageModels.filter(
				(model) => model.capabilities.multiImage
			),
		[availableImageModels]
	)

	const selectedImageModel = useMemo(
		() =>
			availableImageModels.find(
				(imageModel) => imageModel.id === optimisticImageModelId
			),
		[optimisticImageModelId, availableImageModels]
	)

	const selectedAspectRatioLabel = useMemo(
		() =>
			aspectRatios.find((ratio) => ratio.value === localAspectRatio)
				?.label || "Square (1:1)",
		[localAspectRatio]
	)

	const handleGuidanceScaleChange = useCallback((newValue: number) => {
		const clampedValue = Math.max(1, Math.min(20, newValue))
		const valueStr = clampedValue.toString()
		setLocalGuidanceScale(valueStr)
		startTransition(() => {
			saveGuidanceScaleAsCookie(valueStr)
		})
	}, [])

	const handleAspectRatioChange = useCallback((aspectRatio: string) => {
		setLocalAspectRatio(aspectRatio)
		startTransition(() => {
			saveAspectRatioAsCookie(aspectRatio)
		})
	}, [])

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
					data-testid="image-model-selector"
					variant="outline"
					className="md:px-2 md:h-[34px] px-2"
				>
					<ImageIcon size={12} />
					<span className="hidden md:inline">
						{selectedImageModel?.name || "Select Model"}
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
			<DropdownMenuContent align="start" className="min-w-[250px] p-4">
				{/* Text-to-Image Models Section */}
				<DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-2">
					Text-to-Image Models
				</DropdownMenuLabel>
				<div className="grid grid-cols-2 gap-2 mb-4">
					{textToImageModels.map((imageModel) => {
						const { id } = imageModel
						const isSelected = id === optimisticImageModelId

						return (
							<button
								key={id}
								data-testid={`image-model-selector-item-${id}`}
								type="button"
								onClick={() => {
									startTransition(() => {
										setOptimisticImageModelId(id)
										saveImageModelAsCookie(id)
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
												{imageModel.name}
											</span>
											{isSelected && (
												<div className="text-primary flex-shrink-0">
													<CheckCircleFillIcon />
												</div>
											)}
										</div>
										<div className="text-xs text-muted-foreground line-clamp-2">
											{imageModel.description}
										</div>
									</div>
								</div>
							</button>
						)
					})}
				</div>

				{/* Separator between sections */}
				{textToImageModels.length > 0 &&
					imageToImageModels.length > 0 && (
						<DropdownMenuSeparator className="my-4" />
					)}

				{/* Image-to-Image Models Section */}
				{imageToImageModels.length > 0 && (
					<>
						<DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-2">
							Image-to-Image Models
						</DropdownMenuLabel>
						<div className="grid grid-cols-2 gap-2 mb-4">
							{imageToImageModels.map((imageModel) => {
								const { id } = imageModel
								const isSelected = id === optimisticImageModelId

								return (
									<button
										key={id}
										data-testid={`image-model-selector-item-${id}`}
										type="button"
										onClick={() => {
											startTransition(() => {
												setOptimisticImageModelId(id)
												saveImageModelAsCookie(id)
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
														{imageModel.name}
													</span>
													{isSelected && (
														<div className="text-primary flex-shrink-0">
															<CheckCircleFillIcon />
														</div>
													)}
												</div>
												<div className="text-xs text-muted-foreground line-clamp-2">
													{imageModel.description}
												</div>
											</div>
										</div>
									</button>
								)
							})}
						</div>
					</>
				)}

				{/* Separator between I2I and Multi-Image sections */}
				{(textToImageModels.length > 0 ||
					imageToImageModels.length > 0) &&
					multiImageModels.length > 0 && (
						<DropdownMenuSeparator className="my-4" />
					)}

				{/* Multi-Image to Image Models Section */}
				{multiImageModels.length > 0 && (
					<>
						<DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-2">
							Multi-Image to Image Models
						</DropdownMenuLabel>
						<div className="grid grid-cols-2 gap-2 mb-4">
							{multiImageModels.map((imageModel) => {
								const { id } = imageModel
								const isSelected = id === optimisticImageModelId

								return (
									<button
										key={id}
										data-testid={`image-model-selector-item-${id}`}
										type="button"
										onClick={() => {
											startTransition(() => {
												setOptimisticImageModelId(id)
												saveImageModelAsCookie(id)
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
														{imageModel.name}
													</span>
													{isSelected && (
														<div className="text-primary flex-shrink-0">
															<CheckCircleFillIcon />
														</div>
													)}
												</div>
												<div className="text-xs text-muted-foreground line-clamp-2">
													{imageModel.description}
												</div>
											</div>
										</div>
									</button>
								)
							})}
						</div>
					</>
				)}

				<DropdownMenuSeparator className="my-4" />

				{/* Controls Section */}
				<div className="flex items-center gap-4">
					{/* Guidance Scale - only show for models that support it */}
					{selectedImageModel &&
						modelSupportsGuidanceScale(selectedImageModel.id) && (
							<div className="flex items-center gap-2">
								<span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
									Guidance Scale
								</span>
								<div className="flex items-center gap-1">
									<Button
										variant="outline"
										size="sm"
										className="h-7 w-7 p-0"
										onClick={() =>
											handleGuidanceScaleChange(
												parseInt(localGuidanceScale) - 1
											)
										}
										disabled={
											parseInt(localGuidanceScale) <= 1
										}
									>
										<Minus size={12} />
									</Button>
									<Input
										type="number"
										min="1"
										max="20"
										value={localGuidanceScale}
										onChange={(e) => {
											const value =
												parseInt(e.target.value) || 1
											handleGuidanceScaleChange(value)
										}}
										className="w-16 h-7 text-center text-xs"
									/>
									<Button
										variant="outline"
										size="sm"
										className="h-7 w-7 p-0"
										onClick={() =>
											handleGuidanceScaleChange(
												parseInt(localGuidanceScale) + 1
											)
										}
										disabled={
											parseInt(localGuidanceScale) >= 20
										}
									>
										<Plus size={12} />
									</Button>
								</div>
							</div>
						)}

					{/* Aspect Ratio */}
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
							Aspect Ratio
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
								>
									{selectedAspectRatioLabel}
									<ChevronDownIcon size={12} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="min-w-[160px]"
							>
								{aspectRatios.map((ratio) => (
									<DropdownMenuItem
										key={ratio.value}
										onSelect={() =>
											handleAspectRatioChange(ratio.value)
										}
										className="text-xs"
									>
										<div className="flex items-center justify-between w-full">
											<span>{ratio.label}</span>
											{ratio.value ===
												localAspectRatio && (
												<CheckCircleFillIcon />
											)}
										</div>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
