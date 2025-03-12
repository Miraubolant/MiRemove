import { compressImage } from './imageCompression';

const cache = new Map<string, string>();
const API_BASE_URL = 'https://api.miraubolant.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

// Clé API pour l'authentification
const API_KEY = '1dee46089112c4983018e8a206c2c95b33630aeb32f2cb9a7805103360f89f8b';
const API_KEY_SECRET = import.meta.env.VITE_API_KEY_SECRET;

function generateCacheKey(file: File, model: string, dimensions?: { width: number; height: number }): string {
  const dimensionKey = dimensions ? `-${dimensions.width}x${dimensions.height}` : '';
  return `${file.name}-${file.size}-${file.lastModified}-${model}${dimensionKey}`;
}

async function generateSignature(timestamp: string): Promise<string> {
  const message = `${API_KEY}:${timestamp}:${API_KEY_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  // Utiliser l'API Web Crypto pour générer un hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await generateSignature(timestamp);

    const headers = new Headers(options.headers);
    headers.set('X-API-Key', API_KEY);
    headers.set('X-Timestamp', timestamp);
    headers.set('X-Signature', signature);

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    await wait(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Backoff exponentiel
    return fetchWithRetry(url, options, retries - 1);
  }
}

export async function removeBackground(
  file: File, 
  model: string = 'bria',
  dimensions?: { width: number; height: number }
): Promise<string> {
  const startTime = performance.now();
  let success = false;
  const cacheKey = generateCacheKey(file, model, dimensions);
  
  try {
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      success = true;
      return cachedResult;
    }

    const compressedFile = await compressImage(file, {
      maxWidth: dimensions?.width || 2048,
      maxHeight: dimensions?.height || 2048,
      quality: 0.8,
      maxSizeMB: 10
    });

    const formData = new FormData();
    formData.append("image", compressedFile);
    formData.append("model", model);

    const response = await fetchWithRetry(`${API_BASE_URL}/remove-background`, {
      method: 'POST',
      body: formData
    });

    const blob = await response.blob();
    
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
        
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        const resizedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        
        const resultUrl = URL.createObjectURL(resizedBlob);
        cache.set(cacheKey, resultUrl);
        URL.revokeObjectURL(img.src);
        
        success = true;
        return resultUrl;
      }
    }

    const resultUrl = URL.createObjectURL(blob);
    cache.set(cacheKey, resultUrl);

    success = true;
    return resultUrl;
  } catch (error) {
    success = false;
    console.error('Erreur lors du traitement de l\'image:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('name resolution')) {
        throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.');
      }
      throw error;
    }
    throw new Error('Une erreur inattendue est survenue lors du traitement de l\'image.');
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