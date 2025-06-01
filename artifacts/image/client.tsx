import { Artifact } from "@/components/create-artifact"
import {
	Copy,
	Redo,
	Undo,
	RotateCcw,
	Palette,
	Image,
	Download,
	Edit,
	Sparkles,
	Upload,
	Link,
	ZoomIn,
	ZoomOut,
	RotateCw,
	Maximize2
} from "lucide-react"
import { ImageEditor } from "@/components/image-editor"
import { toast } from "sonner"

interface ImageArtifactMetadata {
	originalPrompt: string
	aspectRatio: string
	style: string
	generationType?: "text-to-image" | "image-to-image"
	hasInputImage?: boolean
	inputImageUrl?: string
	zoom?: number
	rotation?: number
	isFullscreen?: boolean
}

export const imageArtifact = new Artifact<"image", ImageArtifactMetadata>({
	kind: "image",
	description:
		"Useful for image generation and editing. Supports text-to-image, image-to-image, and multi-image generation. You can upload multiple images as attachments or include image URLs in your prompt for advanced image transformations. When multiple images are uploaded, the system automatically switches to a multi-image model for enhanced context understanding.",
	initialize: async ({ setMetadata }) => {
		setMetadata({
			originalPrompt: "",
			aspectRatio: "1:1",
			style: "realistic",
			generationType: "text-to-image",
			hasInputImage: false,
			zoom: 1,
			rotation: 0,
			isFullscreen: false
		})
	},
	onStreamPart: ({ streamPart, setArtifact }) => {
		if (streamPart.type === "image-delta") {
			console.log("Image stream part received:", {
				type: streamPart.type,
				contentLength: (streamPart.content as string)?.length || 0,
				contentPreview:
					(streamPart.content as string)?.substring(0, 50) + "..."
			})

			setArtifact((draftArtifact) => ({
				...draftArtifact,
				content: streamPart.content as string,
				isVisible: true,
				status: "idle"
			}))
		}
	},
	content: ImageEditor,
	actions: [
		{
			icon: <ZoomOut size={18} />,
			description: "Zoom out",
			onClick: ({ metadata, setMetadata }) => {
				setMetadata((prev) => ({
					...prev,
					zoom: Math.max((prev.zoom || 1) - 0.25, 0.25)
				}))
			},
			isDisabled: ({ metadata }) => {
				return (metadata?.zoom || 1) <= 0.25
			}
		},

		{
			icon: <ZoomIn size={18} />,
			description: "Zoom in",
			onClick: ({ metadata, setMetadata }) => {
				setMetadata((prev) => ({
					...prev,
					zoom: Math.min((prev.zoom || 1) + 0.25, 3)
				}))
			},
			isDisabled: ({ metadata }) => {
				return (metadata?.zoom || 1) >= 3
			}
		},
		{
			icon: <RotateCw size={18} />,
			description: "Rotate image",
			onClick: ({ metadata, setMetadata }) => {
				setMetadata((prev) => ({
					...prev,
					rotation: ((prev.rotation || 0) + 90) % 360
				}))
			}
		},
		{
			icon: <Maximize2 size={18} />,
			description: "Toggle fullscreen",
			onClick: ({ metadata, setMetadata }) => {
				setMetadata((prev) => ({
					...prev,
					isFullscreen: !prev.isFullscreen
				}))
			}
		},
		{
			icon: <RotateCcw size={18} />,
			description: "Regenerate image",
			onClick: ({ metadata }) => {
				console.log("Regenerate clicked", metadata)
			}
		},
		{
			icon: <Undo size={18} />,
			description: "View Previous version",
			onClick: ({ handleVersionChange }) => {
				handleVersionChange("prev")
			},
			isDisabled: ({ currentVersionIndex }) => {
				if (currentVersionIndex === 0) {
					return true
				}

				return false
			}
		},
		{
			icon: <Redo size={18} />,
			description: "View Next version",
			onClick: ({ handleVersionChange }) => {
				handleVersionChange("next")
			},
			isDisabled: ({ isCurrentVersion }) => {
				if (isCurrentVersion) {
					return true
				}

				return false
			}
		},
		{
			icon: <Download size={18} />,
			description: "Download image",
			onClick: ({ content }) => {
				const link = document.createElement("a")
				link.href = `data:image/png;base64,${content}`
				link.download = `generated_image_${Date.now()}.png`
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				toast.success("Image downloaded!")
			}
		},
		{
			icon: <Copy size={18} />,
			description: "Copy image to clipboard",
			onClick: ({ content }) => {
				try {
					const img = new window.Image()
					img.src = `data:image/png;base64,${content}`

					img.onload = () => {
						const canvas = document.createElement("canvas")
						canvas.width = img.width
						canvas.height = img.height
						const ctx = canvas.getContext("2d")
						ctx?.drawImage(img, 0, 0)
						canvas.toBlob((blob) => {
							if (
								blob &&
								navigator.clipboard &&
								"write" in navigator.clipboard &&
								"ClipboardItem" in window
							) {
								const ClipboardItem = (
									window as typeof window & {
										ClipboardItem: new (
											items: Record<string, Blob>
										) => ClipboardItem
									}
								).ClipboardItem
								navigator.clipboard.write([
									new ClipboardItem({
										"image/png": blob
									})
								])
							}
						}, "image/png")
					}

					toast.success("Copied image to clipboard!")
				} catch (error) {
					toast.error("Failed to copy image to clipboard")
				}
			}
		}
	],
	toolbar: [
		{
			icon: <RotateCcw />,
			description: "Regenerate image",
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: "user",
					content:
						"Regenerate this image with the same style and composition"
				})
			}
		},
		{
			icon: <Edit />,
			description: "Edit image",
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: "user",
					content:
						"Please modify this image. What changes would you like me to make?"
				})
			}
		},
		{
			icon: <Upload />,
			description: "Upload image to edit",
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: "user",
					content:
						"To edit an image, you can:\n\n1. Upload an image file using the attachment button (📎)\n2. Then describe the changes you want to make\n\nExample: Upload a photo and say 'Make this image more vibrant and add dramatic lighting'"
				})
			}
		},
		{
			icon: <Link />,
			description: "Image-to-image guide",
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: "user",
					content:
						"Here's how to use image-to-image generation:\n\n**Method 1: Upload files**\n1. Click the attachment button (📎) to upload an image\n2. Add your modification instructions in the text\n\n**Method 2: Use URLs**\n1. Include an image URL in your prompt\n2. Add your modification instructions\n\nExample:\nhttps://example.com/photo.jpg\nConvert this to a watercolor painting style"
				})
			}
		},
		{
			icon: <Palette />,
			description: "Change style",
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: "user",
					content:
						"Create a variation of this image in a different artistic style (e.g., watercolor, oil painting, digital art, photorealistic, cartoon, etc.)"
				})
			}
		},
		{
			icon: <Image />,
			description: "Change aspect ratio",
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: "user",
					content:
						"Recreate this image in a different aspect ratio (16:9 landscape, 9:16 portrait, or 4:3)"
				})
			}
		},
		{
			icon: <Sparkles />,
			description: "Enhance image",
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: "user",
					content:
						"Enhance this image with better lighting, more detail, and improved composition"
				})
			}
		}
	]
})
