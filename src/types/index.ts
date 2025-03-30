export interface ImageFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  preview: string;
  result?: string;
  error?: string;
  metadata?: {
    size: string;
    dimensions?: { width: number; height: number };
    type: string;
  };
  model?: string;
  dimensions?: {
    width: number;
    height: number;
    original: {
      width: number;
      height: number;
    };
  };
  processingMode?: 'resize' | 'ai' | 'both';
}

export interface Model {
  id: string;
  name: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
}