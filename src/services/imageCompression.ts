import { ImageFile } from '../types';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
  maxSizeMB: 10
};

// Store worker and its object URL for cleanup
let workerData: { worker: Worker; objectUrl: string } | null = null;

// Use Web Workers for image processing when available
const createWorker = (fn: Function) => {
  // Clean up previous worker if exists
  if (workerData) {
    workerData.worker.terminate();
    URL.revokeObjectURL(workerData.objectUrl);
    workerData = null;
  }
  
  const blob = new Blob(['self.onmessage = ', fn.toString()], { type: 'text/javascript' });
  const objectUrl = URL.createObjectURL(blob);
  const worker = new Worker(objectUrl);
  
  // Store for cleanup
  workerData = { worker, objectUrl };
  
  return worker;
};

const imageProcessingWorker = typeof Worker !== 'undefined' ? createWorker((e: MessageEvent) => {
  const { imageData, width, height } = e.data;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.putImageData(imageData, 0, 0);
    canvas.convertToBlob().then(blob => {
      self.postMessage({ blob });
    });
  }
}) : null;

// Export cleanup function
export function cleanupImageWorker(): void {
  if (workerData) {
    workerData.worker.terminate();
    URL.revokeObjectURL(workerData.objectUrl);
    workerData = null;
  }
}

export async function convertWebPToJPG(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.includes('webp')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let objectUrl: string | null = null;

    // Cleanup function
    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      // Clear canvas context
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      // Reset canvas dimensions
      canvas.width = 0;
      canvas.height = 0;
      // Clear image src
      img.src = '';
    };

    if (!ctx) {
      reject(new Error('Impossible de créer le contexte canvas'));
      return;
    }

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) {
              reject(new Error('Échec de la conversion en JPG'));
              return;
            }

            const newFileName = file.name.replace(/\.webp$/i, '.jpg');
            const convertedFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: file.lastModified
            });

            resolve(convertedFile);
          },
          'image/jpeg',
          0.9
        );
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Erreur lors du chargement de l\'image WebP'));
    };

    objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
}

// Implement progressive JPEG compression
async function compressProgressively(
  canvas: HTMLCanvasElement,
  initialQuality: number,
  targetSize: number,
  maxAttempts = 5
): Promise<Blob> {
  let quality = initialQuality;
  let attempt = 0;
  let blob: Blob;

  do {
    blob = await new Promise<Blob>(resolve => {
      canvas.toBlob(b => resolve(b!), 'image/jpeg', quality);
    });

    if (blob.size <= targetSize || attempt >= maxAttempts) break;

    quality *= Math.sqrt(targetSize / blob.size);
    quality = Math.max(0.1, Math.min(1, quality));
    attempt++;
  } while (true);

  return blob;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = DEFAULT_OPTIONS
): Promise<File> {
  const processedFile = await convertWebPToJPG(file);

  if (processedFile.size <= (options.maxSizeMB || DEFAULT_OPTIONS.maxSizeMB!) * 1024 * 1024) {
    return processedFile;
  }

  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let objectUrl: string | null = null;

  // Cleanup function
  const cleanup = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    // Clear canvas context
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // Reset canvas dimensions
    canvas.width = 0;
    canvas.height = 0;
    // Clear image src
    img.src = '';
  };

  if (!ctx) {
    throw new Error('Impossible de créer le contexte canvas');
  }

  try {
    objectUrl = URL.createObjectURL(processedFile);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = objectUrl!;
    });

    let width = img.width;
    let height = img.height;
    
    if (width > (options.maxWidth || DEFAULT_OPTIONS.maxWidth!)) {
      height = (height * (options.maxWidth || DEFAULT_OPTIONS.maxWidth!)) / width;
      width = options.maxWidth || DEFAULT_OPTIONS.maxWidth!;
    }
    
    if (height > (options.maxHeight || DEFAULT_OPTIONS.maxHeight!)) {
      width = (width * (options.maxHeight || DEFAULT_OPTIONS.maxHeight!)) / height;
      height = options.maxHeight || DEFAULT_OPTIONS.maxHeight!;
    }

    canvas.width = width;
    canvas.height = height;

    // Use createImageBitmap for better performance
    const bitmap = await createImageBitmap(img, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'high'
    });

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const targetSize = (options.maxSizeMB || DEFAULT_OPTIONS.maxSizeMB!) * 1024 * 1024;
    const blob = await compressProgressively(
      canvas,
      options.quality || DEFAULT_OPTIONS.quality!,
      targetSize
    );

    const result = new File([blob], processedFile.name, {
      type: 'image/jpeg',
      lastModified: processedFile.lastModified
    });

    cleanup();
    return result;

  } catch (error) {
    cleanup();
    throw error;
  }
}

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