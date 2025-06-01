import { imagePrompt, updateDocumentPrompt } from "@/lib/ai/prompts"
import { myProvider } from "@/lib/ai/providers"
import { createDocumentHandler } from "@/lib/artifacts/server"
import {
	imageModels,
	DEFAULT_IMAGE_MODEL,
	IMAGE_MODEL_IDS,
	getAspectRatioParameterForModel,
	modelSupportsGuidanceScale,
	type UniversalAspectRatio,
	type ImageModelId
} from "@/lib/ai/models"
import { experimental_generateImage } from "ai"
import type { Attachment, UIMessage } from "ai"

const enhanceImagePrompt = (userPrompt: string): string => {
	// Add quality and style enhancements to the prompt
	const qualityTerms = "high quality, detailed, professional, 8k resolution"
	const styleGuidance = "well-composed, good lighting, sharp focus"

	// Check if the prompt already contains quality terms
	const hasQualityTerms =
		/\b(high quality|detailed|professional|8k|4k|hd|sharp|crisp)\b/i.test(
			userPrompt
		)

	if (hasQualityTerms) {
		return userPrompt
	}

	return `${userPrompt}, ${qualityTerms}, ${styleGuidance}`
}

const extractImageUrlFromText = (text: string): string | null => {
	// Look for image URLs in the text (http/https URLs ending with image extensions)
	const imageUrlRegex =
		/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s]*)?/i
	const match = text.match(imageUrlRegex)
	return match ? match[0] : null
}

const extractBase64ImageFromText = (text: string): string | null => {
	// Look for base64 image data in the text
	const base64Regex = /data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/
	const match = text.match(base64Regex)
	return match ? match[0] : null
}

const parseImageInput = (
	input: string,
	attachments?: Array<Attachment>
): { prompt: string; imageUrls: string[] } => {
	// Collect all image URLs from attachments and text
	let imageUrls: string[] = []

	// First, check for image attachments (prioritize over text-embedded URLs)
	if (attachments && attachments.length > 0) {
		// Find all image attachments
		const imageAttachments = attachments.filter((attachment) =>
			attachment.contentType?.startsWith("image/")
		)
		imageUrls.push(...imageAttachments.map((attachment) => attachment.url))
	}

	// If no attachments found, look for URLs or base64 data in text
	if (imageUrls.length === 0) {
		const imageUrl =
			extractImageUrlFromText(input) || extractBase64ImageFromText(input)
		if (imageUrl) {
			imageUrls.push(imageUrl)
		}
	}

	// Remove the image URL/data from the prompt to get clean text (only if it was embedded in text)
	let prompt = input
	if (
		imageUrls.length === 1 &&
		(extractImageUrlFromText(input) || extractBase64ImageFromText(input))
	) {
		prompt = input.replace(imageUrls[0], "").trim()
		// Clean up any leftover formatting
		prompt = prompt.replace(/^\s*[-•*]\s*/, "").trim()
		prompt = prompt.replace(/^(image|img|picture|photo):\s*/i, "").trim()
	}

	return { prompt, imageUrls }
}

const getOptimalImageModel = (
	selectedImageModelId: string,
	hasInputImages: boolean,
	isFirstGeneration: boolean = false,
	hasExistingImageArtifact: boolean = false,
	inputImageCount: number = 0
): string => {
	// For the new model structure, users explicitly select T2I or I2I models
	// We should respect their choice and only fall back if there's a capability mismatch
	// OR if there's an existing image artifact in the conversation (indicating editing intent)

	// Find the selected image model
	const selectedModel = imageModels.find(
		(model) => model.id === selectedImageModelId
	)

	if (!selectedModel) {
		// Fallback to default model
		return DEFAULT_IMAGE_MODEL
	}

	// PRIORITY 0: Respect user's explicit multi-image model selection
	// Only use multi-image models when explicitly selected by the user
	if (selectedModel.capabilities.multiImage) {
		return selectedImageModelId
	}

	// PRIORITY 1: Handle input image cases (including first-time generations with uploaded images)
	// If user has an input image but selected a T2I-only model, map to I2I equivalent
	if (hasInputImages && !selectedModel.capabilities.imageToImage) {
		// User selected a T2I model but has an input image (including first-time with upload)
		// Map to the corresponding I2I model
		if (selectedImageModelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I) {
			return IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I) {
			return IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.RECRAFT_V3_T2I) {
			return IMAGE_MODEL_IDS.RECRAFT_V3_I2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.IDEOGRAM_V3) {
			return IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX
		}
		// For models without direct I2I counterparts, map to FLUX_KONTEXT_I2I
		if (
			selectedImageModelId === IMAGE_MODEL_IDS.FLUX_PRO_ULTRA ||
			selectedImageModelId === IMAGE_MODEL_IDS.FLUX_PRO_V11 ||
			selectedImageModelId === IMAGE_MODEL_IDS.IMAGEN4_PREVIEW
		) {
			return IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I
		}

		// Fallback to first available I2I model
		const imageToImageModel = imageModels.find(
			(model) => model.capabilities.imageToImage
		)
		return imageToImageModel?.id || IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I
	}

	// PRIORITY 2: Handle existing image artifact editing (when no direct input image)
	// If there's an existing image artifact in the conversation and no direct input image,
	// but user selected a T2I model, map to the corresponding I2I model for editing
	if (
		hasExistingImageArtifact &&
		!hasInputImages &&
		selectedModel.capabilities.textToImage &&
		!selectedModel.capabilities.imageToImage
	) {
		// Map T2I models to their I2I counterparts for editing existing artifacts
		if (selectedImageModelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I) {
			return IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I) {
			return IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.RECRAFT_V3_T2I) {
			return IMAGE_MODEL_IDS.RECRAFT_V3_I2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.IDEOGRAM_V3) {
			return IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX
		}
		// For models without direct I2I counterparts, map to FLUX_KONTEXT_I2I
		if (
			selectedImageModelId === IMAGE_MODEL_IDS.FLUX_PRO_ULTRA ||
			selectedImageModelId === IMAGE_MODEL_IDS.FLUX_PRO_V11 ||
			selectedImageModelId === IMAGE_MODEL_IDS.IMAGEN4_PREVIEW
		) {
			return IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I
		}
	}

	// PRIORITY 3: Handle I2I model selected but no input image
	if (!hasInputImages && !selectedModel.capabilities.textToImage) {
		// User selected an I2I model but has no input image
		// Find a similar T2I model or fallback to a default T2I model
		if (selectedImageModelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I) {
			return IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I) {
			return IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.RECRAFT_V3_I2I) {
			return IMAGE_MODEL_IDS.RECRAFT_V3_T2I
		}
		if (selectedImageModelId === IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX) {
			return IMAGE_MODEL_IDS.IDEOGRAM_V3
		}

		// Fallback to first available T2I model
		const textToImageModel = imageModels.find(
			(model) => model.capabilities.textToImage
		)
		return textToImageModel?.id || IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I
	}

	// Legacy support for old model IDs
	if (selectedImageModelId === IMAGE_MODEL_IDS.FLUX_PRO_FIRST_TIME) {
		return hasInputImages
			? IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I
			: IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I
	}

	// If we reach here, the selected model is compatible with the input type
	return selectedImageModelId
}

const getModelParameters = (modelId: string) => {
	const model = imageModels.find((m) => m.id === modelId)
	return (
		model?.parameters || {
			guidanceScale: 10,
			inferenceSteps: 50,
			maxSize: "1024x1024"
		}
	)
}

const isFirstImageGenerationInConversation = (
	messages: Array<UIMessage>
): boolean => {
	// Check if any previous messages contain image artifacts
	// Look for assistant messages that mention image creation or contain image-related tool calls
	for (const message of messages) {
		if (message.role === "assistant" && message.parts) {
			for (const part of message.parts) {
				if (part.type === "tool-invocation") {
					const { toolInvocation } = part
					if (
						toolInvocation.toolName === "createDocument" &&
						toolInvocation.state === "call"
					) {
						const args = toolInvocation.args as { kind?: string }
						if (args.kind === "image") {
							return false // Found a previous image generation
						}
					}
				}
			}
		}
	}
	return true // No previous image generations found
}

const getFalModelName = (modelId: string): string => {
	// Handle the new model IDs
	if (modelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I) {
		return "fal-ai/flux-pro/kontext/text-to-image"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I) {
		return "fal-ai/flux-pro/kontext/max/text-to-image"
	}
	if (modelId === IMAGE_MODEL_IDS.IMAGEN4_PREVIEW) {
		return "fal-ai/imagen4/preview"
	}
	if (modelId === IMAGE_MODEL_IDS.RECRAFT_V3_T2I) {
		return "fal-ai/recraft/v3/text-to-image"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_PRO_ULTRA) {
		return "fal-ai/flux-pro/v1.1-ultra"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_PRO_V11) {
		return "fal-ai/flux-pro/v1.1"
	}
	if (modelId === IMAGE_MODEL_IDS.IDEOGRAM_V3) {
		return "fal-ai/ideogram/v3"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I) {
		return "fal-ai/flux-pro/kontext"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I) {
		return "fal-ai/flux-pro/kontext/max"
	}
	if (modelId === IMAGE_MODEL_IDS.RECRAFT_V3_I2I) {
		return "fal-ai/recraft/v3/image-to-image"
	}
	if (modelId === IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX) {
		return "fal-ai/ideogram/v3/remix"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_MULTI) {
		return "fal-ai/flux-pro/kontext/max/multi"
	}

	// Legacy model handling
	if (modelId === IMAGE_MODEL_IDS.FLUX_PRO_TEXT_TO_IMAGE) {
		return "fal-ai/flux-pro/kontext/text-to-image"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_PRO_IMAGE_TO_IMAGE) {
		return "fal-ai/flux-pro/kontext"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_SCHNELL) {
		return "fal-ai/flux/schnell"
	}
	if (modelId === IMAGE_MODEL_IDS.FLUX_DEV) {
		return "fal-ai/flux/dev"
	}

	// Fallback to the model ID if no mapping found
	return modelId
}

const getLatestImageArtifactFromConversation = (
	messages: Array<UIMessage>
): string | null => {
	// Look for the most recent image artifact in the conversation
	// Search backwards through messages to find the latest one
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i]
		if (message.role === "assistant" && message.parts) {
			for (const part of message.parts) {
				if (part.type === "tool-invocation") {
					const { toolInvocation } = part
					if (
						toolInvocation.state === "result" &&
						(toolInvocation.toolName === "createDocument" ||
							toolInvocation.toolName === "updateDocument")
					) {
						try {
							const result = toolInvocation.result as {
								kind?: string
								content?: string
							}
							if (result.kind === "image" && result.content) {
								return `data:image/png;base64,${result.content}`
							}
						} catch {
							// Continue searching if parsing fails
						}
					}
				}
			}
		}
	}
	return null
}

const filterImagesForModel = (
	allImages: string[],
	selectedModel: { capabilities?: { multiImage?: boolean } } | undefined
): string[] => {
	// If it's a multi-image model, return all images
	if (selectedModel?.capabilities?.multiImage) {
		return allImages
	}

	// For regular I2I models, return only the last image
	if (allImages.length > 1) {
		return [allImages[allImages.length - 1]]
	}

	return allImages
}

export const imageDocumentHandler = createDocumentHandler<"image">({
	kind: "image",
	onCreateDocument: async ({
		title,
		dataStream,
		messages,
		selectedImageModel,
		selectedAspectRatio,
		selectedGuidanceScale
	}) => {
		let draftContent = ""

		try {
			// Check if this is the first image generation in the conversation
			const isFirstGeneration = isFirstImageGenerationInConversation(
				messages || []
			)

			// Check if there's an existing image artifact in the conversation
			// This indicates the user might want to edit/modify an existing image
			const hasExistingImageArtifact = !isFirstGeneration

			// Get the latest user message to extract attachments
			const latestMessage =
				messages && messages.length > 0
					? messages[messages.length - 1]
					: null
			const attachments = latestMessage?.experimental_attachments || []

			// Parse the title to extract image URLs and text prompt
			const { prompt: textPrompt, imageUrls: inputImages } =
				parseImageInput(title, attachments)

			// If there's no direct input images but there's an existing image artifact,
			// use the latest image artifact as the base image for editing
			let baseImageForEditing: string | null = null
			if (inputImages.length === 0 && hasExistingImageArtifact) {
				baseImageForEditing = getLatestImageArtifactFromConversation(
					messages || []
				)
			}

			// Use the extracted text prompt, fallback to original title if no image found
			const promptToUse = textPrompt || title
			const enhancedPrompt = enhanceImagePrompt(promptToUse)

			// Choose optimal model based on selected model and input type
			// Priority order:
			// 1. If user has uploaded/provided an image (including first-time), use I2I model
			// 2. If editing existing artifact without new image, use I2I model
			// 3. If pure text-to-image, use T2I model
			const modelToUse = selectedImageModel || DEFAULT_IMAGE_MODEL

			const optimalModelId = getOptimalImageModel(
				modelToUse,
				!!(inputImages.length > 0 || baseImageForEditing),
				isFirstGeneration,
				hasExistingImageArtifact,
				inputImages.length + (baseImageForEditing ? 1 : 0)
			)
			const modelParams = getModelParameters(optimalModelId)

			// Use user-selected parameters with fallback to model defaults
			const guidanceScale =
				selectedGuidanceScale || modelParams.guidanceScale
			const aspectRatio =
				(selectedAspectRatio as UniversalAspectRatio) || "1:1"

			// Get the model-specific aspect ratio parameter (only for T2I models)
			const aspectRatioConfig = getAspectRatioParameterForModel(
				optimalModelId as (typeof IMAGE_MODEL_IDS)[keyof typeof IMAGE_MODEL_IDS],
				aspectRatio
			)

			const generateParams: Parameters<
				typeof experimental_generateImage
			>[0] = {
				model: myProvider.imageModel(optimalModelId),
				prompt: enhancedPrompt,
				n: 1,
				size: modelParams.maxSize as "1024x1024"
			}

			// Add image-to-image specific parameters if we have input images or base image for editing
			const allImages = [
				...inputImages,
				...(baseImageForEditing ? [baseImageForEditing] : [])
			]

			// Filter images based on model capabilities
			const selectedModel = imageModels.find(
				(m) => m.id === optimalModelId
			)
			const imagesToUse = filterImagesForModel(allImages, selectedModel)

			if (imagesToUse.length > 0) {
				const falOptions: Record<
					string,
					string | number | boolean | string[]
				> = {
					// Use image_urls for multiple images, image_url for single image (backward compatibility)
					...(imagesToUse.length > 1
						? { image_urls: imagesToUse }
						: { image_url: imagesToUse[0] }),
					num_inference_steps: modelParams.inferenceSteps,
					sync_mode: true,
					// Strength controls how much the input image influences the output
					// Lower values preserve more of the original image
					// Use lower strength for editing existing artifacts vs new input images
					strength: 0.8
				}

				// Only add guidance scale for models that support it
				if (
					modelSupportsGuidanceScale(optimalModelId as ImageModelId)
				) {
					falOptions.guidance_scale = guidanceScale
				}

				// Only add aspect ratio for T2I models
				if (aspectRatioConfig) {
					falOptions[aspectRatioConfig.parameterName] =
						aspectRatioConfig.value
				}

				generateParams.providerOptions = { fal: falOptions }
			} else {
				const falOptions: Record<
					string,
					string | number | boolean | string[]
				> = {
					num_inference_steps: modelParams.inferenceSteps,
					sync_mode: true
				}

				// Only add guidance scale for models that support it
				if (
					modelSupportsGuidanceScale(optimalModelId as ImageModelId)
				) {
					falOptions.guidance_scale = guidanceScale
				}

				// Only add aspect ratio for T2I models
				if (aspectRatioConfig) {
					falOptions[aspectRatioConfig.parameterName] =
						aspectRatioConfig.value
				}

				generateParams.providerOptions = { fal: falOptions }
			}

			const { image } = await experimental_generateImage(generateParams)

			draftContent = image.base64

			// Stream the generated image data
			dataStream.writeData({
				type: "image-delta",
				content: image.base64
			})
		} catch (error) {
			console.error("Image generation failed:", error)
			throw error
		}

		return draftContent
	},
	onUpdateDocument: async ({
		document,
		description,
		dataStream,
		messages,
		selectedImageModel,
		selectedAspectRatio,
		selectedGuidanceScale
	}) => {
		let draftContent = ""

		try {
			// Get the latest user message to extract attachments
			const latestMessage =
				messages && messages.length > 0
					? messages[messages.length - 1]
					: null
			const attachments = latestMessage?.experimental_attachments || []

			// Parse the description to extract any new image URLs and text prompt
			const { prompt: textPrompt, imageUrls: newInputImages } =
				parseImageInput(description, attachments)

			// Use the new input images if provided, otherwise use the existing document content as base
			const allImages =
				newInputImages.length > 0
					? newInputImages
					: [`data:image/png;base64,${document.content}`]
			const promptToUse = textPrompt || description
			const enhancedPrompt = enhanceImagePrompt(promptToUse)

			// For updates, we always have a base image, so use image-to-image capable model
			// Don't use first-time logic for updates - use the user's selected model
			const modelToUse = selectedImageModel || DEFAULT_IMAGE_MODEL

			const optimalModelId = getOptimalImageModel(
				modelToUse,
				true, // Always true for updates since we have a base image
				false, // Never first generation for updates
				true, // Always true for updates since we're updating an existing image artifact
				allImages.length
			)
			const modelParams = getModelParameters(optimalModelId)

			// Filter images based on model capabilities
			const selectedModel = imageModels.find(
				(m) => m.id === optimalModelId
			)
			const imagesToUse = filterImagesForModel(allImages, selectedModel)

			// Use user-selected parameters with fallback to model defaults
			const guidanceScale =
				selectedGuidanceScale || modelParams.guidanceScale
			const aspectRatio =
				(selectedAspectRatio as UniversalAspectRatio) || "1:1"

			// Get the model-specific aspect ratio parameter (only for T2I models)
			const aspectRatioConfig = getAspectRatioParameterForModel(
				optimalModelId as (typeof IMAGE_MODEL_IDS)[keyof typeof IMAGE_MODEL_IDS],
				aspectRatio
			)

			const falOptions: Record<
				string,
				string | number | boolean | string[]
			> = {
				// Use image_urls for multiple images, image_url for single image (backward compatibility)
				...(imagesToUse.length > 1
					? { image_urls: imagesToUse }
					: { image_url: imagesToUse[0] }),
				num_inference_steps: modelParams.inferenceSteps,
				sync_mode: true,
				// Adjust strength based on whether we have a new input images
				// Higher strength for new images, lower for modifications
				strength: 0.8
			}

			// Only add guidance scale for models that support it
			if (modelSupportsGuidanceScale(optimalModelId as ImageModelId)) {
				falOptions.guidance_scale = guidanceScale
			}

			// Only add aspect ratio for T2I models
			if (aspectRatioConfig) {
				falOptions[aspectRatioConfig.parameterName] =
					aspectRatioConfig.value
			}

			const { image } = await experimental_generateImage({
				model: myProvider.imageModel(optimalModelId),
				prompt: enhancedPrompt,
				n: 1,
				size: modelParams.maxSize as "1024x1024",
				providerOptions: { fal: falOptions }
			})

			draftContent = image.base64

			// Stream the updated image data
			dataStream.writeData({
				type: "image-delta",
				content: image.base64
			})
		} catch (error) {
			console.error("Image update failed:", error)
			throw error
		}

		return draftContent
	}
})
