import { ImageFile } from '../types';

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      URL.revokeObjectURL(url);
      resolve(dimensions);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de charger l'image"));
    };

    img.src = url;
  });
}

export async function loadImageMetadata(file: ImageFile): Promise<ImageFile> {
  try {
    const dimensions = await getImageDimensions(file.file);
    
    return {
      ...file,
      dimensions: {
        width: dimensions.width,
        height: dimensions.height,
        original: {
          width: dimensions.width,
          height: dimensions.height
        }
      }
    };
  } catch (error) {
    console.error('Error loading image metadata:', error);
    return file;
  }
}

export async function loadImagesMetadata(files: ImageFile[]): Promise<ImageFile[]> {
  const updatedFiles = await Promise.all(files.map(loadImageMetadata));
  return updatedFiles;
}