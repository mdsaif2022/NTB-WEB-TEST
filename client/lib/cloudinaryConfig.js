// Cloudinary Configuration for Browser
// Note: We don't import cloudinary SDK in browser to avoid process errors
// Instead, we use direct API calls

// Upload image to Cloudinary
export const uploadImage = async (file, folder = 'ntb-web') => {
  try {
    console.log('Uploading image to Cloudinary...', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ntb_web_preset'); // You'll need to create this preset
    formData.append('folder', folder);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/dvdtbffva/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Image uploaded successfully:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Upload video to Cloudinary
export const uploadVideo = async (file, folder = 'ntb-web/videos') => {
  try {
    console.log('Uploading video to Cloudinary...', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ntb_web_video_preset'); // You'll need to create this preset
    formData.append('folder', folder);
    formData.append('resource_type', 'video');
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/dvdtbffva/video/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Video uploaded successfully:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    console.log('Deleting image from Cloudinary:', publicId);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/dvdtbffva/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        api_key: '767879943653787',
        api_secret: 'okUt1vJMZP1X0aEl9cOYUKwXUGQ',
        timestamp: Math.round(new Date().getTime() / 1000)
      })
    });
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Image deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Delete video from Cloudinary
export const deleteVideo = async (publicId) => {
  try {
    console.log('Deleting video from Cloudinary:', publicId);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/dvdtbffva/video/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        resource_type: 'video',
        api_key: '767879943653787',
        api_secret: 'okUt1vJMZP1X0aEl9cOYUKwXUGQ',
        timestamp: Math.round(new Date().getTime() / 1000)
      })
    });
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Video deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    width: options.width || 'auto',
    height: options.height || 'auto',
    crop: options.crop || 'scale'
  };
  
  // Build URL manually since we can't use cloudinary SDK in browser
  const params = new URLSearchParams(defaultOptions);
  return `https://res.cloudinary.com/dvdtbffva/image/upload/${params.toString()}/${publicId}`;
};

// Generate optimized video URL
export const getOptimizedVideoUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    format: 'mp4',
    width: options.width || 'auto',
    height: options.height || 'auto',
    crop: options.crop || 'scale'
  };
  
  // Build URL manually since we can't use cloudinary SDK in browser
  const params = new URLSearchParams(defaultOptions);
  return `https://res.cloudinary.com/dvdtbffva/video/upload/${params.toString()}/${publicId}`;
};
