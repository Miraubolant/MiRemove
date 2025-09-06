import { ImageFile } from '../types';
import { compressImage, cleanupImageWorker } from './imageCompression';

// Constants for better maintainability  
// Backend unifié local (développement) ou proxy (production)
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000'  // Backend unifié local
  : '/api';  // Proxy vers backend unifié en production
const MAX_RETRIES = 3;
const BASE_TIMEOUT = 30000;
const BACKOFF_FACTOR = 2;

// API configuration loaded

// Global abort controller for canceling all requests
let globalAbortController = new AbortController();

// Implement request queue with concurrency control
class RequestQueue {
  private queue: { request: () => Promise<void>; reject: (error: Error) => void }[] = [];
  private processing = false;
  private concurrentLimit: number;
  private activeRequests = 0;
  private activeControllers = new Set<AbortController>();
  private cancelled = false;

  constructor(concurrentLimit = 3) {
    this.concurrentLimit = concurrentLimit;
  }

  public cancelAll(): void {
    this.cancelled = true;
    
    // Reject all queued requests
    this.queue.forEach(item => {
      item.reject(new Error('Request cancelled by user'));
    });
    
    // Clear the queue
    this.queue = [];
    
    // Abort all active controllers
    this.activeControllers.forEach(controller => {
      controller.abort();
    });
    this.activeControllers.clear();
    
    // Reset state
    this.processing = false;
    this.activeRequests = 0;
  }

  public reset(): void {
    // Reset the cancelled flag for new queue instance
    this.cancelled = false;
    this.queue = [];
    this.processing = false;
    this.activeRequests = 0;
    this.activeControllers.clear();
  }

  async add(request: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already cancelled
      if (this.cancelled) {
        reject(new Error('Request cancelled by user'));
        return;
      }
      
      const queueItem = {
        request: async () => {
          try {
            // Check again before executing
            if (this.cancelled) {
              throw new Error('Request cancelled by user');
            }
            await request();
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        reject
      };
      
      this.queue.push(queueItem);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.activeRequests >= this.concurrentLimit || this.cancelled) return;
    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.concurrentLimit && !this.cancelled) {
      const queueItem = this.queue.shift();
      if (queueItem) {
        this.activeRequests++;
        try {
          await queueItem.request();
        } catch (error) {
          // Error is already handled in the request wrapper
        }
        this.activeRequests--;
      }
    }

    this.processing = false;
    if (this.queue.length > 0 && !this.cancelled) {
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
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (jpgBlob) => {
            cleanup();
            if (!jpgBlob) {
              reject(new Error('Failed to convert to JPG'));
              return;
            }
            resolve(jpgBlob);
          },
          'image/jpeg',
          0.95
        );
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image'));
    };

    objectUrl = URL.createObjectURL(blob);
    img.src = objectUrl;
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

    // Check if global abort is already triggered
    if (globalAbortController.signal.aborted) {
      throw new Error('Request cancelled');
    }

    // Listen for global abort
    const globalAbortHandler = () => controller.abort();
    globalAbortController.signal.addEventListener('abort', globalAbortHandler);

    // Retry attempt ${attempt + 1}
    
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
        if (globalAbortController.signal.aborted) {
          throw new Error('Request cancelled by user');
        }
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
      globalAbortController.signal.removeEventListener('abort', globalAbortHandler);
    }

    attempt++;
  }

  throw new Error('Maximum retries exceeded');
}

// Initialize request queue
let requestQueue = new RequestQueue(3);

// Export function to cancel all processing
export function cancelAllProcessing(): void {
  // 1. Abort toutes les requêtes HTTP immédiatement
  globalAbortController.abort();
  
  // 2. Créer un nouveau controller pour les futures requêtes
  globalAbortController = new AbortController();
  
  // 3. Annuler la queue de requêtes
  requestQueue.cancelAll();
  
  // 4. Reset immédiat de la queue (pas de délai)
  requestQueue.reset();
  
  // 5. Clean up all resources to prevent memory leaks
  cleanupAllResources();
}

// Function to remove background (mode AI uniquement)
async function removeBackgroundOnly(file: File | Blob): Promise<Blob> {
  // Create a new File object if we received a Blob
  const imageFile = file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' });
  
  const formData = new FormData();
  formData.append('image', imageFile);

  // Background removal request via backend unifié
  const response = await fetchWithRetry(
    `${API_BASE_URL}/process?mode=ai`,
    {
      method: 'POST',
      body: formData
    }
  );

  return response.blob();
}

// Process image with specific mode via backend unifié
async function processImage(
  file: File | Blob,
  mode: string,
  width?: number,
  height?: number
): Promise<Blob> {
  // Create a new File object if we received a Blob
  const imageFile = file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' });
  
  const formData = new FormData();
  formData.append('image', imageFile);

  // Construire l'URL avec le mode et les paramètres
  const queryParams = new URLSearchParams();
  queryParams.append('mode', mode);
  
  if (width !== undefined) {
    queryParams.append('width', width.toString());
  }
  if (height !== undefined) {
    queryParams.append('height', height.toString());
  }

  const url = `${API_BASE_URL}/process?${queryParams.toString()}`;

  const response = await fetchWithRetry(
    url,
    {
      method: 'POST',
      body: formData
    }
  );

  return response.blob();
}

// Store created Object URLs for cleanup
const createdObjectUrls = new Set<string>();

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
      // Double check if cancelled before processing
      if (globalAbortController.signal.aborted) {
        throw new Error('Request cancelled by user');
      }
      
      // Utiliser l'endpoint unifié avec le mode approprié
      const mode = dimensions?.mode || 'ai';
      const width = dimensions?.width;
      const height = dimensions?.height;
      
      // Check again before making the actual API call
      if (globalAbortController.signal.aborted) {
        throw new Error('Request cancelled by user');
      }
      
      // Appel direct au backend unifié avec le mode
      resultBlob = await processImage(file, mode, width, height);

      // Get dimensions from the processed image
      const img = await createImageBitmap(resultBlob);
      finalWidth = img.width;
      finalHeight = img.height;
      img.close();
    });

    // Create object URL from the final blob
    const resultUrl = URL.createObjectURL(resultBlob);
    createdObjectUrls.add(resultUrl);
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

// Export function to clean up a specific Object URL
export function cleanupObjectUrl(url: string): void {
  if (createdObjectUrls.has(url)) {
    URL.revokeObjectURL(url);
    createdObjectUrls.delete(url);
  }
}

// Export function to clean up all Object URLs
export function cleanupAllObjectUrls(): void {
  createdObjectUrls.forEach(url => {
    URL.revokeObjectURL(url);
  });
  createdObjectUrls.clear();
}

// Global cleanup function for all memory resources
export function cleanupAllResources(): void {
  // Clean up Object URLs
  cleanupAllObjectUrls();
  
  // Clean up image processing worker
  cleanupImageWorker();
  
  // Abort and reset global abort controller
  if (globalAbortController) {
    globalAbortController.abort();
    globalAbortController = new AbortController();
  }
  
  // Reset request queue
  requestQueue.cancelAll();
  requestQueue.reset();
}