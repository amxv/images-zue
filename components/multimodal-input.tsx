"use client"

import type { Attachment, UIMessage } from "ai"
import cx from "classnames"
import type React from "react"
import {
	type ChangeEvent,
	type Dispatch,
	type SetStateAction,
	memo,
	useCallback,
	useEffect,
	useRef,
	useState
} from "react"
import { toast } from "sonner"
import { useLocalStorage, useWindowSize } from "usehooks-ts"

import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"
import type { UseChatHelpers } from "@ai-sdk/react"
import equal from "fast-deep-equal"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons"
import { PreviewAttachment } from "./preview-attachment"
import { SuggestedActions } from "./suggested-actions"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import type { VisibilityType } from "./visibility-selector"

function PureMultimodalInput({
	chatId,
	input,
	setInput,
	status,
	stop,
	attachments,
	setAttachments,
	messages,
	setMessages,
	append,
	handleSubmit,
	className,
	selectedVisibilityType,
	onClearAttachments,
	isArtifactVisible
}: {
	chatId: string
	input: UseChatHelpers["input"]
	setInput: UseChatHelpers["setInput"]
	status: UseChatHelpers["status"]
	stop: () => void
	attachments: Array<Attachment>
	setAttachments: Dispatch<SetStateAction<Array<Attachment>>>
	messages: Array<UIMessage>
	setMessages: UseChatHelpers["setMessages"]
	append: UseChatHelpers["append"]
	handleSubmit: UseChatHelpers["handleSubmit"]
	className?: string
	selectedVisibilityType: VisibilityType
	onClearAttachments?: () => void
	isArtifactVisible?: boolean
}) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const { width } = useWindowSize()

	// Drag and drop state
	const [isDragOver, setIsDragOver] = useState(false)
	const [dragCounter, setDragCounter] = useState(0)

	const adjustHeight = useCallback(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`
		}
	}, [])

	const resetHeight = useCallback(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
			textareaRef.current.style.height = "98px"
		}
	}, [])

	useEffect(() => {
		if (textareaRef.current) {
			adjustHeight()
		}
	}, [adjustHeight])

	const [localStorageInput, setLocalStorageInput] = useLocalStorage(
		"input",
		""
	)

	useEffect(() => {
		if (textareaRef.current) {
			const domValue = textareaRef.current.value
			// Prefer DOM value over localStorage to handle hydration
			const finalValue = domValue || localStorageInput || ""
			setInput(finalValue)
			adjustHeight()
		}
		// Only run once after hydration
	}, [adjustHeight, localStorageInput, setInput])

	useEffect(() => {
		setLocalStorageInput(input)
	}, [input, setLocalStorageInput])

	const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value)
		adjustHeight()
	}

	const fileInputRef = useRef<HTMLInputElement>(null)
	const [uploadQueue, setUploadQueue] = useState<Array<string>>([])

	const submitForm = useCallback(() => {
		window.history.replaceState({}, "", `/chat/${chatId}`)

		handleSubmit(undefined, {
			experimental_attachments: attachments
		})

		// Clear attachments using the provided callback or fallback to setAttachments
		if (onClearAttachments) {
			onClearAttachments()
		} else {
			setAttachments([])
		}

		// Clear input and localStorage first
		setInput("")
		setLocalStorageInput("")

		// Reset height after clearing input to ensure proper sizing
		setTimeout(() => {
			resetHeight()
		}, 0)

		if (width && width > 768) {
			textareaRef.current?.focus()
		}
	}, [
		attachments,
		handleSubmit,
		onClearAttachments,
		setAttachments,
		setInput,
		setLocalStorageInput,
		width,
		chatId,
		resetHeight
	])

	const uploadFile = useCallback(async (file: File) => {
		const formData = new FormData()
		formData.append("file", file)

		try {
			console.log(
				`Uploading file: ${file.name}, type: ${file.type}, size: ${file.size}`
			)

			const response = await fetch("/api/files/upload", {
				method: "POST",
				body: formData
			})

			if (response.ok) {
				const data = await response.json()
				const { url, pathname, contentType } = data

				console.log(`Upload successful: ${url}`)
				return {
					url,
					name: pathname,
					contentType: contentType
				}
			}

			// Handle non-200 responses
			const errorData = await response
				.json()
				.catch(() => ({ error: "Unknown error" }))
			const errorMessage =
				errorData.error ||
				`Upload failed with status ${response.status}`
			console.error(`Upload failed: ${errorMessage}`, errorData)
			toast.error(errorMessage)
			return null
		} catch (error) {
			console.error("Upload error:", error)
			toast.error("Failed to upload file, please try again!")
			return null
		}
	}, [])

	const processFiles = useCallback(
		async (files: File[]) => {
			// Filter for image files only
			const imageFiles = files.filter((file) =>
				[
					"image/jpeg",
					"image/jpg",
					"image/png",
					"image/gif",
					"image/webp",
					"image/bmp"
				].includes(file.type)
			)

			if (imageFiles.length === 0) {
				toast.error(
					"Please upload only image files (JPEG, PNG, GIF, WebP, BMP)"
				)
				return
			}

			if (imageFiles.length !== files.length) {
				toast.error(
					"Some files were skipped. Only image files are supported."
				)
			}

			setUploadQueue(imageFiles.map((file) => file.name))

			try {
				const uploadPromises = imageFiles.map((file) =>
					uploadFile(file)
				)
				const uploadedAttachments = await Promise.all(uploadPromises)
				const successfullyUploadedAttachments =
					uploadedAttachments.filter(
						(
							attachment
						): attachment is NonNullable<typeof attachment> =>
							attachment !== null && attachment !== undefined
					)

				setAttachments((currentAttachments) => [
					...currentAttachments,
					...successfullyUploadedAttachments
				])
			} catch (error) {
				console.error("Error uploading files!", error)
			} finally {
				setUploadQueue([])
			}
		},
		[setAttachments, uploadFile]
	)

	const handleFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files || [])
			await processFiles(files)
		},
		[processFiles]
	)

	// Drag and drop handlers
	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragCounter((prev) => prev + 1)
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setIsDragOver(true)
		}
	}, [])

	const handleDragLeave = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setDragCounter((prev) => prev - 1)
			if (dragCounter <= 1) {
				setIsDragOver(false)
			}
		},
		[dragCounter]
	)

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}, [])

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragOver(false)
			setDragCounter(0)

			if (status !== "ready") {
				toast.error("Please wait for the model to finish its response!")
				return
			}

			const files = Array.from(e.dataTransfer.files)
			if (files.length > 0) {
				await processFiles(files)
			}
		},
		[status, processFiles]
	)

	// Paste handler for images
	const handlePaste = useCallback(
		async (e: React.ClipboardEvent) => {
			if (status !== "ready") {
				toast.error("Please wait for the model to finish its response!")
				return
			}

			const clipboardItems = e.clipboardData?.items
			if (!clipboardItems) return

			const files: File[] = []

			// Convert clipboard items to files
			for (let i = 0; i < clipboardItems.length; i++) {
				const item = clipboardItems[i]

				// Check if the item is an image
				if (item.type.startsWith("image/")) {
					const file = item.getAsFile()
					if (file) {
						files.push(file)
					}
				}
			}

			if (files.length > 0) {
				// Prevent the default paste behavior for images
				e.preventDefault()
				await processFiles(files)
			}
		},
		[status, processFiles]
	)

	const { isAtBottom, scrollToBottom } = useScrollToBottom()

	useEffect(() => {
		if (status === "submitted") {
			scrollToBottom()
		}
	}, [status, scrollToBottom])

	return (
		<div
			className="relative w-full flex flex-col gap-4"
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{/* Drag overlay */}
			{isDragOver && (
				<div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-2xl flex items-center justify-center">
					<div className="text-center">
						<div className="text-lg font-medium text-primary mb-2">
							Drop images here
						</div>
						<div className="text-sm text-muted-foreground">
							Supports JPEG, PNG, GIF, WebP, BMP
						</div>
					</div>
				</div>
			)}

			<AnimatePresence>
				{/* Show scroll to bottom button only when user is not at bottom AND artifact is not visible */}
				{!isAtBottom && !isArtifactVisible && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 20
						}}
						className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
					>
						<Button
							data-testid="scroll-to-bottom-button"
							className="rounded-full"
							size="icon"
							variant="outline"
							onClick={(event) => {
								event.preventDefault()
								scrollToBottom()
							}}
						>
							<ArrowDown />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>

			{messages.length === 0 &&
				attachments.length === 0 &&
				uploadQueue.length === 0 && (
					<SuggestedActions
						setInput={setInput}
						chatId={chatId}
						selectedVisibilityType={selectedVisibilityType}
					/>
				)}

			<input
				type="file"
				className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
				ref={fileInputRef}
				multiple
				onChange={handleFileChange}
				tabIndex={-1}
				accept="image/*"
			/>

			{(attachments.length > 0 || uploadQueue.length > 0) && (
				<div
					data-testid="attachments-preview"
					className="flex flex-row gap-2 overflow-x-scroll items-end"
				>
					{attachments.map((attachment) => (
						<PreviewAttachment
							key={attachment.url}
							attachment={attachment}
						/>
					))}

					{uploadQueue.map((filename) => (
						<PreviewAttachment
							key={filename}
							attachment={{
								url: "",
								name: filename,
								contentType: ""
							}}
							isUploading={true}
						/>
					))}
				</div>
			)}

			<Textarea
				data-testid="multimodal-input"
				ref={textareaRef}
				value={input}
				onChange={handleInput}
				className={cx(
					"min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl text-base! bg-muted pb-10 dark:border-zinc-700",
					className,
					{
						"border-primary border-2": isDragOver
					}
				)}
				rows={2}
				autoFocus
				onKeyDown={(event) => {
					if (
						event.key === "Enter" &&
						!event.shiftKey &&
						!event.nativeEvent.isComposing
					) {
						event.preventDefault()

						if (status !== "ready") {
							toast.error(
								"Please wait for the model to finish its response!"
							)
						} else {
							submitForm()
						}
					}
				}}
				onPaste={handlePaste}
			/>

			<div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start">
				<AttachmentsButton
					fileInputRef={fileInputRef}
					status={status}
				/>
			</div>

			<div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
				{status === "submitted" ? (
					<StopButton stop={stop} setMessages={setMessages} />
				) : (
					<SendButton
						input={input}
						submitForm={submitForm}
						uploadQueue={uploadQueue}
					/>
				)}
			</div>
		</div>
	)
}

export const MultimodalInput = memo(
	PureMultimodalInput,
	(prevProps, nextProps) => {
		if (prevProps.input !== nextProps.input) return false
		if (prevProps.status !== nextProps.status) return false
		if (!equal(prevProps.attachments, nextProps.attachments)) return false
		if (
			prevProps.selectedVisibilityType !==
			nextProps.selectedVisibilityType
		)
			return false
		if (prevProps.isArtifactVisible !== nextProps.isArtifactVisible)
			return false

		return true
	}
)

function PureAttachmentsButton({
	fileInputRef,
	status
}: {
	fileInputRef: React.MutableRefObject<HTMLInputElement | null>
	status: UseChatHelpers["status"]
}) {
	return (
		<Button
			data-testid="attachments-button"
			className="rounded-3xl rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 dark:hover:bg-zinc-900 hover:bg-zinc-200"
			onClick={(event) => {
				event.preventDefault()
				fileInputRef.current?.click()
			}}
			disabled={status !== "ready"}
			variant="outline"
		>
			<PaperclipIcon size={14} />
		</Button>
	)
}

const AttachmentsButton = memo(PureAttachmentsButton)

function PureStopButton({
	stop,
	setMessages
}: {
	stop: () => void
	setMessages: UseChatHelpers["setMessages"]
}) {
	return (
		<Button
			data-testid="stop-button"
			className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
			onClick={(event) => {
				event.preventDefault()
				stop()
				setMessages((messages) => messages)
			}}
		>
			<StopIcon size={14} />
		</Button>
	)
}

const StopButton = memo(PureStopButton)

function PureSendButton({
	submitForm,
	input,
	uploadQueue
}: {
	submitForm: () => void
	input: string
	uploadQueue: Array<string>
}) {
	return (
		<Button
			data-testid="send-button"
			className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
			onClick={(event) => {
				event.preventDefault()
				submitForm()
			}}
			disabled={input.length === 0 || uploadQueue.length > 0}
		>
			<ArrowUpIcon size={14} />
		</Button>
	)
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
	if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
		return false
	if (prevProps.input !== nextProps.input) return false
	return true
})
