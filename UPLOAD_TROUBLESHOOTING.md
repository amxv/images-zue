# File Upload Troubleshooting Guide

If you're experiencing "upload failed" errors when trying to upload images, here are the most common causes and solutions:

## 1. Check File Requirements

### Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)

### File Size Limit

- Maximum file size: **10MB**
- If your file is larger, try compressing it or using a different image

## 2. Vercel Blob Configuration

The most common cause of upload failures is missing Vercel Blob configuration.

### Required Environment Variable

You need to set up `BLOB_READ_WRITE_TOKEN` in your environment variables.

#### For Local Development (.env.local)

```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

#### For Production (Vercel Dashboard)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add `BLOB_READ_WRITE_TOKEN` with your Vercel Blob token

### Getting a Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Blob
3. Create a new Blob store if you don't have one
4. Copy the read-write token

## 3. Network Issues

### Check Browser Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages when uploading
4. Check Network tab for failed requests

### Common Network Errors

- **CORS errors**: Usually resolved by proper Vercel configuration
- **Timeout errors**: Try uploading smaller files or check internet connection
- **403/401 errors**: Authentication issues, check if you're logged in

## 4. Authentication Issues

### Make Sure You're Logged In

- File uploads require authentication
- If you see "Unauthorized" errors, log in again
- Check if your session has expired

## 5. Browser Issues

### Try Different Browser

- Test in Chrome, Firefox, or Safari
- Clear browser cache and cookies
- Disable browser extensions temporarily

### Check File Input

- Make sure you're clicking the attachment button (📎)
- Try drag-and-drop if available
- Ensure file picker opens correctly

## 6. Server-Side Debugging

### Check Server Logs

If you have access to server logs, look for:

```
File upload request received
File received: [filename], size: [size] bytes
Uploading file: [filename]
Upload successful: [url]
```

### Common Server Errors

- `BLOB_READ_WRITE_TOKEN not configured`: Set up environment variable
- `File size should be less than 10MB`: Reduce file size
- `File type should be JPEG, PNG, GIF, WebP, or BMP`: Use supported format
- `Vercel Blob upload error`: Check Vercel Blob service status

## 7. Quick Fixes

### Try These Steps in Order

1. **Refresh the page** and try again
2. **Check file size and format** (under 10MB, supported type)
3. **Log out and log back in**
4. **Try a different file** to isolate the issue
5. **Clear browser cache** and try again
6. **Check internet connection** stability

## 8. Alternative: Use Image URLs

If uploads continue to fail, you can use the image-to-image feature with URLs:

1. Upload your image to a service like Imgur, Google Drive, or Dropbox
2. Get a direct link to the image
3. Use the image URL in your prompt:

   ```
   https://example.com/your-image.jpg
   Transform this image into a watercolor painting
   ```

## 9. Getting Help

If none of these solutions work:

1. **Check browser console** for specific error messages
2. **Note the exact error message** you're seeing
3. **Try with a simple, small PNG file** to test basic functionality
4. **Check if the issue persists across different devices/browsers**

### Information to Provide When Reporting Issues

- Browser and version
- File type and size you're trying to upload
- Exact error message
- Whether you're logged in
- Whether this worked before or is a new issue

## 10. Development Setup

For developers setting up the project:

### Required Environment Variables

```bash
# .env.local
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
# ... other environment variables
```

### Test Upload Functionality

```bash
# Run the development server
npm run dev

# Test with a small PNG file first
# Check browser console for detailed logs
```
