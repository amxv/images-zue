// Centralized model IDs - define once, use everywhere
export const MODEL_IDS = {
	CLAUDE_SONNET_4: "claude-sonnet-4",
	CLAUDE_OPUS_4: "claude-opus-4",
	CLAUDE_SONNET_4_REASONING: "claude-sonnet-4-reasoning",
	GPT_4_1: "gpt-4.1",
	O4_MINI: "o4-mini",
	GEMINI_2_5_PRO: "gemini-2.5-pro",
	GEMINI_2_5_FLASH: "gemini-2.5-flash"
} as const

// Image model IDs
export const IMAGE_MODEL_IDS = {
	// Text-to-Image Models
	FLUX_KONTEXT_T2I: "flux-kontext-t2i",
	FLUX_KONTEXT_MAX_T2I: "flux-kontext-max-t2i",
	IMAGEN4_PREVIEW: "imagen4-preview",
	RECRAFT_V3_T2I: "recraft-v3-t2i",
	FLUX_PRO_ULTRA: "flux-pro-ultra",
	FLUX_PRO_V11: "flux-pro-v11",
	IDEOGRAM_V3: "ideogram-v3",

	// Image-to-Image Models
	// Note: When users have existing image artifacts in the conversation,
	// the system automatically maps T2I models to their I2I counterparts
	// to enable editing of existing images without requiring explicit model switching
	FLUX_KONTEXT_I2I: "flux-kontext-i2i",
	FLUX_KONTEXT_MAX_I2I: "flux-kontext-max-i2i",
	RECRAFT_V3_I2I: "recraft-v3-i2i",
	IDEOGRAM_V3_REMIX: "ideogram-v3-remix",

	// Backend models - these are used internally for automatic selection (legacy)
	FLUX_PRO_FIRST_TIME: "flux-pro-first-time",
	FLUX_PRO_TEXT_TO_IMAGE: "flux-pro-text-to-image",
	FLUX_PRO_IMAGE_TO_IMAGE: "flux-pro-image-to-image",
	FLUX_SCHNELL: "flux-schnell",
	FLUX_DEV: "flux-dev"
} as const

export type ModelId = (typeof MODEL_IDS)[keyof typeof MODEL_IDS]
export type ImageModelId =
	(typeof IMAGE_MODEL_IDS)[keyof typeof IMAGE_MODEL_IDS]

// Universal aspect ratio format used in UI
export type UniversalAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4"

// Model-specific aspect ratio formats
export type FluxAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4"
export type RecraftIdeogramAspectRatio =
	| "square_hd"
	| "square"
	| "portrait_4_3"
	| "portrait_16_9"
	| "landscape_4_3"
	| "landscape_16_9"

export interface AspectRatioConfig {
	parameterName: string // The parameter name used by the model API
	supportedRatios: UniversalAspectRatio[]
	defaultRatio: UniversalAspectRatio
	formatType: "flux" | "recraft-ideogram"
}

export interface ChatModel {
	id: ModelId
	name: string
	description: string
	provider: "anthropic" | "openai" | "google"
}

export interface ImageModel {
	id: ImageModelId
	name: string
	description: string
	provider: "fal"
	capabilities: {
		textToImage: boolean
		imageToImage: boolean
	}
	parameters: {
		maxSize: string
		guidanceScale: number
		inferenceSteps: number
	}
	aspectRatio?: AspectRatioConfig // Optional - only for T2I models
}

export const chatModels: Array<ChatModel> = [
	{
		id: MODEL_IDS.CLAUDE_SONNET_4,
		name: "Claude Sonnet 4",
		description:
			"Anthropic's latest balanced model with superior coding and reasoning",
		provider: "anthropic"
	},
	{
		id: MODEL_IDS.CLAUDE_SONNET_4_REASONING,
		name: "Claude Sonnet 4 (Reasoning)",
		description:
			"Claude Sonnet 4 with enhanced step-by-step reasoning capabilities",
		provider: "anthropic"
	},
	{
		id: MODEL_IDS.CLAUDE_OPUS_4,
		name: "Claude Opus 4",
		description:
			"Anthropic's most powerful model for complex tasks and long-form reasoning",
		provider: "anthropic"
	},
	{
		id: MODEL_IDS.GPT_4_1,
		name: "GPT-4.1",
		description:
			"OpenAI's latest flagship model with enhanced capabilities",
		provider: "openai"
	},
	{
		id: MODEL_IDS.O4_MINI,
		name: "o4-mini",
		description: "OpenAI's efficient reasoning model for everyday tasks",
		provider: "openai"
	},
	{
		id: MODEL_IDS.GEMINI_2_5_PRO,
		name: "Gemini 2.5 Pro",
		description:
			"Google's advanced multimodal model with extensive context",
		provider: "google"
	},
	{
		id: MODEL_IDS.GEMINI_2_5_FLASH,
		name: "Gemini 2.5 Flash",
		description: "Google's fast and efficient model for quick responses",
		provider: "google"
	}
]

export const imageModels: Array<ImageModel> = [
	// Text-to-Image Models
	{
		id: IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I,
		name: "FLUX Kontext",
		description:
			"High-quality text-to-image generation with excellent prompt adherence",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: false
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 10,
			inferenceSteps: 50
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I,
		name: "FLUX Kontext Max",
		description:
			"Premium FLUX model with improved prompt adherence and typography",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: false
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 10,
			inferenceSteps: 50
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.IMAGEN4_PREVIEW,
		name: "Imagen 4",
		description:
			"Google's latest image generation model with photorealistic results",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: false
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 8,
			inferenceSteps: 40
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.RECRAFT_V3_T2I,
		name: "Recraft V3",
		description: "SOTA model for vector art and brand style generation",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: false
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 7,
			inferenceSteps: 35
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "recraft-ideogram"
		}
	},
	{
		id: IMAGE_MODEL_IDS.FLUX_PRO_ULTRA,
		name: "FLUX Pro Ultra",
		description:
			"Professional-grade image generation with up to 2K resolution",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: false
		},
		parameters: {
			maxSize: "2048x2048",
			guidanceScale: 12,
			inferenceSteps: 60
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.FLUX_PRO_V11,
		name: "FLUX Pro v1.1",
		description: "Enhanced FLUX Pro model with improved quality and speed",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: false
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 10,
			inferenceSteps: 50
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.IDEOGRAM_V3,
		name: "Ideogram V3",
		description:
			"Specialized for high-quality posters and logos with exceptional typography",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: false
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 9,
			inferenceSteps: 45
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "recraft-ideogram"
		}
	},

	// Image-to-Image Models
	{
		id: IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I,
		name: "FLUX Kontext",
		description: "Advanced image transformation and editing capabilities",
		provider: "fal",
		capabilities: {
			textToImage: false,
			imageToImage: true
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 10,
			inferenceSteps: 50
		}
	},
	{
		id: IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I,
		name: "FLUX Kontext Max",
		description:
			"Premium image editing with enhanced consistency and quality",
		provider: "fal",
		capabilities: {
			textToImage: false,
			imageToImage: true
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 10,
			inferenceSteps: 50
		}
	},
	{
		id: IMAGE_MODEL_IDS.RECRAFT_V3_I2I,
		name: "Recraft V3",
		description: "Vector art and brand style image editing",
		provider: "fal",
		capabilities: {
			textToImage: false,
			imageToImage: true
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 7,
			inferenceSteps: 35
		}
	},
	{
		id: IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX,
		name: "Ideogram V3 Remix",
		description: "Creative image remixing and style transfer",
		provider: "fal",
		capabilities: {
			textToImage: false,
			imageToImage: true
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 9,
			inferenceSteps: 45
		}
	},

	// Backend models - not shown to users but used internally (legacy)
	{
		id: IMAGE_MODEL_IDS.FLUX_PRO_FIRST_TIME,
		name: "FLUX Kontext (First-Time)",
		description: "Special model for first image generation in conversation",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: true
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 10,
			inferenceSteps: 50
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.FLUX_PRO_TEXT_TO_IMAGE,
		name: "FLUX Kontext (Text-to-Image)",
		description: "High-quality text-to-image generation",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: false
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 10,
			inferenceSteps: 50
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.FLUX_PRO_IMAGE_TO_IMAGE,
		name: "FLUX Kontext (Image-to-Image)",
		description: "Advanced image transformation capabilities",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: true
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 10,
			inferenceSteps: 50
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.FLUX_SCHNELL,
		name: "FLUX Schnell",
		description: "Fast image generation with good quality",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: true
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 7,
			inferenceSteps: 25
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	},
	{
		id: IMAGE_MODEL_IDS.FLUX_DEV,
		name: "FLUX Dev",
		description: "Development model with balanced speed and quality",
		provider: "fal",
		capabilities: {
			textToImage: true,
			imageToImage: true
		},
		parameters: {
			maxSize: "1024x1024",
			guidanceScale: 8,
			inferenceSteps: 35
		},
		aspectRatio: {
			parameterName: "aspect_ratio",
			supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
			defaultRatio: "1:1",
			formatType: "flux"
		}
	}
]

// All available model IDs as arrays for easy use in schemas
export const ALL_MODEL_IDS = Object.values(MODEL_IDS)
export const ALL_IMAGE_MODEL_IDS = Object.values(IMAGE_MODEL_IDS)

// User-selectable image models (exclude legacy backend models)
export const USER_SELECTABLE_IMAGE_MODEL_IDS = [
	// Text-to-Image Models
	IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I,
	IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I,
	IMAGE_MODEL_IDS.IMAGEN4_PREVIEW,
	IMAGE_MODEL_IDS.RECRAFT_V3_T2I,
	IMAGE_MODEL_IDS.FLUX_PRO_ULTRA,
	IMAGE_MODEL_IDS.FLUX_PRO_V11,
	IMAGE_MODEL_IDS.IDEOGRAM_V3,
	// Image-to-Image Models
	IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I,
	IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I,
	IMAGE_MODEL_IDS.RECRAFT_V3_I2I,
	IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX
]

export const DEFAULT_CHAT_MODEL: string = MODEL_IDS.CLAUDE_SONNET_4
export const DEFAULT_IMAGE_MODEL: string = IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I

// Aspect ratio conversion utilities
export const convertUniversalToModelAspectRatio = (
	universalRatio: UniversalAspectRatio,
	formatType: "flux" | "recraft-ideogram"
): string => {
	if (formatType === "flux") {
		// FLUX models use the same format as universal
		return universalRatio
	}

	// Recraft and Ideogram models use different format
	const recraftIdeogramMapping: Record<
		UniversalAspectRatio,
		RecraftIdeogramAspectRatio
	> = {
		"1:1": "square_hd",
		"4:3": "landscape_4_3",
		"3:4": "portrait_4_3",
		"16:9": "landscape_16_9",
		"9:16": "portrait_16_9"
	}

	return recraftIdeogramMapping[universalRatio] || "square_hd"
}

export const getAspectRatioParameterForModel = (
	modelId: ImageModelId,
	universalRatio: UniversalAspectRatio
): { parameterName: string; value: string } | null => {
	const model = imageModels.find((m) => m.id === modelId)
	if (!model || !model.aspectRatio) {
		// I2I models don't have aspect ratio parameters
		return null
	}

	const { aspectRatio } = model
	const convertedValue = convertUniversalToModelAspectRatio(
		universalRatio,
		aspectRatio.formatType
	)

	return {
		parameterName: aspectRatio.parameterName,
		value: convertedValue
	}
}
