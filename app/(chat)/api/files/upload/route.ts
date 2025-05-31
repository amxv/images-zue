import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/app/(auth)/auth"

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
	file: z
		.instanceof(Blob)
		.refine((file) => file.size <= 10 * 1024 * 1024, {
			message: "File size should be less than 10MB"
		})
		// Support more image formats including those mentioned in the image artifact
		.refine(
			(file) =>
				[
					"image/jpeg",
					"image/jpg",
					"image/png",
					"image/gif",
					"image/webp",
					"image/bmp"
				].includes(file.type),
			{
				message: "File type should be JPEG, PNG, GIF, WebP, or BMP"
			}
		)
})

export async function POST(request: Request) {
	console.log("File upload request received")

	const session = await auth()

	if (!session) {
		console.log("Upload failed: No session")
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	if (request.body === null) {
		console.log("Upload failed: Empty request body")
		return new Response("Request body is empty", { status: 400 })
	}

	try {
		const formData = await request.formData()
		const file = formData.get("file") as Blob

		if (!file) {
			console.log("Upload failed: No file in form data")
			return NextResponse.json(
				{ error: "No file uploaded" },
				{ status: 400 }
			)
		}

		console.log(`File received: ${file.type}, size: ${file.size} bytes`)

		const validatedFile = FileSchema.safeParse({ file })

		if (!validatedFile.success) {
			const errorMessage = validatedFile.error.errors
				.map((error) => error.message)
				.join(", ")

			console.log(`Validation failed: ${errorMessage}`)
			return NextResponse.json({ error: errorMessage }, { status: 400 })
		}

		// Get filename from formData since Blob doesn't have name property
		const originalFile = formData.get("file") as File
		const filename =
			originalFile.name ||
			`upload_${Date.now()}.${getFileExtension(file.type)}`
		const fileBuffer = await file.arrayBuffer()

		console.log(`Uploading file: ${filename}`)

		// Check if Vercel Blob is configured
		if (!process.env.BLOB_READ_WRITE_TOKEN) {
			console.error("BLOB_READ_WRITE_TOKEN not configured")
			return NextResponse.json(
				{ error: "File storage not configured" },
				{ status: 500 }
			)
		}

		try {
			const data = await put(filename, fileBuffer, {
				access: "public",
				addRandomSuffix: true
			})

			console.log(`Upload successful: ${data.url}`)
			return NextResponse.json(data)
		} catch (error) {
			console.error("Vercel Blob upload error:", error)
			return NextResponse.json(
				{
					error: "Upload failed",
					details:
						error instanceof Error ? error.message : "Unknown error"
				},
				{ status: 500 }
			)
		}
	} catch (error) {
		console.error("Request processing error:", error)
		return NextResponse.json(
			{
				error: "Failed to process request",
				details:
					error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		)
	}
}

function getFileExtension(mimeType: string): string {
	const extensions: Record<string, string> = {
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/png": "png",
		"image/gif": "gif",
		"image/webp": "webp",
		"image/bmp": "bmp"
	}
	return extensions[mimeType] || "jpg"
}
