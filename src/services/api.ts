import { compressImage } from './imageCompression';
import { fetchCoolifyEnvVars } from './coolify';

const cache = new Map<string, string>();
const API_BASE_URL = 'https://api.miraubolant.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

// Initialiser les clés API
let API_KEY = import.meta.env.VITE_API_KEY;
let API_KEY_SECRET = import.meta.env.VITE_API_KEY_SECRET;

// Fonction pour mettre à jour les clés API
export async function initializeApiKeys() {
  try {
    const envVars = await fetchCoolifyEnvVars();
    API_KEY = envVars.VITE_API_KEY || API_KEY;
    API_KEY_SECRET = envVars.VITE_API_KEY_SECRET || API_KEY_SECRET;

    if (!API_KEY || !API_KEY_SECRET) {
      console.error('Les clés API ne sont pas définies dans les variables d\'environnement');
      throw new Error('Les clés API ne sont pas configurées. Veuillez contacter l\'administrateur.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des clés API:', error);
    throw error;
  }
}

function generateCacheKey(file: File, model: string, dimensions?: { width: number; height: number }): string {
  const dimensionKey = dimensions ? `-${dimensions.width}x${dimensions.height}` : '';
  return `${file.name}-${file.size}-${file.lastModified}-${model}${dimensionKey}`;
}

async function generateSignature(timestamp: string): Promise<string> {
  if (!API_KEY || !API_KEY_SECRET) {
    throw new Error('Les clés API ne sont pas configurées. Veuillez contacter l\'administrateur.');
  }

  const message = `${API_KEY}:${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${message}:${API_KEY_SECRET}`);
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
    if (!API_KEY || !API_KEY_SECRET) {
      await initializeApiKeys();
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await generateSignature(timestamp);

    const headers = new Headers({
      'X-API-Key': API_KEY,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'Origin': window.location.origin,
      'Accept': 'image/png, application/json',
      ...options.headers
    });

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'same-origin'
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

    const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
    console.log(`Tentative échouée, nouvelle tentative dans ${delay}ms...`);
    await wait(delay);
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
    if (!API_KEY || !API_KEY_SECRET) {
      await initializeApiKeys();
    }

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
      if (error.message.includes('Les clés API ne sont pas configurées')) {
        throw new Error('Les clés API ne sont pas configurées. Veuillez contacter l\'administrateur.');
      }
      if (error.message.includes('Authentification invalide')) {
        throw new Error('Erreur d\'authentification. Veuillez réessayer.');
      }
      if (error.message.includes('name resolution')) {
        throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.');
      }
      if (error.message.includes('blocked by CORS policy')) {
        throw new Error('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
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