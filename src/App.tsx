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

function App() {
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('silueta');
  const [isDragging, setIsDragging] = useState(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

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
      backgroundColor: 'transparent'
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
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
    setSelectedModel(e.target.value);
  };

  const processImage = async (file: ImageFile) => {
    setSelectedFiles(prev => 
      prev.map(f => f.id === file.id ? {...f, status: 'processing'} : f)
    );

    try {
      const result = await removeBackground(file.file, selectedModel);
      setSelectedFiles(prev => 
        prev.map(f => f.id === file.id ? {...f, status: 'completed', result} : f)
      );
      setTotalProcessed(prev => prev + 1);
    } catch (err) {
      setSelectedFiles(prev => 
        prev.map(f => f.id === file.id ? {
          ...f, 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Une erreur est survenue'
        } : f)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pendingFiles = selectedFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setProcessingBatch(true);
    setTotalProcessed(0);
    setStartTime(Date.now());
    
    for (const [index, file] of pendingFiles.entries()) {
      await processImage(file);

      // Calculer le temps estimé restant
      if (startTime && index > 0) {
        const elapsed = Date.now() - startTime;
        const averageTimePerFile = elapsed / (index + 1);
        const remainingFiles = pendingFiles.length - (index + 1);
        const estimated = Math.round(averageTimePerFile * remainingFiles / 1000);
        setEstimatedTime(estimated);
      }
    }

    setProcessingBatch(false);
    setStartTime(null);
    setEstimatedTime(null);
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
  const pendingFiles = selectedFiles.filter(f => f.status === 'pending');
  const emptyFramesCount = Math.max(12, selectedFiles.length + 1);
  const emptyFrames = Array(emptyFramesCount - selectedFiles.length).fill(null);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} secondes`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} seconde${remainingSeconds > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-200 mb-4">
            Supprimez l'arrière-plan de vos images
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Utilisez l'intelligence artificielle pour supprimer automatiquement l'arrière-plan de vos images en quelques secondes
          </p>
        </div>

        <HelpSection />

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mt-8">
          <div className="p-8 border-b border-gray-700">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              onSubmit={handleSubmit}
              models={models}
              hasPendingFiles={hasPendingFiles}
            />
            {processingBatch && (
              <div className="mt-4">
                <ProgressBar
                  total={pendingFiles.length}
                  completed={totalProcessed}
                />
                <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                  <p>{totalProcessed} sur {pendingFiles.length} images traitées</p>
                  {estimatedTime !== null && (
                    <p>Temps restant estimé : {formatTime(estimatedTime)}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
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
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;