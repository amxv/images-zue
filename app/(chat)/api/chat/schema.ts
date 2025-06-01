import { z } from "zod"
import { ALL_MODEL_IDS, USER_SELECTABLE_IMAGE_MODEL_IDS } from "@/lib/ai/models"

const textPartSchema = z.object({
	text: z.string().min(1).max(2000),
	type: z.enum(["text"])
})

export const postRequestBodySchema = z.object({
	id: z.string().uuid(),
	message: z.object({
		id: z.string().uuid(),
		createdAt: z.coerce.date(),
		role: z.enum(["user"]),
		content: z.string().min(1).max(2000),
		parts: z.array(textPartSchema),
		experimental_attachments: z
			.array(
				z.object({
					url: z.string().url(),
					name: z.string().min(1).max(2000),
					contentType: z.enum([
						"image/png",
						"image/jpg",
						"image/jpeg"
					])
				})
			)
			.optional()
	}),
	selectedChatModel: z.enum(ALL_MODEL_IDS as [string, ...string[]]),
	selectedImageModel: z.enum(
		USER_SELECTABLE_IMAGE_MODEL_IDS as [string, ...string[]]
	),
	selectedVisibilityType: z.enum(["public", "private"]),
	selectedAspectRatio: z
		.enum(["1:1", "16:9", "9:16", "4:3", "3:4"])
		.optional()
		.default("1:1"),
	selectedGuidanceScale: z.number().min(1).max(20).optional().default(10)
})

export type PostRequestBody = z.infer<typeof postRequestBodySchema>
