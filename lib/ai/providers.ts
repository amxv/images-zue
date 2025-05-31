import { anthropic } from "@ai-sdk/anthropic"
import { fal } from "@ai-sdk/fal"
import {
	customProvider,
	extractReasoningMiddleware,
	wrapLanguageModel
} from "ai"
import { isTestEnvironment } from "../constants"
import {
	artifactModel,
	chatModel,
	reasoningModel,
	titleModel
} from "./models.test"

export const myProvider = isTestEnvironment
	? customProvider({
			languageModels: {
				"chat-model": chatModel,
				"chat-model-reasoning": reasoningModel,
				"title-model": titleModel,
				"artifact-model": artifactModel
			},
			imageModels: {
				"first-img-model": fal.image(
					"fal-ai/flux-pro/kontext/text-to-image"
				),
				"edit-img-model": fal.image("fal-ai/flux-pro/kontext")
			}
		})
	: customProvider({
			languageModels: {
				"chat-model": anthropic("claude-4-sonnet-20250514"),
				"chat-model-reasoning": wrapLanguageModel({
					model: anthropic("claude-sonnet-4-20250514"),
					middleware: extractReasoningMiddleware({
						tagName: "antml:thinking"
					})
				}),
				"title-model": anthropic("claude-3-haiku-20240307"),
				"artifact-model": anthropic("claude-4-sonnet-20250514")
			},
			imageModels: {
				"first-img-model": fal.image(
					"fal-ai/flux-pro/kontext/text-to-image"
				),
				"edit-img-model": fal.image("fal-ai/flux-pro/kontext")
			}
		})
