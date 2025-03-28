import { ImageFile } from '../types';

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
      body: formData,
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }
  );

  return response.blob();
}

// Function to resize image
async function resizeImage(blob: Blob, dimensions: { width: number; height: number; tool?: string }): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', blob);

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
      body: formData,
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }
  );

  return response.blob();
}

export async function removeBackground(
  file: File, 
  model: string = 'bria',
  dimensions?: { width: number; height: number; tool?: string }
): Promise<string> {
  const startTime = performance.now();
  let success = false;

  try {
    let resultBlob: Blob;

    // Queue the API requests with retries
    await requestQueue.add(async () => {
      // First, remove the background
      resultBlob = await removeBackgroundOnly(file, model);

      // Then, if dimensions are provided, resize the image
      if (dimensions) {
        resultBlob = await resizeImage(resultBlob, dimensions);
      }
    });

    // Create object URL from the final blob
    const resultUrl = URL.createObjectURL(resultBlob);
    success = true;
    return resultUrl;
  } catch (error) {
    success = false;
    console.error('Error processing image:', error);
    throw new Error(error.message || 'Failed to process image');
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