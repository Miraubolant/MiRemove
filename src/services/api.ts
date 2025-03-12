import { compressImage } from './imageCompression';

const cache = new Map<string, string>();

function generateCacheKey(file: File, model: string, dimensions?: { width: number; height: number }): string {
  const dimensionKey = dimensions ? `-${dimensions.width}x${dimensions.height}` : '';
  return `${file.name}-${file.size}-${file.lastModified}-${model}${dimensionKey}`;
}

export async function removeBackground(
  file: File, 
  model: string = 'bria',
  dimensions?: { width: number; height: number }
): Promise<string> {
  const startTime = performance.now();
  let success = false;
  const cacheKey = generateCacheKey(file, model, dimensions);
  
  try {
    // Check cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      success = true;
      return cachedResult;
    }

    // Compress the image before processing
    const compressedFile = await compressImage(file, {
      maxWidth: dimensions?.width || 2048,
      maxHeight: dimensions?.height || 2048,
      quality: 0.8,
      maxSizeMB: 10
    });

    // Create FormData
    const formData = new FormData();
    formData.append("image", compressedFile);
    formData.append("model", model);

    const response = await fetch('https://api.miraubolant.com/remove-background', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Échec de la suppression du fond');
    }

    const blob = await response.blob();
    
    if (dimensions) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        });
        
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        const resizedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        
        const resultUrl = URL.createObjectURL(resizedBlob);
        cache.set(cacheKey, resultUrl);
        URL.revokeObjectURL(img.src);
        
        success = true;
        return resultUrl;
      }
    }

    const resultUrl = URL.createObjectURL(blob);
    cache.set(cacheKey, resultUrl);

    success = true;
    return resultUrl;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const processingTime = (performance.now() - startTime) / 1000;
    window.dispatchEvent(new CustomEvent('imageProcessed', {
      detail: {
        success,
        processingTime
      }
    }));
  }
}