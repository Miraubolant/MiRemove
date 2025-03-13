import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { ModelSelector } from './components/ModelSelector';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { EmptyFrame } from './components/EmptyFrame';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { StatsProvider } from './contexts/StatsContext';
import { LimitModal } from './components/LimitModal';
import { AuthModal } from './components/AuthModal';
import { QuickGuideModal } from './components/QuickGuideModal';
import { CookieConsent } from './components/CookieConsent';
import { useUsageStore } from './stores/usageStore';
import { useAuthStore } from './stores/authStore';
import { useAdminSettingsStore } from './stores/adminSettingsStore';
import { removeBackground } from './services/api';
import { loadImagesMetadata } from './services/imageService';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { GDPR } from './pages/GDPR';
import type { ImageFile } from './types';
import JSZip from 'jszip';

function MainApp() {
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('bria');
  const [isDragging, setIsDragging] = useState(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number } | null>(null);
  const [hasWhiteBackground, setHasWhiteBackground] = useState(false);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isImageLimit, setIsImageLimit] = useState(false);
  const { incrementCount, canProcess, remainingProcesses } = useUsageStore();
  const { user } = useAuthStore();
  const { settings } = useAdminSettingsStore();

  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newFiles = imageFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
      backgroundColor: hasWhiteBackground ? '#FFFFFF' : 'transparent',
      model: selectedModel
    }));

    const filesWithMetadata = await loadImagesMetadata(newFiles);
    setSelectedFiles(prev => [...filesWithMetadata, ...prev]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      await addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processImage = async (file: ImageFile) => {
    const canProcessImage = await canProcess();
    if (!canProcessImage) {
      const remaining = await remainingProcesses();
      if (remaining === 0) {
        if (user) {
          setIsImageLimit(true);
        }
        setShowLimitModal(true);
      }
      return;
    }

    setSelectedFiles(prev => 
      prev.map(f => f.id === file.id ? {...f, status: 'processing', model: selectedModel} : f)
    );

    try {
      const result = await removeBackground(file.file, selectedModel, outputDimensions);
      setSelectedFiles(prev => 
        prev.map(f => f.id === file.id ? {...f, status: 'completed', result, model: selectedModel} : f)
      );
      setTotalProcessed(prev => prev + 1);
      incrementCount();
    } catch (err) {
      setSelectedFiles(prev => 
        prev.map(f => f.id === file.id ? {
          ...f, 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Une erreur est survenue',
          model: selectedModel
        } : f)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pendingFiles = selectedFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    const remaining = await remainingProcesses();
    if (remaining === 0) {
      if (user) {
        setIsImageLimit(true);
      }
      setShowLimitModal(true);
      return;
    }

    const filesToProcess = pendingFiles.slice(0, remaining);
    
    setProcessingBatch(true);
    setTotalProcessed(0);
    setTotalToProcess(filesToProcess.length);
    
    for (const file of filesToProcess) {
      const canProcessImage = await canProcess();
      if (!canProcessImage) {
        break;
      }
      await processImage(file);
    }

    setProcessingBatch(false);

    const newRemaining = await remainingProcesses();
    if (newRemaining === 0) {
      if (user) {
        setIsImageLimit(true);
      }
      setShowLimitModal(true);
    }
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
  const pendingCount = selectedFiles.filter(f => f.status === 'pending').length;
  const emptyFramesCount = Math.max(12, selectedFiles.length + 1);
  const emptyFrames = Array(emptyFramesCount - selectedFiles.length).fill(null);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header onShowGuide={() => setShowGuideModal(true)} />

      <main className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        <ImageUploader
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
        />

        <div className="mt-8">
          <ModelSelector
            onSubmit={handleSubmit}
            hasPendingFiles={hasPendingFiles}
            hasCompletedFiles={hasCompletedFiles}
            onDownloadAllJpg={downloadAllAsJpg}
            onApplyWhiteBackground={toggleWhiteBackground}
            hasWhiteBackground={hasWhiteBackground}
            isProcessing={processingBatch}
            totalToProcess={totalToProcess}
            completed={totalProcessed}
            pendingCount={pendingCount}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-8">
          {selectedFiles.map(file => (
            <ImagePreview
              key={file.id}
              file={file}
              onRemove={removeFile}
              onBackgroundColorChange={handleBackgroundColorChange}
              onProcess={processImage}
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
      </main>

      <Footer />
      <ScrollToTop />

      {showLimitModal && (
        <LimitModal
          onClose={() => setShowLimitModal(false)}
          onLogin={() => {
            setShowLimitModal(false);
            setShowAuthModal(true);
          }}
          isImageLimit={isImageLimit}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showGuideModal && (
        <QuickGuideModal
          onClose={() => setShowGuideModal(false)}
        />
      )}

      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <Router>
      <StatsProvider>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/gdpr" element={<GDPR />} />
        </Routes>
      </StatsProvider>
    </Router>
  );
}

export default App;