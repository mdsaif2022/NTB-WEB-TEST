# Cloudinary Setup Guide

## Issue
The admin panel shows "401 Unauthorized" error when trying to upload tour images to Cloudinary.

## Root Cause
The Cloudinary upload preset `ntb_web_preset` is not configured or doesn't exist in your Cloudinary account.

## Solution Options

### Option 1: Create Upload Preset (Recommended)

1. **Go to Cloudinary Console**
   - Visit [Cloudinary Console](https://console.cloudinary.com/)
   - Login to your account with cloud name: `dvdtbffva`

2. **Create Upload Presets**
   - Go to **Settings** → **Upload**
   - Scroll down to **Upload presets**
   
   **For Images:**
   - Click **Add upload preset**
   - Set the following:
     - **Preset name**: `ntb_web_preset`
     - **Signing Mode**: `Unsigned`
     - **Folder**: `ntb-web`
     - **Resource Type**: `Image`
     - **Format**: `Auto`
     - **Quality**: `Auto`
   - Click **Save**
   
   **For Videos:**
   - Click **Add upload preset**
   - Set the following:
     - **Preset name**: `ntb_web_video_preset`
     - **Signing Mode**: `Unsigned`
     - **Folder**: `ntb-web/videos`
     - **Resource Type**: `Video`
     - **Format**: `Auto`
     - **Quality**: `Auto`
   - Click **Save**

3. **Test Upload**
   - Try uploading an image in the admin panel
   - Try uploading a video in the admin panel
   - Check browser console for success messages

### Option 2: Use Environment Variables

1. **Create `.env.local` file** in the project root:
```env
VITE_CLOUDINARY_CLOUD_NAME=dvdtbffva
VITE_CLOUDINARY_API_KEY=767879943653787
VITE_CLOUDINARY_API_SECRET=okUt1vJMZP1X0aEl9cOYUKwXUGQ
```

2. **Restart Development Server**
```bash
npm run dev
```

### Option 3: Use Base64 Fallback (Current Implementation)

The current implementation includes a fallback that converts images to base64 when Cloudinary fails. This allows the admin panel to work even without proper Cloudinary setup.

**Pros:**
- Works immediately without configuration
- No external dependencies
- Images are stored in Firebase

**Cons:**
- Larger file sizes
- No image optimization
- Limited to Firebase storage quotas

## Current Implementation Details

The `cloudinaryConfig.js` file now includes:

1. **Primary Upload**: Cloudinary with preset
2. **Fallback 1**: Cloudinary with signature
3. **Fallback 2**: Base64 conversion

```javascript
// Upload flow:
1. Try Cloudinary preset upload
2. If fails → Try Cloudinary signature upload  
3. If fails → Convert to base64
```

## Testing

After setup, test the upload functionality:

1. Go to Admin Panel → Tours → Create New Tour
2. Try uploading an image
3. Check browser console for upload method used
4. Verify image appears in the form

## Troubleshooting

### Still Getting 401 Error?
1. Check if upload preset exists in Cloudinary Console
2. Verify preset is set to "Unsigned" mode
3. Check if API credentials are correct
4. Try the base64 fallback method

### Images Not Displaying?
1. Check if base64 images are too large
2. Verify Firebase storage permissions
3. Check browser console for errors

### Performance Issues?
1. Consider implementing image compression
2. Set up proper Cloudinary presets for optimization
3. Use Cloudinary's automatic format and quality settings

## Cloudinary Account Information

- **Cloud Name**: `dvdtbffva`
- **API Key**: `767879943653787`
- **API Secret**: `okUt1vJMZP1X0aEl9cOYUKwXUGQ`

## Security Note

For production, consider:
1. Using signed uploads instead of unsigned
2. Implementing server-side upload endpoints
3. Adding image validation and virus scanning
4. Setting up proper access controls

## Support

If you continue to have issues:
1. Check Cloudinary Console for error logs
2. Verify account status and billing
3. Test with a simple upload preset first
4. Consider using the base64 fallback for immediate functionality
