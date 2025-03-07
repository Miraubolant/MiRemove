export interface ImageFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  preview: string;
  result?: string;
  error?: string;
  backgroundColor?: string;
  metadata?: {
    size: string;
    dimensions?: { width: number; height: number };
    type: string;
  };
}

export interface Model {
  id: string;
  name: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
}