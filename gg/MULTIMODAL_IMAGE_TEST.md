# Multimodal Image Artifact Test Guide

This document provides a comprehensive test plan to verify that the multimodal image artifact system is working correctly with both text-to-image and image-to-image generation.

## Test Environment Setup

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Ensure environment variables are set:**
   - `FAL_API_KEY` - for image generation
   - `BLOB_READ_WRITE_TOKEN` - for file uploads
   - Database connection for artifact storage

## Test Cases

### Test 1: Basic Text-to-Image Generation

**Objective:** Verify that text-only prompts generate images correctly.

**Steps:**

1. Open the chat interface
2. Type: "Create a beautiful sunset over mountains with vibrant colors"
3. Send the message

**Expected Results:**

- Image artifact should be created
- Image should display without blank screen
- Image should match the description
- Console should show successful image generation logs

### Test 2: File Upload Image-to-Image

**Objective:** Verify that uploaded images are processed correctly for image-to-image generation.

**Steps:**

1. Click the attachment button (📎)
2. Upload an image file (PNG, JPG, etc.)
3. Type: "Transform this image into a watercolor painting style"
4. Send the message

**Expected Results:**

- File upload should succeed (check network tab)
- Image artifact should be created using the uploaded image as input
- Generated image should show watercolor style transformation
- Original image characteristics should be preserved but stylized

### Test 3: URL-based Image-to-Image

**Objective:** Verify that image URLs in text are processed correctly.

**Steps:**

1. Type a message with an image URL and instructions:

   ```
   https://example.com/image.jpg
   Add dramatic lighting and make it more cinematic
   ```

2. Send the message

**Expected Results:**

- System should extract the URL from the text
- Clean prompt should be used for generation
- Image-to-image model should be selected automatically

### Test 4: Multi-Image Generation

**Objective:** Verify that multiple images are processed correctly and automatically switch to multi-image model.

**Steps:**

1. Click the attachment button (📎)
2. Upload multiple image files (2-3 images)
3. Type: "Combine these images into a single artistic composition with cohesive style"
4. Send the message

**Expected Results:**

- All uploaded images should be processed
- System should automatically select the multi-image model (`fal-ai/flux-pro/kontext/max/multi`)
- Generated image should incorporate elements from all input images
- Console should show `image_urls` parameter being used instead of `image_url`

### Test 5: Error Handling

**Objective:** Verify that error states are handled gracefully.

**Steps:**

1. Try uploading a non-image file
2. Try uploading a file larger than 10MB
3. Try with invalid image URLs

**Expected Results:**

- Appropriate error messages should be displayed
- No blank screens or crashes
- User should be guided on how to fix the issue

### Test 6: Artifact Interaction

**Objective:** Verify that artifact actions work correctly.

**Steps:**

1. Generate an image artifact
2. Test toolbar actions:
   - Regenerate image
   - Edit image
   - Upload image to edit
   - Change style
   - Download image
   - Copy to clipboard

**Expected Results:**

- All actions should work without errors
- Regenerate should create a new version
- Edit should allow modifications
- Download should save the image file
- Copy should work in supported browsers

## Debugging Information

### Console Logs to Monitor

1. **Image generation logs:**

   ```
   Image stream part received: { type: 'image-delta', contentLength: ..., contentPreview: ... }
   Image loaded successfully: { title: ..., contentLength: ... }
   ```

2. **File upload logs:**

   ```
   File upload request received
   File received: image/png, size: 71099 bytes
   Upload successful: https://...
   ```

3. **Error logs to watch for:**

   ```
   Image failed to load: { title: ..., contentLength: ... }
   Image generation failed: ...
   ```

### Network Requests to Monitor

1. **File upload:** `POST /api/files/upload`
2. **Chat with image generation:** `POST /api/chat`
3. **Document retrieval:** `GET /api/document?id=...`

### Common Issues and Solutions

1. **Blank Screen:**
   - Check if image content is being received (console logs)
   - Verify base64 data is valid
   - Check for JavaScript errors in console

2. **File Upload Failures:**
   - Verify BLOB_READ_WRITE_TOKEN is set
   - Check file size and format
   - Monitor network tab for upload errors

3. **Image Generation Failures:**
   - Verify FAL_API_KEY is set and valid
   - Check for API rate limits
   - Monitor server logs for generation errors

## Performance Considerations

1. **Image Generation Time:** Typically 5-15 seconds
2. **File Upload Time:** Should be under 2 seconds for typical images
3. **Artifact Loading:** Should be immediate once image is generated

## Browser Compatibility

Test in multiple browsers:

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Mobile Testing

Verify functionality on mobile devices:

- File upload from camera/gallery
- Image display and interaction
- Touch-based artifact controls

## Success Criteria

✅ All test cases pass without errors
✅ No blank screens or crashes
✅ Proper error handling and user feedback
✅ Consistent performance across browsers
✅ Mobile compatibility
✅ All artifact actions work correctly

## Troubleshooting

If tests fail, check:

1. Environment variables are properly set
2. Development server is running without errors
3. Network connectivity for API calls
4. Browser console for JavaScript errors
5. Server logs for backend issues

## Next Steps

After successful testing:

1. Deploy to staging environment
2. Run tests in production-like environment
3. Monitor real user interactions
4. Gather feedback on user experience
5. Optimize performance based on usage patterns
