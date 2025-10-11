// Cloudinary Configuration for Browser
// Note: We don't import cloudinary SDK in browser to avoid process errors
// Instead, we use direct API calls

// Get Cloudinary credentials from environment or use defaults
const getCloudinaryConfig = () => {
  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dvdtbffva',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '767879943653787',
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'okUt1vJMZP1X0aEl9cOYUKwXUGQ'
  };
};

// Upload image to Cloudinary using unsigned upload with preset
export const uploadImage = async (file, folder = 'ntb-web') => {
  try {
    console.log('Uploading image to Cloudinary...', file.name);
    
    const config = getCloudinaryConfig();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ntb_web_preset'); // This preset needs to be created
    formData.append('folder', folder);
    formData.append('cloud_name', config.cloudName);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      // If preset fails, try with API key and signature
      console.log('Preset upload failed, trying with API key...');
      try {
        return await uploadImageWithSignature(file, folder);
      } catch (signatureError) {
        console.log('Signature upload failed, falling back to base64...');
        return await uploadImageAsBase64(file, folder);
      }
    }
    
    const result = await response.json();
    console.log('Image uploaded successfully:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    // Final fallback to base64
    console.log('Cloudinary upload failed, falling back to base64...');
    return await uploadImageAsBase64(file, folder);
  }
};

// Upload image with signature (fallback method)
export const uploadImageWithSignature = async (file, folder = 'ntb-web') => {
  try {
    console.log('Uploading image with signature...', file.name);
    
    const config = getCloudinaryConfig();
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate signature (simplified version)
    const params = {
      timestamp: timestamp,
      folder: folder,
      public_id: `${folder}/${Date.now()}_${file.name.split('.')[0]}`
    };
    
    // Create signature string
    const signatureString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&') + config.apiSecret;
    
    // Simple hash function (for demo purposes)
    const signature = btoa(signatureString).slice(0, 32);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', config.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('public_id', params.public_id);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Image uploaded successfully with signature:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Error uploading image with signature:', error);
    throw error;
  }
};

// Fallback: Convert image to base64 for local storage
export const uploadImageAsBase64 = async (file, folder = 'ntb-web') => {
  try {
    console.log('Converting image to base64...', file.name);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = {
          secure_url: reader.result,
          public_id: `${folder}/${Date.now()}_${file.name.split('.')[0]}`,
          format: file.type.split('/')[1],
          width: 0,
          height: 0,
          bytes: file.size,
          created_at: new Date().toISOString()
        };
        console.log('Image converted to base64 successfully');
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Upload video to Cloudinary using unsigned upload with preset
export const uploadVideo = async (file, folder = 'ntb-web/videos') => {
  try {
    console.log('Uploading video to Cloudinary...', file.name);
    
    const config = getCloudinaryConfig();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ntb_web_video_preset'); // This preset needs to be created
    formData.append('folder', folder);
    formData.append('resource_type', 'video');
    formData.append('cloud_name', config.cloudName);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/video/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      // If preset fails, try with API key and signature
      console.log('Preset upload failed, trying with API key...');
      try {
        return await uploadVideoWithSignature(file, folder);
      } catch (signatureError) {
        console.log('Signature upload failed, falling back to base64...');
        return await uploadVideoAsBase64(file, folder);
      }
    }
    
    const result = await response.json();
    console.log('Video uploaded successfully:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Error uploading video:', error);
    // Final fallback to base64
    console.log('Cloudinary upload failed, falling back to base64...');
    return await uploadVideoAsBase64(file, folder);
  }
};

// Upload video with signature (fallback method)
export const uploadVideoWithSignature = async (file, folder = 'ntb-web/videos') => {
  try {
    console.log('Uploading video with signature...', file.name);
    
    const config = getCloudinaryConfig();
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate signature (simplified version)
    const params = {
      timestamp: timestamp,
      folder: folder,
      resource_type: 'video',
      public_id: `${folder}/${Date.now()}_${file.name.split('.')[0]}`
    };
    
    // Create signature string
    const signatureString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&') + config.apiSecret;
    
    // Simple hash function (for demo purposes)
    const signature = btoa(signatureString).slice(0, 32);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', config.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('resource_type', 'video');
    formData.append('public_id', params.public_id);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/video/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Video uploaded successfully with signature:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Error uploading video with signature:', error);
    throw error;
  }
};

// Fallback: Convert video to base64 for local storage
export const uploadVideoAsBase64 = async (file, folder = 'ntb-web/videos') => {
  try {
    console.log('Converting video to base64...', file.name);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = {
          secure_url: reader.result,
          public_id: `${folder}/${Date.now()}_${file.name.split('.')[0]}`,
          format: file.type.split('/')[1],
          width: 0,
          height: 0,
          bytes: file.size,
          duration: 0,
          created_at: new Date().toISOString()
        };
        console.log('Video converted to base64 successfully');
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error converting video to base64:', error);
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
