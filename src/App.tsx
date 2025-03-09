import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HelpSection } from './components/HelpSection';
import { ModelSelector } from './components/ModelSelector';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { EmptyFrame } from './components/EmptyFrame';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ProgressBar } from './components/ProgressBar';
import { models } from './constants';
import { removeBackground } from './services/api';
import type { ImageFile } from './types';
import JSZip from 'jszip';

function App() {
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('isnet-general-use');
  const [isDragging, setIsDragging] = useState(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number } | null>(null);
  const [hasWhiteBackground, setHasWhiteBackground] = useState(false);

  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newFiles = imageFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
      backgroundColor: hasWhiteBackground ? '#FFFFFF' : 'transparent',
      model: selectedModel
    }));
    setSelectedFiles(prev => [...newFiles, ...prev]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    
    setSelectedFiles(prev => prev.map(file => ({
      ...file,
      model: file.status === 'pending' ? newModel : file.model
    })));
  };

  const handleImageModelChange = (fileId: string, newModel: string) => {
    setSelectedFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          model: newModel,
          status: 'pending',
          result: undefined,
          error: undefined
        };
      }
      return file;
    }));
  };

  const processImage = async (file: ImageFile) => {
    const modelToUse = file.model || selectedModel;
    
    setSelectedFiles(prev => 
      prev.map(f => f.id === file.id ? {...f, status: 'processing', model: modelToUse} : f)
    );

    try {
      const result = await removeBackground(file.file, modelToUse, outputDimensions);
      setSelectedFiles(prev => 
        prev.map(f => f.id === file.id ? {...f, status: 'completed', result, model: modelToUse} : f)
      );
      setTotalProcessed(prev => prev + 1);
    } catch (err) {
      setSelectedFiles(prev => 
        prev.map(f => f.id === file.id ? {
          ...f, 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Une erreur est survenue',
          model: modelToUse
        } : f)
      );
      // Don't increment totalProcessed on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pendingFiles = selectedFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setProcessingBatch(true);
    setTotalProcessed(0);
    
    for (const file of pendingFiles) {
      await processImage(file);
    }

    setProcessingBatch(false);
  };

  const downloadAllAsJpg = async () => {
    const completedFiles = selectedFiles.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) return;

    const zip = new JSZip();

    for (const file of completedFiles) {
      if (!file.result) continue;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = file.result!;
      });

      const width = outputDimensions?.width || img.width;
      const height = outputDimensions?.height || img.height;

      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });

      const fileName = `${file.file.name.split('.')[0]}.jpg`;
      zip.file(fileName, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleWhiteBackground = () => {
    setHasWhiteBackground(!hasWhiteBackground);
    setSelectedFiles(prev => prev.map(file => ({
      ...file,
      backgroundColor: !hasWhiteBackground ? '#FFFFFF' : 'transparent'
    })));
  };

  const removeFile = (id: string) => {
    const file = selectedFiles.find(f => f.id === id);
    if (file) {
      URL.revokeObjectURL(file.preview);
      if (file.result) {
        URL.revokeObjectURL(file.result);
      }
    }
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleBackgroundColorChange = (id: string, color: string) => {
    setSelectedFiles(prev =>
      prev.map(f => f.id === id ? { ...f, backgroundColor: color } : f)
    );
  };

  const hasPendingFiles = selectedFiles.some(f => f.status === 'pending');
  const hasCompletedFiles = selectedFiles.some(f => f.status === 'completed');
  const pendingFiles = selectedFiles.filter(f => f.status === 'pending');
  const emptyFramesCount = Math.max(12, selectedFiles.length + 1);
  const emptyFrames = Array(emptyFramesCount - selectedFiles.length).fill(null);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HelpSection />

        <div className="sticky top-[80px] z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-gray-800 shadow-lg">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            onSubmit={handleSubmit}
            models={models}
            hasPendingFiles={hasPendingFiles}
            hasCompletedFiles={hasCompletedFiles}
            onDownloadAllJpg={downloadAllAsJpg}
            onDimensionsChange={setOutputDimensions}
            onApplyWhiteBackground={toggleWhiteBackground}
            hasWhiteBackground={hasWhiteBackground}
          />
        </div>

        <div className="mt-8">
          {processingBatch && (
            <div className="mb-8">
              <ProgressBar
                total={pendingFiles.length}
                completed={totalProcessed}
              />
            </div>
          )}

          <ImageUploader
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {selectedFiles.map(file => (
              <ImagePreview
                key={file.id}
                file={file}
                onRemove={removeFile}
                onBackgroundColorChange={handleBackgroundColorChange}
                onProcess={processImage}
                selectedModel={selectedModel}
                models={models}
                onModelChange={handleImageModelChange}
                outputDimensions={outputDimensions}
              />
            ))}
            {emptyFrames.map((_, index) => (
              <EmptyFrame
                key={`empty-${index}`}
                onFileChange={handleFileChange}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;