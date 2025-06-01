import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { fal } from "@ai-sdk/fal"
import {
	customProvider,
	extractReasoningMiddleware,
	wrapLanguageModel
} from "ai"
import { isTestEnvironment } from "../constants"
import { MODEL_IDS, IMAGE_MODEL_IDS } from "./models"
import {
	artifactModel,
	chatModel,
	reasoningModel,
	titleModel
} from "./models.test"

// Image model mapping - maps our IDs to actual FAL model names
const imageModelMapping = {
	// Text-to-Image Models
	[IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I]: "fal-ai/flux-pro/kontext/text-to-image",
	[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I]:
		"fal-ai/flux-pro/kontext/max/text-to-image",
	[IMAGE_MODEL_IDS.IMAGEN4_PREVIEW]: "fal-ai/imagen4/preview",
	[IMAGE_MODEL_IDS.RECRAFT_V3_T2I]: "fal-ai/recraft/v3/text-to-image",
	[IMAGE_MODEL_IDS.FLUX_PRO_ULTRA]: "fal-ai/flux-pro/v1.1-ultra",
	[IMAGE_MODEL_IDS.FLUX_PRO_V11]: "fal-ai/flux-pro/v1.1",
	[IMAGE_MODEL_IDS.IDEOGRAM_V3]: "fal-ai/ideogram/v3",

	// Image-to-Image Models
	[IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I]: "fal-ai/flux-pro/kontext",
	[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I]: "fal-ai/flux-pro/kontext/max",
	[IMAGE_MODEL_IDS.RECRAFT_V3_I2I]: "fal-ai/recraft/v3/image-to-image",
	[IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX]: "fal-ai/ideogram/v3/remix",

	// Multi-Image Models
	[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_MULTI]:
		"fal-ai/flux-pro/kontext/max/multi",

	// Legacy backend models
	[IMAGE_MODEL_IDS.FLUX_PRO_FIRST_TIME]: "fal-ai/flux-pro/kontext",
	[IMAGE_MODEL_IDS.FLUX_PRO_TEXT_TO_IMAGE]:
		"fal-ai/flux-pro/kontext/text-to-image",
	[IMAGE_MODEL_IDS.FLUX_PRO_IMAGE_TO_IMAGE]: "fal-ai/flux-pro/kontext",
	[IMAGE_MODEL_IDS.FLUX_SCHNELL]: "fal-ai/flux/schnell",
	[IMAGE_MODEL_IDS.FLUX_DEV]: "fal-ai/flux/dev"
} as const

export const myProvider = isTestEnvironment
	? customProvider({
			languageModels: {
				[MODEL_IDS.CLAUDE_SONNET_4]: chatModel,
				[MODEL_IDS.CLAUDE_OPUS_4]: chatModel,
				[MODEL_IDS.CLAUDE_SONNET_4_REASONING]: reasoningModel,
				[MODEL_IDS.GPT_4_1]: chatModel,
				[MODEL_IDS.O4_MINI]: chatModel,
				[MODEL_IDS.GEMINI_2_5_PRO]: chatModel,
				[MODEL_IDS.GEMINI_2_5_FLASH]: chatModel,
				// Backward compatibility
				"chat-model-reasoning": reasoningModel,
				"title-model": titleModel,
				"artifact-model": artifactModel
			},
			imageModels: {
				// Text-to-Image Models
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I]
				),
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I]
				),
				[IMAGE_MODEL_IDS.IMAGEN4_PREVIEW]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.IMAGEN4_PREVIEW]
				),
				[IMAGE_MODEL_IDS.RECRAFT_V3_T2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.RECRAFT_V3_T2I]
				),
				[IMAGE_MODEL_IDS.FLUX_PRO_ULTRA]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_ULTRA]
				),
				[IMAGE_MODEL_IDS.FLUX_PRO_V11]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_V11]
				),
				[IMAGE_MODEL_IDS.IDEOGRAM_V3]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.IDEOGRAM_V3]
				),

				// Image-to-Image Models
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I]
				),
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I]
				),
				[IMAGE_MODEL_IDS.RECRAFT_V3_I2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.RECRAFT_V3_I2I]
				),

				[IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX]
				),

				// Multi-Image Models
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_MULTI]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_MULTI]
				),

				// Legacy backend models
				[IMAGE_MODEL_IDS.FLUX_PRO_FIRST_TIME]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_FIRST_TIME]
				),
				[IMAGE_MODEL_IDS.FLUX_PRO_TEXT_TO_IMAGE]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_TEXT_TO_IMAGE]
				),
				[IMAGE_MODEL_IDS.FLUX_PRO_IMAGE_TO_IMAGE]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_IMAGE_TO_IMAGE]
				),
				[IMAGE_MODEL_IDS.FLUX_SCHNELL]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_SCHNELL]
				),
				[IMAGE_MODEL_IDS.FLUX_DEV]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_DEV]
				),

				// Backward compatibility - keep old hardcoded names for now
				"first-img-model": fal.image(
					"fal-ai/flux-pro/kontext/text-to-image"
				),
				"edit-img-model": fal.image("fal-ai/flux-pro/kontext")
			}
		})
	: customProvider({
			languageModels: {
				// Anthropic models
				[MODEL_IDS.CLAUDE_SONNET_4]: anthropic(
					"claude-4-sonnet-20250514"
				),
				[MODEL_IDS.CLAUDE_OPUS_4]: anthropic("claude-4-opus-20250514"),
				[MODEL_IDS.CLAUDE_SONNET_4_REASONING]: wrapLanguageModel({
					model: anthropic("claude-4-sonnet-20250514"),
					middleware: extractReasoningMiddleware({
						tagName: "antml:thinking"
					})
				}),

				// OpenAI models
				[MODEL_IDS.GPT_4_1]: openai("gpt-4.1"),
				[MODEL_IDS.O4_MINI]: openai("o4-mini"),

				// Google models
				[MODEL_IDS.GEMINI_2_5_PRO]: google("gemini-2.5-pro-preview"),
				[MODEL_IDS.GEMINI_2_5_FLASH]: google(
					"gemini-2.5-flash-preview"
				),

				// Backward compatibility - legacy reasoning model
				"chat-model-reasoning": wrapLanguageModel({
					model: anthropic("claude-4-sonnet-20250514"),
					middleware: extractReasoningMiddleware({
						tagName: "antml:thinking"
					})
				}),

				// Utility models
				"title-model": anthropic("claude-3-haiku-20240307"),
				"artifact-model": anthropic("claude-4-sonnet-20250514")
			},
			imageModels: {
				// Text-to-Image Models
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_T2I]
				),
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_T2I]
				),
				[IMAGE_MODEL_IDS.IMAGEN4_PREVIEW]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.IMAGEN4_PREVIEW]
				),
				[IMAGE_MODEL_IDS.RECRAFT_V3_T2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.RECRAFT_V3_T2I]
				),
				[IMAGE_MODEL_IDS.FLUX_PRO_ULTRA]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_ULTRA]
				),
				[IMAGE_MODEL_IDS.FLUX_PRO_V11]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_V11]
				),
				[IMAGE_MODEL_IDS.IDEOGRAM_V3]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.IDEOGRAM_V3]
				),

				// Image-to-Image Models
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_I2I]
				),
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_I2I]
				),
				[IMAGE_MODEL_IDS.RECRAFT_V3_I2I]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.RECRAFT_V3_I2I]
				),

				[IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.IDEOGRAM_V3_REMIX]
				),

				// Multi-Image Models
				[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_MULTI]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_KONTEXT_MAX_MULTI]
				),

				// Legacy backend models
				[IMAGE_MODEL_IDS.FLUX_PRO_FIRST_TIME]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_FIRST_TIME]
				),
				[IMAGE_MODEL_IDS.FLUX_PRO_TEXT_TO_IMAGE]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_TEXT_TO_IMAGE]
				),
				[IMAGE_MODEL_IDS.FLUX_PRO_IMAGE_TO_IMAGE]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_PRO_IMAGE_TO_IMAGE]
				),
				[IMAGE_MODEL_IDS.FLUX_SCHNELL]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_SCHNELL]
				),
				[IMAGE_MODEL_IDS.FLUX_DEV]: fal.image(
					imageModelMapping[IMAGE_MODEL_IDS.FLUX_DEV]
				),

				// Backward compatibility - keep old hardcoded names for now
				"first-img-model": fal.image(
					"fal-ai/flux-pro/kontext/text-to-image"
				),
				"edit-img-model": fal.image("fal-ai/flux-pro/kontext")
			}
		})
