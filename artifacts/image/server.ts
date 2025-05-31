import { imagePrompt, updateDocumentPrompt } from "@/lib/ai/prompts"
import { myProvider } from "@/lib/ai/providers"
import { createDocumentHandler } from "@/lib/artifacts/server"
import { experimental_generateImage } from "ai"
import type { Attachment } from "ai"

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
): { prompt: string; imageUrl: string | null } => {
	// First, check for image attachments (prioritize over text-embedded URLs)
	let imageUrl: string | null = null

	if (attachments && attachments.length > 0) {
		// Find the first image attachment
		const imageAttachment = attachments.find((attachment) =>
			attachment.contentType?.startsWith("image/")
		)
		if (imageAttachment) {
			imageUrl = imageAttachment.url
		}
	}

	// If no attachment found, look for URLs or base64 data in text
	if (!imageUrl) {
		imageUrl =
			extractImageUrlFromText(input) || extractBase64ImageFromText(input)
	}

	// Remove the image URL/data from the prompt to get clean text (only if it was embedded in text)
	let prompt = input
	if (
		imageUrl &&
		(extractImageUrlFromText(input) || extractBase64ImageFromText(input))
	) {
		prompt = input.replace(imageUrl, "").trim()
		// Clean up any leftover formatting
		prompt = prompt.replace(/^\s*[-•*]\s*/, "").trim()
		prompt = prompt.replace(/^(image|img|picture|photo):\s*/i, "").trim()
	}

	return { prompt, imageUrl }
}

export const imageDocumentHandler = createDocumentHandler<"image">({
	kind: "image",
	onCreateDocument: async ({ title, dataStream, messages }) => {
		let draftContent = ""

		try {
			// Get the latest user message to extract attachments
			const latestMessage =
				messages && messages.length > 0
					? messages[messages.length - 1]
					: null
			const attachments = latestMessage?.experimental_attachments || []

			// Parse the title to extract image URL and text prompt
			const { prompt: textPrompt, imageUrl: inputImage } =
				parseImageInput(title, attachments)

			// Use the extracted text prompt, fallback to original title if no image found
			const promptToUse = textPrompt || title
			const enhancedPrompt = enhanceImagePrompt(promptToUse)

			// Choose model and parameters based on whether we have an input image
			const modelToUse = inputImage ? "edit-img-model" : "first-img-model"

			const generateParams: Parameters<
				typeof experimental_generateImage
			>[0] = {
				model: myProvider.imageModel(modelToUse),
				prompt: enhancedPrompt,
				n: 1,
				size: "1024x1024"
			}

			// Add image-to-image specific parameters if we have an input image
			if (inputImage) {
				generateParams.providerOptions = {
					fal: {
						image_url: inputImage,
						guidance_scale: 10,
						num_inference_steps: 50,
						sync_mode: true,
						// Strength controls how much the input image influences the output
						// Lower values preserve more of the original image
						strength: 0.8
					}
				}
			} else {
				// Text-to-image specific parameters
				generateParams.providerOptions = {
					fal: {
						guidance_scale: 10,
						num_inference_steps: 50,
						sync_mode: true
					}
				}
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
		messages
	}) => {
		let draftContent = ""

		try {
			// Get the latest user message to extract attachments
			const latestMessage =
				messages && messages.length > 0
					? messages[messages.length - 1]
					: null
			const attachments = latestMessage?.experimental_attachments || []

			// Parse the description to extract any new image URL and text prompt
			const { prompt: textPrompt, imageUrl: newInputImage } =
				parseImageInput(description, attachments)

			// Use the new input image if provided, otherwise use the existing document content as base
			const baseImage =
				newInputImage || `data:image/png;base64,${document.content}`
			const promptToUse = textPrompt || description
			const enhancedPrompt = enhanceImagePrompt(promptToUse)

			// Always use the edit model for updates since we have a base image
			const { image } = await experimental_generateImage({
				model: myProvider.imageModel("edit-img-model"),
				prompt: enhancedPrompt,
				n: 1,
				size: "1024x1024",
				providerOptions: {
					fal: {
						image_url: baseImage,
						guidance_scale: 10,
						num_inference_steps: 50,
						sync_mode: true,
						// Adjust strength based on whether we have a new input image
						// Higher strength for new images, lower for modifications
						strength: newInputImage ? 0.8 : 0.6
					}
				}
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
