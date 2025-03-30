import { ImageFile } from '../types';
import { compressImage } from './imageCompression';

// Constants for better maintainability
const API_BASE_URL = 'https://api.miraubolant.com';
const MAX_RETRIES = 3;
const BASE_TIMEOUT = 30000;
const BACKOFF_FACTOR = 2;

// Implement request queue with concurrency control
class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private processing = false;
  private concurrentLimit: number;
  private activeRequests = 0;

  constructor(concurrentLimit = 3) {
    this.concurrentLimit = concurrentLimit;
  }

  async add(request: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await request();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.activeRequests >= this.concurrentLimit) return;
    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.concurrentLimit) {
      const request = this.queue.shift();
      if (request) {
        this.activeRequests++;
        try {
          await request();
        } catch (error) {
          console.error('Error processing request:', error);
        }
        this.activeRequests--;
      }
    }

    this.processing = false;
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

// Convert Blob to JPG format
async function convertToJPG(blob: Blob, originalName: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (jpgBlob) => {
          if (!jpgBlob) {
            reject(new Error('Failed to convert to JPG'));
            return;
          }
          resolve(jpgBlob);
        },
        'image/jpeg',
        0.95
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

// Implement request timeout and retry with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  baseTimeout = BASE_TIMEOUT,
  backoffFactor = BACKOFF_FACTOR
): Promise<Response> {
  let attempt = 0;
  let timeout = baseTimeout;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      if (response.ok) {
        return response;
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      if (attempt === retries) {
        throw error;
      }

      const jitter = Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, timeout + jitter));
      timeout *= backoffFactor;
    } finally {
      clearTimeout(timeoutId);
    }

    attempt++;
  }

  throw new Error('Maximum retries exceeded');
}

// Initialize request queue
const requestQueue = new RequestQueue(3);

// Function to remove background
async function removeBackgroundOnly(file: File, model: string = 'bria'): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetchWithRetry(
    `${API_BASE_URL}/remove-background?model=${model}`,
    {
      method: 'POST',
      body: formData
    }
  );

  return response.blob();
}

// Function to resize image
async function resizeImage(file: File | Blob, dimensions: { width: number; height: number; tool?: string }, originalName: string): Promise<Blob> {
  const formData = new FormData();
  
  // If it's a Blob from background removal, convert to JPG first
  const imageToUpload = file instanceof File ? file : await convertToJPG(file, originalName);
  
  // Use original filename but change extension to .jpg if it's a blob
  const fileName = file instanceof File 
    ? originalName 
    : originalName.substring(0, originalName.lastIndexOf('.')) + '.jpg';
  
  formData.append('image', imageToUpload, fileName);

  const queryParams = new URLSearchParams({
    width: dimensions.width.toString(),
    height: dimensions.height.toString(),
    mode: 'fit',
    keep_ratio: 'true',
    resampling: 'lanczos',
    ...(dimensions.tool && { tool: dimensions.tool })
  });

  const response = await fetchWithRetry(
    `${API_BASE_URL}/resize?${queryParams.toString()}`,
    {
      method: 'POST',
      body: formData
    }
  );

  return response.blob();
}

export async function removeBackground(
  file: File, 
  model: string = 'bria',
  dimensions?: { width: number; height: number; tool?: string; mode?: 'resize' | 'ai' | 'both' } | null
): Promise<{ url: string; width: number; height: number }> {
  const startTime = performance.now();
  let success = false;
  let shouldTrackStats = false; // Only track stats for AI processing

  try {
    let resultBlob: Blob;
    let finalWidth: number;
    let finalHeight: number;

    // Queue the API requests with retries
    await requestQueue.add(async () => {
      if (dimensions?.mode === 'resize') {
        // Only resize - don't track stats
        resultBlob = await resizeImage(file, dimensions, file.name);
        finalWidth = dimensions.width;
        finalHeight = dimensions.height;
      } else if (dimensions?.mode === 'ai') {
        // Only AI processing - track stats and preserve original dimensions
        shouldTrackStats = true;
        resultBlob = await removeBackgroundOnly(file, model);
        // Get dimensions from the processed image
        const img = await createImageBitmap(resultBlob);
        finalWidth = img.width;
        finalHeight = img.height;
        img.close();
      } else if (dimensions?.mode === 'both') {
        // Both resize and AI - track stats
        shouldTrackStats = true;
        const aiProcessedBlob = await removeBackgroundOnly(file, model);
        resultBlob = await resizeImage(aiProcessedBlob, dimensions, file.name);
        finalWidth = dimensions.width;
        finalHeight = dimensions.height;
      } else {
        // Default to AI only if no mode specified
        shouldTrackStats = true;
        resultBlob = await removeBackgroundOnly(file, model);
        // Get dimensions from the processed image
        const img = await createImageBitmap(resultBlob);
        finalWidth = img.width;
        finalHeight = img.height;
        img.close();
      }
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
    // Only dispatch stats event if we performed AI processing
    if (shouldTrackStats) {
      const processingTime = (performance.now() - startTime) / 1000;
      window.dispatchEvent(new CustomEvent('imageProcessed', {
        detail: {
          success,
          processingTime
        }
      }));
    }
  }
}