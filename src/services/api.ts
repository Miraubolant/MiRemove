const cache = new Map<string, string>();

function generateCacheKey(file: File, model: string, dimensions?: { width: number; height: number }): string {
  const dimensionKey = dimensions ? `-${dimensions.width}x${dimensions.height}` : '';
  return `${file.name}-${file.size}-${file.lastModified}-${model}${dimensionKey}`;
}

export async function removeBackground(
  file: File, 
  model: string,
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

    // Create a canvas to resize the image if dimensions are provided
    let imageToProcess = file;
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
          img.src = URL.createObjectURL(file);
        });
        
        // Draw the resized image
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), file.type);
        });
        
        // Create a new File object with the resized image
        imageToProcess = new File([blob], file.name, { type: file.type });
        
        // Clean up
        URL.revokeObjectURL(img.src);
      }
    }

    const formData = new FormData();
    formData.append("image", imageToProcess);
    formData.append("model", model);

    const response = await fetch('https://api.miraubolant.com/remove-background', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Échec de la suppression du fond');
    }

    const blob = await response.blob();
    
    // If dimensions were provided, resize the result image
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
        
        // Draw the resized image
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        // Convert canvas to blob
        const resizedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        
        // Create URL for the resized image
        const resultUrl = URL.createObjectURL(resizedBlob);
        
        // Store in cache
        cache.set(cacheKey, resultUrl);
        
        // Clean up
        URL.revokeObjectURL(img.src);
        
        success = true;
        return resultUrl;
      }
    }

    const resultUrl = URL.createObjectURL(blob);
    
    // Store in cache
    cache.set(cacheKey, resultUrl);

    success = true;
    return resultUrl;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const processingTime = (performance.now() - startTime) / 1000; // Convert to seconds
    window.dispatchEvent(new CustomEvent('imageProcessed', {
      detail: {
        success,
        processingTime
      }
    }));
  }
}