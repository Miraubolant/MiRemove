const cache = new Map<string, string>();

function generateCacheKey(file: File, model: string): string {
  return `${file.name}-${file.size}-${file.lastModified}-${model}`;
}

export async function removeBackground(file: File, model: string): Promise<string> {
  const cacheKey = generateCacheKey(file, model);
  
  // Check cache
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("model", model);

  const response = await fetch('https://api.miraubolant.com/remove-background', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Échec de la suppression du fond');
  }

  const blob = await response.blob();
  const resultUrl = URL.createObjectURL(blob);
  
  // Store in cache
  cache.set(cacheKey, resultUrl);

  return resultUrl;
}