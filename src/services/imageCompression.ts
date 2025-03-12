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

export async function convertWebPToJPG(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Si ce n'est pas un WebP, retourner le fichier original
    if (!file.type.includes('webp')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Impossible de créer le contexte canvas'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Échec de la conversion en JPG'));
            return;
          }

          // Créer un nouveau fichier avec l'extension .jpg
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
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image WebP'));
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function compressImage(
  file: File,
  options: CompressionOptions = DEFAULT_OPTIONS
): Promise<File> {
  // Convertir d'abord le WebP en JPG si nécessaire
  const processedFile = await convertWebPToJPG(file);

  // Si l'image est déjà assez petite, on la retourne telle quelle
  if (processedFile.size <= (options.maxSizeMB || DEFAULT_OPTIONS.maxSizeMB!) * 1024 * 1024) {
    return processedFile;
  }

  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Impossible de créer le contexte canvas');
  }

  // Charger l'image
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = URL.createObjectURL(processedFile);
  });

  // Calculer les dimensions optimales
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

  // Redimensionner l'image
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Libérer la mémoire
  URL.revokeObjectURL(img.src);

  // Compression progressive
  let quality = options.quality || DEFAULT_OPTIONS.quality!;
  let blob = await new Promise<Blob>(resolve => {
    canvas.toBlob(
      b => resolve(b!),
      'image/jpeg',
      quality
    );
  });

  // Réduire progressivement la qualité jusqu'à atteindre la taille cible
  while (
    blob.size > (options.maxSizeMB || DEFAULT_OPTIONS.maxSizeMB!) * 1024 * 1024 &&
    quality > 0.1
  ) {
    quality -= 0.1;
    blob = await new Promise<Blob>(resolve => {
      canvas.toBlob(
        b => resolve(b!),
        'image/jpeg',
        quality
      );
    });
  }

  // Créer un nouveau fichier avec les métadonnées appropriées
  return new File([blob], processedFile.name, {
    type: 'image/jpeg',
    lastModified: processedFile.lastModified
  });
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}