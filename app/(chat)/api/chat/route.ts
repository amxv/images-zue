import { type UserType, auth } from "@/app/(auth)/auth"
import { entitlementsByUserType } from "@/lib/ai/entitlements"
import { getAvailableImageModelsForUser } from "@/lib/ai/entitlements"
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts"
import { myProvider } from "@/lib/ai/providers"
import { createDocument } from "@/lib/ai/tools/create-document"
import { getWeather } from "@/lib/ai/tools/get-weather"
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions"
import { updateDocument } from "@/lib/ai/tools/update-document"
import { isProductionEnvironment } from "@/lib/constants"
import {
	createStreamId,
	deleteChatById,
	getChatById,
	getMessageCountByUserId,
	getMessagesByChatId,
	getStreamIdsByChatId,
	saveChat,
	saveMessages
} from "@/lib/db/queries"
import type { Chat } from "@/lib/db/schema"
import { ChatSDKError } from "@/lib/errors"
import { generateUUID, getTrailingMessageId } from "@/lib/utils"
import { geolocation } from "@vercel/functions"
import {
	appendClientMessage,
	appendResponseMessages,
	createDataStream,
	smoothStream,
	streamText,
	type UIMessage
} from "ai"
import { differenceInSeconds } from "date-fns"
import { after } from "next/server"
import {
	type ResumableStreamContext,
	createResumableStreamContext
} from "resumable-stream"
import { generateTitleFromUserMessage } from "../../actions"
import { type PostRequestBody, postRequestBodySchema } from "./schema"
import type { ImageModelId } from "@/lib/ai/models"

export const maxDuration = 60

let globalStreamContext: ResumableStreamContext | null = null

function getStreamContext(): ResumableStreamContext | null {
	// Temporarily disable resumable streams to avoid Redis compatibility issues
	console.log(" > Resumable streams are disabled")
	return null
}

export async function POST(request: Request) {
	let requestBody: PostRequestBody

	try {
		const json = await request.json()
		requestBody = postRequestBodySchema.parse(json)
	} catch (_) {
		return new ChatSDKError("bad_request:api").toResponse()
	}

	try {
		const {
			id,
			message,
			selectedChatModel,
			selectedImageModel,
			selectedVisibilityType,
			selectedAspectRatio,
			selectedGuidanceScale
		} = requestBody

		const session = await auth()

		if (!session?.user) {
			return new ChatSDKError("unauthorized:chat").toResponse()
		}

		const userType: UserType = session.user.type

		const messageCount = await getMessageCountByUserId({
			id: session.user.id,
			differenceInHours: 24
		})

		if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
			return new ChatSDKError("rate_limit:chat").toResponse()
		}

		// Validate that the user has access to the selected image model
		const availableImageModels = getAvailableImageModelsForUser(session)
		if (
			!availableImageModels.includes(selectedImageModel as ImageModelId)
		) {
			return new ChatSDKError("forbidden:chat").toResponse()
		}

		const chat = await getChatById({ id })

		if (!chat) {
			const title = await generateTitleFromUserMessage({
				message
			})

			await saveChat({
				id,
				userId: session.user.id,
				title,
				visibility: selectedVisibilityType
			})
		} else {
			if (chat.userId !== session.user.id) {
				return new ChatSDKError("forbidden:chat").toResponse()
			}
		}

		const previousMessages = await getMessagesByChatId({ id })

		const messages = appendClientMessage({
			// @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
			messages: previousMessages,
			message
		})

		const { longitude, latitude, city, country } = geolocation(request)

		const requestHints: RequestHints = {
			longitude,
			latitude,
			city,
			country
		}

		await saveMessages({
			messages: [
				{
					chatId: id,
					id: message.id,
					role: "user",
					parts: message.parts,
					attachments: message.experimental_attachments ?? [],
					createdAt: new Date()
				}
			]
		})

		const streamId = generateUUID()
		await createStreamId({ streamId, chatId: id })

		const stream = createDataStream({
			execute: (dataStream) => {
				const result = streamText({
					model: myProvider.languageModel(selectedChatModel),
					system: systemPrompt({ selectedChatModel, requestHints }),
					messages,
					maxSteps: 5,
					experimental_activeTools: [
						"getWeather",
						"createDocument",
						"updateDocument",
						"requestSuggestions"
					],
					experimental_transform: smoothStream({ chunking: "word" }),
					experimental_generateMessageId: generateUUID,
					tools: {
						getWeather,
						createDocument: createDocument({
							session,
							dataStream,
							messages: messages as UIMessage[],
							selectedImageModel,
							selectedAspectRatio,
							selectedGuidanceScale
						}),
						updateDocument: updateDocument({
							session,
							dataStream,
							messages: messages as UIMessage[],
							selectedImageModel,
							selectedAspectRatio,
							selectedGuidanceScale
						}),
						requestSuggestions: requestSuggestions({
							session,
							dataStream
						})
					},
					onFinish: async ({ response }) => {
						if (session.user?.id) {
							try {
								const assistantId = getTrailingMessageId({
									messages: response.messages.filter(
										(message) =>
											message.role === "assistant"
									)
								})

								if (!assistantId) {
									throw new Error(
										"No assistant message found!"
									)
								}

								const [, assistantMessage] =
									appendResponseMessages({
										messages: [message],
										responseMessages: response.messages
									})

								await saveMessages({
									messages: [
										{
											id: assistantId,
											chatId: id,
											role: assistantMessage.role,
											parts: assistantMessage.parts,
											attachments:
												assistantMessage.experimental_attachments ??
												[],
											createdAt: new Date()
										}
									]
								})
							} catch (_) {
								console.error("Failed to save chat")
							}
						}
					},
					experimental_telemetry: {
						isEnabled: isProductionEnvironment,
						functionId: "stream-text"
					}
				})

				result.consumeStream()

				result.mergeIntoDataStream(dataStream, {
					sendReasoning: true
				})
			},
			onError: () => {
				return "Oops, an error occurred!"
			}
		})

		const streamContext = getStreamContext()

		if (streamContext) {
			const resumableStream = await streamContext.resumableStream(
				streamId,
				() => stream
			)
			if (resumableStream) {
				return new Response(resumableStream)
			}
		}
		return new Response(stream)
	} catch (error) {
		if (error instanceof ChatSDKError) {
			return error.toResponse()
		}

		console.error("Unexpected error in chat route:", error)
		return new ChatSDKError("bad_request:api").toResponse()
	}
}

export async function GET(request: Request) {
	const streamContext = getStreamContext()

	// Since resumable streams are disabled, always return 204 No Content
	if (!streamContext) {
		return new Response(null, { status: 204 })
	}

	// This code is unreachable but kept for when resumable streams are re-enabled
	return new Response(null, { status: 204 })
}

export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url)
	const id = searchParams.get("id")

	if (!id) {
		return new ChatSDKError("bad_request:api").toResponse()
	}

	const session = await auth()

	if (!session?.user) {
		return new ChatSDKError("unauthorized:chat").toResponse()
	}

	const chat = await getChatById({ id })

	if (chat.userId !== session.user.id) {
		return new ChatSDKError("forbidden:chat").toResponse()
	}

	const deletedChat = await deleteChatById({ id })

	return Response.json(deletedChat, { status: 200 })
}
