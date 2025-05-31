import cn from "classnames"
import { useState } from "react"
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2 } from "lucide-react"
import { LoaderIcon } from "./icons"

interface ImageEditorProps {
	title: string
	content: string
	isCurrentVersion: boolean
	currentVersionIndex: number
	status: string
	isInline: boolean
}

export function ImageEditor({
	title,
	content,
	status,
	isInline
}: ImageEditorProps) {
	const [zoom, setZoom] = useState(1)
	const [rotation, setRotation] = useState(0)
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [imageError, setImageError] = useState(false)

	const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
	const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25))
	const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
	const handleFullscreen = () => setIsFullscreen(!isFullscreen)

	if (status === "streaming") {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center w-full",
					{
						"h-[calc(100dvh-60px)]": !isInline,
						"h-[200px]": isInline
					}
				)}
			>
				<div className="flex flex-col gap-4 items-center">
					<div className="animate-spin">
						<LoaderIcon />
					</div>
					<div className="text-lg font-medium">
						Generating Image...
					</div>
					<div className="text-sm text-muted-foreground">
						This may take a few moments
					</div>
				</div>
			</div>
		)
	}

	// Show error state if no content or image failed to load
	if (!content || content.trim() === "" || imageError) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center w-full",
					{
						"h-[calc(100dvh-60px)]": !isInline,
						"h-[200px]": isInline
					}
				)}
			>
				<div className="flex flex-col gap-4 items-center text-center">
					<div className="text-lg font-medium text-muted-foreground">
						{imageError
							? "Failed to load image"
							: "No image content"}
					</div>
					<div className="text-sm text-muted-foreground">
						{imageError
							? "There was an error loading the generated image. Please try again."
							: "The image content appears to be empty. Please try generating a new image."}
					</div>
					{process.env.NODE_ENV === "development" && (
						<div className="text-xs text-muted-foreground font-mono">
							Debug: content length = {content?.length || 0},
							status = {status}
						</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<div
			className={cn("flex flex-col w-full", {
				"h-[calc(100dvh-60px)]": !isInline,
				"h-[400px]": isInline,
				"fixed inset-0 z-50 bg-black": isFullscreen
			})}
		>
			{/* Image Controls */}
			{!isInline && (
				<div className="flex items-center justify-between p-4 border-b bg-background">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleZoomOut}
							className="p-2 hover:bg-muted rounded-3xl transition-colors"
							disabled={zoom <= 0.25}
						>
							<ZoomOut size={16} />
						</button>
						<span className="text-sm font-medium min-w-[60px] text-center">
							{Math.round(zoom * 100)}%
						</span>
						<button
							type="button"
							onClick={handleZoomIn}
							className="p-2 hover:bg-muted rounded-3xl transition-colors"
							disabled={zoom >= 3}
						>
							<ZoomIn size={16} />
						</button>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleRotate}
							className="p-2 hover:bg-muted rounded-3xl transition-colors"
						>
							<RotateCw size={16} />
						</button>
						<button
							type="button"
							onClick={handleFullscreen}
							className="p-2 hover:bg-muted rounded-3xl transition-colors"
						>
							<Maximize2 size={16} />
						</button>
					</div>
				</div>
			)}

			{/* Image Display Area */}
			<div
				className={cn(
					"flex-1 flex items-center justify-center overflow-auto",
					{
						"p-4 md:p-8": !isInline && !isFullscreen,
						"p-2": isInline,
						"p-8": isFullscreen
					}
				)}
			>
				<div
					className="relative transition-transform duration-200 ease-in-out"
					style={{
						transform: `scale(${zoom}) rotate(${rotation}deg)`
					}}
				>
					<img
						className={cn(
							"max-w-full max-h-full object-contain rounded-2xl shadow-lg",
							{
								"max-w-[800px] max-h-[600px]":
									!isInline && !isFullscreen,
								"max-w-[300px] max-h-[200px]": isInline,
								"max-w-[90vw] max-h-[90vh]": isFullscreen
							}
						)}
						src={`data:image/png;base64,${content}`}
						alt={title}
						draggable={false}
						onError={() => {
							console.error("Image failed to load:", {
								title,
								contentLength: content?.length
							})
							setImageError(true)
						}}
						onLoad={() => {
							console.log("Image loaded successfully:", {
								title,
								contentLength: content?.length
							})
							setImageError(false)
						}}
					/>
				</div>
			</div>

			{/* Fullscreen overlay controls */}
			{isFullscreen && (
				<button
					type="button"
					onClick={handleFullscreen}
					className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-3xl transition-colors"
				>
					<Minimize2 size={16} />
				</button>
			)}
		</div>
	)
}
