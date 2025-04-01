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
async function removeBackgroundOnly(file: File | Blob): Promise<Blob> {
  // Create a new File object if we received a Blob
  const imageFile = file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' });
  
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetchWithRetry(
    `${API_BASE_URL}/remove-background`,
    {
      method: 'POST',
      body: formData
    }
  );

  return response.blob();
}

// Process image with multiple treatments
async function processImage(
  file: File | Blob,
  options: {
    remove_bg?: boolean;
    crop_mouth?: boolean;
    resize?: boolean;
    width?: number;
    height?: number;
    mode?: string;
    keep_ratio?: boolean;
  }
): Promise<Blob> {
  // Create a new File object if we received a Blob
  const imageFile = file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' });
  
  const formData = new FormData();
  formData.append('image', imageFile);

  const queryParams = new URLSearchParams();
  
  // Add all options to query params
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetchWithRetry(
    `${API_BASE_URL}/process-image?${queryParams.toString()}`,
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
  dimensions?: { width: number; height: number; tool?: string; mode?: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null
): Promise<{ url: string; width: number; height: number }> {
  const startTime = performance.now();
  let success = false;

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
            if (dimensions.width && dimensions.height) {
              options.resize = true;
              options.width = dimensions.width;
              options.height = dimensions.height;
              options.mode = 'fit';
              options.keep_ratio = true;
            }
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

    // Track processing time and dispatch event
    const processingTime = (performance.now() - startTime) / 1000;
    window.dispatchEvent(new CustomEvent('imageProcessed', {
      detail: {
        success,
        processingTime,
        operation: dimensions?.mode || 'ai'
      }
    }));

    return {
      url: resultUrl,
      width: finalWidth,
      height: finalHeight
    };
  } catch (error) {
    success = false;
    console.error('Error processing image:', error);

    // Track failed processing
    const processingTime = (performance.now() - startTime) / 1000;
    window.dispatchEvent(new CustomEvent('imageProcessed', {
      detail: {
        success,
        processingTime,
        operation: dimensions?.mode || 'ai'
      }
    }));

    throw new Error(error.message || 'Failed to process image');
  }
}