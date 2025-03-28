import { ImageFile } from '../types';

// Constants for better maintainability
const API_URL = 'https://api.miraubolant.com/remove-background';
const RESIZE_PARAMS = {
  mode: 'fit',
  keep_ratio: 'true',
  resampling: 'hanning'
} as const;
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

export async function removeBackground(
  file: File, 
  model: string = 'bria',
  dimensions?: { width: number; height: number; tool?: string }
): Promise<string> {
  const startTime = performance.now();
  let success = false;

  try {
    let resultUrl: string | undefined;

    // Queue the API request with retries
    await requestQueue.add(async () => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("model", model);

      // Only append dimensions if they are provided, with no modifications
      if (dimensions) {
        formData.append("width", dimensions.width.toString());
        formData.append("height", dimensions.height.toString());
        
        // Add default resize parameters
        formData.append("mode", RESIZE_PARAMS.mode);
        formData.append("keep_ratio", RESIZE_PARAMS.keep_ratio);
        formData.append("resampling", RESIZE_PARAMS.resampling);
        
        if (dimensions.tool) {
          formData.append("tool", dimensions.tool);
        }
      }

      const response = await fetchWithRetry(
        API_URL,
        {
          method: 'POST',
          body: formData,
        }
      );

      const blob = await response.blob();
      resultUrl = URL.createObjectURL(blob);
    });

    if (!resultUrl) {
      throw new Error('Failed to process image');
    }

    success = true;
    return resultUrl;
  } catch (error) {
    success = false;
    console.error('Error removing background:', error);
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