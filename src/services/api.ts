import { compressImage } from './imageCompression';

// Implement request queue with concurrency control and retries
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

// Implement LRU cache with automatic cleanup
class LRUCache {
  private cache: Map<string, string>;
  private maxSize: number;
  private cleanupInterval: number;

  constructor(maxSize = 50, cleanupInterval = 300000) { // 5 minutes default cleanup
    this.cache = new Map();
    this.maxSize = maxSize;
    this.cleanupInterval = cleanupInterval;
    this.startCleanup();
  }

  private startCleanup() {
    setInterval(() => {
      if (this.cache.size > this.maxSize / 2) {
        const entriesToRemove = Math.floor(this.cache.size / 4);
        const entries = Array.from(this.cache.entries());
        for (let i = 0; i < entriesToRemove; i++) {
          const [key, url] = entries[i];
          URL.revokeObjectURL(url);
          this.cache.delete(key);
        }
      }
    }, this.cleanupInterval);
  }

  get(key: string): string | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      const url = this.cache.get(firstKey);
      if (url) URL.revokeObjectURL(url);
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.forEach(url => URL.revokeObjectURL(url));
    this.cache.clear();
  }
}

// Initialize queue and cache
const requestQueue = new RequestQueue(3);
const cache = new LRUCache(50);

// Implement request timeout and retry with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  baseTimeout = 30000,
  backoffFactor = 2
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

      // Exponential backoff with jitter
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

function generateCacheKey(file: File, model: string, dimensions?: { width: number; height: number }): string {
  const dimensionKey = dimensions ? `-${dimensions.width}x${dimensions.height}` : '';
  return `${file.name}-${file.size}-${file.lastModified}-${model}${dimensionKey}`;
}

export async function removeBackground(
  file: File, 
  model: string = 'bria',
  dimensions?: { width: number; height: number },
  resizeOption?: { type: string; width: number; height: number }
): Promise<string> {
  const startTime = performance.now();
  let success = false;
  const cacheKey = generateCacheKey(file, model, dimensions);
  
  try {
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      success = true;
      return cachedResult;
    }

    // Compress image before processing
    const compressedFile = await compressImage(file, {
      maxWidth: dimensions?.width || 2048,
      maxHeight: dimensions?.height || 2048,
      quality: 0.8,
      maxSizeMB: 10
    });

    let resultUrl: string | undefined;

    // Queue the API request with retries
    await requestQueue.add(async () => {
      const formData = new FormData();
      formData.append("image", compressedFile);
      formData.append("model", model);

      // If resize option is selected, process with XnConvert API first
      if (resizeOption && resizeOption.type !== 'none') {
        const resizeFormData = new FormData();
        resizeFormData.append("image", compressedFile);
        resizeFormData.append("width", resizeOption.width.toString());
        resizeFormData.append("height", resizeOption.height.toString());
        resizeFormData.append("format", "jpg");
        resizeFormData.append("resize_mode", "fit");
        resizeFormData.append("keep_ratio", "true");
        resizeFormData.append("resampling", "hanning");
        resizeFormData.append("crop_position", "center");
        resizeFormData.append("bg_color", "white");
        resizeFormData.append("bg_alpha", "255");

        const resizeResponse = await fetchWithRetry(
          `https://xnconvert.miraubolant.com/process/${resizeOption.type}`,
          {
            method: 'POST',
            body: resizeFormData,
          }
        );

        const resizedBlob = await resizeResponse.blob();
        formData.set("image", resizedBlob);
      }

      const response = await fetchWithRetry(
        'https://api.miraubolant.com/remove-background',
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

    cache.set(cacheKey, resultUrl);
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