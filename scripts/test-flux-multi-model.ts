import { fal } from "@ai-sdk/fal"
import { experimental_generateImage } from "ai"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function testFluxMultiModel() {
	console.log("Testing FLUX Kontext Max Multi model...")

	// Check if FAL API key is set
	if (!process.env.FAL_API_KEY && !process.env.FAL_KEY) {
		console.error(
			"❌ FAL_API_KEY or FAL_KEY environment variable is not set"
		)
		return
	}

	console.log("✅ FAL API key is configured")

	// Test FLUX Kontext Max Multi model with single image (should use image_urls)
	try {
		console.log("\n🧪 Testing FLUX Kontext Max Multi with single image...")

		// First generate a base image
		const baseImage = await experimental_generateImage({
			model: fal.image("fal-ai/flux/schnell"),
			prompt: "A simple landscape with mountains",
			providerOptions: {
				fal: {
					aspect_ratio: "1:1",
					num_inference_steps: 4,
					sync_mode: true
				}
			}
		})

		console.log("✅ Base image generated successfully")

		// Now test the multi model with single image using image_urls (correct)
		const { image } = await experimental_generateImage({
			model: fal.image("fal-ai/flux-pro/kontext/max/multi"),
			prompt: "Transform this landscape into a winter wonderland with snow",
			providerOptions: {
				fal: {
					image_urls: [
						`data:image/png;base64,${baseImage.image.base64}`
					], // Correct: array format
					num_inference_steps: 50,
					guidance_scale: 3.5,
					sync_mode: true
				}
			}
		})

		console.log(
			"✅ FLUX Kontext Max Multi model with single image is working!"
		)
		console.log(
			`Image generated successfully - Base64 length: ${image.base64.length}`
		)
	} catch (error) {
		console.error(
			"❌ FLUX Kontext Max Multi model with single image failed:"
		)
		console.error(error)
	}

	// Test FLUX Kontext Max Multi model with multiple images
	try {
		console.log(
			"\n🧪 Testing FLUX Kontext Max Multi with multiple images..."
		)

		// Generate two base images
		const baseImage1 = await experimental_generateImage({
			model: fal.image("fal-ai/flux/schnell"),
			prompt: "A red apple on a table",
			providerOptions: {
				fal: {
					aspect_ratio: "1:1",
					num_inference_steps: 4,
					sync_mode: true
				}
			}
		})

		const baseImage2 = await experimental_generateImage({
			model: fal.image("fal-ai/flux/schnell"),
			prompt: "A blue orange on a plate",
			providerOptions: {
				fal: {
					aspect_ratio: "1:1",
					num_inference_steps: 4,
					sync_mode: true
				}
			}
		})

		console.log("✅ Base images generated successfully")

		// Now test the multi model with multiple images
		const { image } = await experimental_generateImage({
			model: fal.image("fal-ai/flux-pro/kontext/max/multi"),
			prompt: "Combine these fruits into a single artistic composition",
			providerOptions: {
				fal: {
					image_urls: [
						`data:image/png;base64,${baseImage1.image.base64}`,
						`data:image/png;base64,${baseImage2.image.base64}`
					],
					num_inference_steps: 50,
					guidance_scale: 3.5,
					sync_mode: true
				}
			}
		})

		console.log(
			"✅ FLUX Kontext Max Multi model with multiple images is working!"
		)
		console.log(
			`Image generated successfully - Base64 length: ${image.base64.length}`
		)
	} catch (error) {
		console.error(
			"❌ FLUX Kontext Max Multi model with multiple images failed:"
		)
		console.error(error)
	}

	// Test what would fail (using image_url instead of image_urls)
	try {
		console.log(
			"\n🧪 Testing FLUX Kontext Max Multi with wrong parameter (image_url)..."
		)

		// Generate a base image
		const baseImage = await experimental_generateImage({
			model: fal.image("fal-ai/flux/schnell"),
			prompt: "A simple landscape",
			providerOptions: {
				fal: {
					aspect_ratio: "1:1",
					num_inference_steps: 4,
					sync_mode: true
				}
			}
		})

		// This should fail because we're using image_url instead of image_urls
		const { image } = await experimental_generateImage({
			model: fal.image("fal-ai/flux-pro/kontext/max/multi"),
			prompt: "Transform this landscape",
			providerOptions: {
				fal: {
					image_url: `data:image/png;base64,${baseImage.image.base64}`, // Wrong: should be image_urls
					num_inference_steps: 50,
					guidance_scale: 3.5,
					sync_mode: true
				}
			}
		})

		console.log("❌ This should have failed but didn't!")
		console.log(
			`Image generated successfully - Base64 length: ${image.base64.length}`
		)
	} catch (error) {
		console.log("✅ Expected failure with wrong parameter (image_url):")
		console.log("Error:", error.message)
	}
}

if (require.main === module) {
	testFluxMultiModel().catch(console.error)
}

export { testFluxMultiModel }
