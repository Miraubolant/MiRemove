// Existing imports...

export async function removeBackground(
  file: File, 
  model: string = 'bria',
  dimensions?: { width: number; height: number; tool?: string; mode?: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null
): Promise<{ url: string; width: number; height: number }> {
  const startTime = performance.now();
  let success = false;
  let shouldTrackStats = true;
  let operationType = dimensions?.mode || 'ai';

  try {
    let resultBlob: Blob;
    let finalWidth: number;
    let finalHeight: number;

    await requestQueue.add(async () => {
      if (dimensions?.mode === 'all') {
        // First process with initial treatments
        const initialOptions = {
          crop_mouth: true,
          resize: true,
          width: dimensions.width,
          height: dimensions.height,
          mode: 'fit',
          keep_ratio: true
        };
        
        // Process initial treatments
        const initialResult = await processImage(file, initialOptions);
        
        // Then process with AI
        resultBlob = await removeBackgroundOnly(initialResult);
      } else {
        const options: any = {};

        switch (dimensions?.mode) {
          case 'both':
            options.remove_bg = true;
            options.resize = true;
            options.width = dimensions.width;
            options.height = dimensions.height;
            options.mode = 'fit';
            options.keep_ratio = true;
            break;
          case 'resize':
            options.resize = true;
            options.width = dimensions.width;
            options.height = dimensions.height;
            options.mode = 'fit';
            options.keep_ratio = true;
            break;
          case 'ai':
            options.remove_bg = true;
            break;
          case 'crop-head':
            options.crop_mouth = true;
            break;
        }

        resultBlob = await processImage(file, options);
      }

      // Get dimensions from the processed image
      const img = await createImageBitmap(resultBlob);
      finalWidth = img.width;
      finalHeight = img.height;
      img.close();
    });

    // Create object URL from the final blob
    const resultUrl = URL.createObjectURL(resultBlob);
    success = true;
    return {
      url: resultUrl,
      width: finalWidth,
      height: finalHeight
    };
  } catch (error) {
    success = false;
    console.error('Error processing image:', error);
    throw new Error(error.message || 'Failed to process image');
  } finally {
    const processingTime = (performance.now() - startTime) / 1000;
    
    // Dispatch event with operation type
    window.dispatchEvent(new CustomEvent('imageProcessed', {
      detail: {
        success,
        processingTime,
        operationType
      }
    }));
  }
}