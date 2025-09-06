import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import { Header, refreshHeaderStats } from './components/Header';
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
import { supabase } from './lib/supabase';
import { removeBackground, cancelAllProcessing, cleanupAllResources } from './services/api';
import { loadImagesMetadata } from './services/imageService';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { GDPR } from './pages/GDPR';
import type { ImageFile } from './types';
import JSZip from 'jszip';

function MainAppContent() {
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('bria');
  const [isDragging, setIsDragging] = useState(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [processingBatch, setProcessingBatch] = useState(false);
  const cancelProcessingRef = useRef(false);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number; tool?: string; mode?: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null>({
    width: 1000,
    height: 1500,
    tool: 'imagemagick',
    mode: 'ai'
  });
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isImageLimit, setIsImageLimit] = useState(false);
  const [hasWhiteBackground, setHasWhiteBackground] = useState(false);
  const { logProcessingOperation, canProcess, remainingProcesses, resetCount } = useUsageStore();
  const { user } = useAuthStore();
  const { settings, loadSettings } = useAdminSettingsStore();

  useEffect(() => {
    document.body.classList.add('dark');
    // Charger les paramètres admin au démarrage
    loadSettings();

    // Cleanup function to be called when the component unmounts or page unloads
    const handleBeforeUnload = () => {
      cleanupAllResources();
    };

    // Add event listeners for cleanup
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function for React useEffect
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupAllResources();
    };
  }, [loadSettings]);

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
      model: selectedModel,
      processingMode: outputDimensions?.mode || 'ai'
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
    // VÉRIFICATION RADICALE : Arrêter immédiatement si suppression demandée
    if (cancelProcessingRef.current) {
      throw new Error('Request cancelled by user');
    }
    
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
    
    // RÉSERVATION ATOMIQUE DU QUOTA : Pré-incrémenter pour éviter les race conditions
    const { isAuthenticated, incrementCount, processCount, maxFreeImages } = useUsageStore.getState();
    let operationsCount = 1; // Default pour mode AI simple
    
    // EXCEPTION ADMIN : Vérifier si l'utilisateur est admin via RPC
    let isAdmin = false;
    if (isAuthenticated && user) {
      try {
        const { data: quotaData } = await supabase.rpc('check_user_quota', {
          p_user_id: user.id,
          p_operations_count: 0
        });
        // Les admins ont des quotas très élevés (999999+)
        isAdmin = quotaData?.limit >= 999999;
      } catch (error) {
        console.warn('Could not check admin status:', error);
      }
    }
    
    // Calculer le nombre d'opérations nécessaires
    if (outputDimensions?.mode === 'both') {
      operationsCount = 2; // bg_removal + resize
    } else if (outputDimensions?.mode === 'crop-head' && outputDimensions.width && outputDimensions.height) {
      operationsCount = 2; // head_crop + resize
    } else if (outputDimensions?.mode === 'all') {
      operationsCount = 3; // head_crop + resize + bg_removal
    }
    
    // EXCEPTION ADMIN : Les admins ont un quota illimité
    if (isAdmin) {
      console.log('Admin user detected - bypassing quota limits');
    } else {
      // Vérification atomique pour utilisateurs non-authentifiés
      if (!isAuthenticated) {
        const currentCount = processCount;
        if (currentCount + operationsCount > maxFreeImages) {
          console.warn(`Quota would be exceeded: ${currentCount + operationsCount} > ${maxFreeImages}`);
          setSelectedFiles(prev => prev.filter(f => f.id !== file.id));
          const remaining = await remainingProcesses();
          if (remaining === 0) {
            setShowLimitModal(true);
          }
          return;
        }
        
        // Pré-réserver le quota
        for (let i = 0; i < operationsCount; i++) {
          incrementCount();
        }
      }
    }
    
    // Vérifier encore une fois avant de continuer
    if (cancelProcessingRef.current) {
      // Restaurer le quota si annulé (sauf pour les admins)
      if (!isAuthenticated && !isAdmin) {
        const currentState = useUsageStore.getState();
        useUsageStore.setState({ 
          processCount: Math.max(0, currentState.processCount - operationsCount) 
        });
      }
      throw new Error('Request cancelled by user');
    }

    setSelectedFiles(prev => 
      prev.map(f => f.id === file.id ? {...f, status: 'processing', model: selectedModel} : f)
    );
    
    // Update header stats when starting processing
    refreshHeaderStats();

    try {
      const startTime = performance.now();
      const result = await removeBackground(file.file, selectedModel, outputDimensions);
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Le quota a déjà été pré-réservé, donc pas besoin de re-vérifier
      // Log operations individually based on actual API calls (pour statistiques uniquement)
      const operations = [];
      
      if (outputDimensions?.mode === 'ai') {
        // API call: remove_bg=true
        operations.push('bg_removal');
      } else if (outputDimensions?.mode === 'resize') {
        // API call: resize=true + width + height + mode=fit + keep_ratio=true
        operations.push('resize');
      } else if (outputDimensions?.mode === 'both') {
        // API call: remove_bg=true + resize=true + width + height + mode=fit + keep_ratio=true
        operations.push('bg_removal', 'resize');
      } else if (outputDimensions?.mode === 'crop-head') {
        // API call: crop_mouth=true [+ resize=true if dimensions provided]
        if (outputDimensions.width && outputDimensions.height) {
          operations.push('head_crop', 'resize'); // crop_mouth=true + resize=true
        } else {
          operations.push('head_crop'); // crop_mouth=true only
        }
      } else if (outputDimensions?.mode === 'crop-head-ai') {
        // API calls séquentielles: 
        // 1) crop_mouth=true (couper la tête)
        // 2) remove_bg=true (supprimer le fond sur l'image coupée)
        operations.push('head_crop', 'bg_removal');
      } else if (outputDimensions?.mode === 'all') {
        // API calls: 
        // 1) crop_mouth=true + resize=true + width + height + mode=fit + keep_ratio=true
        // 2) remove_bg=true (on result of step 1)
        operations.push('head_crop', 'resize', 'bg_removal');
      } else {
        // Default fallback
        operations.push('bg_removal');
      }

      // Log each operation individually pour les statistiques (quota déjà consommé)
      for (const operationType of operations) {
        try {
          await logProcessingOperation(
            operationType,
            1, // Always 1 for individual operations
            true,
            Math.round(processingTime / operations.length), // Distribute processing time
            file.file.size
          );
        } catch (error) {
          // Ignorar les erreurs de logging - le quota a déjà été consommé
          console.warn('Failed to log operation:', operationType, error);
        }
      }

      setSelectedFiles(prev => 
        prev.map(f => f.id === file.id ? {
          ...f,
          status: 'completed',
          result: result.url,
          model: selectedModel,
          processingMode: outputDimensions?.mode || 'ai',
          dimensions: {
            width: result.width,
            height: result.height,
            original: f.dimensions?.original || {
              width: result.width,
              height: result.height
            }
          }
        } : f)
      );
      setTotalProcessed(prev => prev + 1);
      
      // Update header stats in real-time
      refreshHeaderStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      
      // RESTAURER LE QUOTA PRÉ-RÉSERVÉ en cas d'erreur (sauf pour les admins)
      if (!isAuthenticated && !isAdmin) {
        const currentState = useUsageStore.getState();
        useUsageStore.setState({ 
          processCount: Math.max(0, currentState.processCount - operationsCount) 
        });
      }
      
      // Log all failed operations individually based on actual API calls
      const failedOperations = [];
      
      if (outputDimensions?.mode === 'ai') {
        // API call: remove_bg=true
        failedOperations.push('bg_removal');
      } else if (outputDimensions?.mode === 'resize') {
        // API call: resize=true + width + height + mode=fit + keep_ratio=true
        failedOperations.push('resize');
      } else if (outputDimensions?.mode === 'both') {
        // API call: remove_bg=true + resize=true + width + height + mode=fit + keep_ratio=true
        failedOperations.push('bg_removal', 'resize');
      } else if (outputDimensions?.mode === 'crop-head') {
        // API call: crop_mouth=true [+ resize=true if dimensions provided]
        if (outputDimensions.width && outputDimensions.height) {
          failedOperations.push('head_crop', 'resize'); // crop_mouth=true + resize=true
        } else {
          failedOperations.push('head_crop'); // crop_mouth=true only
        }
      } else if (outputDimensions?.mode === 'all') {
        // API calls: 
        // 1) crop_mouth=true + resize=true + width + height + mode=fit + keep_ratio=true
        // 2) remove_bg=true (on result of step 1)
        failedOperations.push('head_crop', 'resize', 'bg_removal');
      } else {
        // Default fallback
        failedOperations.push('bg_removal');
      }

      // Pour les erreurs, ne pas logguer d'opérations car le quota a été restauré
      // Les échecs ne doivent pas consommer de quota

      setSelectedFiles(prev => 
        prev.map(f => f.id === file.id ? {
          ...f, 
          status: 'error', 
          error: errorMessage,
          model: selectedModel
        } : f)
      );
      
      // Update header stats even on error
      refreshHeaderStats();
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

    // Si remaining est -1, cela signifie illimité, donc traiter tous les fichiers
    const filesToProcess = remaining === -1 ? pendingFiles : pendingFiles.slice(0, remaining);
    
    setProcessingBatch(true);
    cancelProcessingRef.current = false; // Reset cancel flag
    setTotalProcessed(0);
    setTotalToProcess(filesToProcess.length);
    
    for (const file of filesToProcess) {
      // Check if processing was cancelled
      if (cancelProcessingRef.current) {
        break;
      }
      
      const canProcessImage = await canProcess();
      
      // Check again after async operation
      if (cancelProcessingRef.current) {
        break;
      }
      
      if (!canProcessImage) {
        break;
      }
      
      try {
        await processImage(file);
        // Check again after processing
        if (cancelProcessingRef.current) {
          break;
        }
      } catch (error) {
        // If error is due to cancellation, stop processing
        if (error.message === 'Request cancelled by user' || error.message === 'Request cancelled') {
          break;
        }
        // Otherwise, the error is already handled in processImage
      }
    }
    setProcessingBatch(false);
    cancelProcessingRef.current = false;

    // Update header stats after batch processing
    refreshHeaderStats();

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

      const response = await fetch(file.result);
      const blob = await response.blob();

      // Convert to JPG with white background
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });

      canvas.width = img.width;
      canvas.height = img.height;

      // Add white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const jpgBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });

      // Use original filename but change extension to .jpg
      const originalName = file.file.name;
      const fileName = originalName.substring(0, originalName.lastIndexOf('.')) + '.jpg';
      zip.file(fileName, jpgBlob);

      // Cleanup
      URL.revokeObjectURL(img.src);
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

  const handleDeleteAll = () => {
    // SOLUTION INVISIBLE : Arrêt complet sans que l'utilisateur s'en aperçoive
    
    // 1. Flag d'arrêt immédiat
    cancelProcessingRef.current = true;
    
    // 2. Sauvegarder les références pour nettoyage
    const filesToClean = [...selectedFiles];
    
    // 3. Vider TOUT immédiatement pour l'UI
    setSelectedFiles([]);
    setTotalProcessed(0);
    setTotalToProcess(0);
    setProcessingBatch(false);
    
    // 4. Annuler toutes les requêtes HTTP en cours et nettoyer toutes les ressources
    cleanupAllResources();
    
    // 5. Reset du compteur si pas authentifié
    if (!user) {
      resetCount();
    }
    
    // 6. Nettoyage en arrière-plan (invisible pour l'utilisateur)
    // Utilisation de requestIdleCallback pour ne pas bloquer l'UI
    const cleanupInBackground = () => {
      filesToClean.forEach(file => {
        try {
          URL.revokeObjectURL(file.preview);
          if (file.result) {
            URL.revokeObjectURL(file.result);
          }
        } catch (e) {
          // Ignorer silencieusement
        }
      });
      
      // Forcer le garbage collector en supprimant les références
      filesToClean.length = 0;
    };
    
    // Exécuter le nettoyage quand le navigateur est idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cleanupInBackground);
    } else {
      // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
      setTimeout(cleanupInBackground, 0);
    }
    
    // 7. Reset du flag après un court délai pour permettre de nouveaux traitements
    setTimeout(() => {
      cancelProcessingRef.current = false;
    }, 500);
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

  const handleApplyResize = (dimensions: { width: number; height: number; tool: string; mode: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null) => {
    setOutputDimensions(dimensions);
  };

  const handleApplyWhiteBackground = () => {
    setHasWhiteBackground(!hasWhiteBackground);
  };

  const hasPendingFiles = selectedFiles.some(f => f.status === 'pending');
  const hasCompletedFiles = selectedFiles.some(f => f.status === 'completed');
  const pendingCount = selectedFiles.filter(f => f.status === 'pending').length;
  // Adapter le nombre d'empty frames selon la taille de l'écran
  const getEmptyFramesCount = () => {
    const width = window.innerWidth;
    if (width >= 1536) return 24; // 2xl: 8 colonnes x 3 lignes
    if (width >= 1280) return 18; // xl: 6 colonnes x 3 lignes
    if (width >= 1024) return 15; // lg: 5 colonnes x 3 lignes
    if (width >= 768) return 12;  // md: 4 colonnes x 3 lignes
    if (width >= 640) return 9;   // sm: 3 colonnes x 3 lignes
    return 6; // mobile: 2 colonnes x 3 lignes
  };
  
  const emptyFramesCount = Math.max(getEmptyFramesCount(), selectedFiles.length + 1);
  const emptyFrames = Array(Math.max(0, emptyFramesCount - selectedFiles.length)).fill(null);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header onShowGuide={() => setShowGuideModal(true)} />
      
      <main className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <ImageUploader
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
        />

        <div className="mt-4 sm:mt-6">
          <ModelSelector
            onSubmit={handleSubmit}
            hasPendingFiles={hasPendingFiles}
            hasCompletedFiles={hasCompletedFiles}
            onDownloadAllJpg={downloadAllAsJpg}
            onDeleteAll={handleDeleteAll}
            isProcessing={processingBatch}
            totalToProcess={totalToProcess}
            completed={totalProcessed}
            pendingCount={pendingCount}
            onApplyResize={handleApplyResize}
            outputDimensions={outputDimensions}
            hasWhiteBackground={hasWhiteBackground}
            onApplyWhiteBackground={handleApplyWhiteBackground}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mt-4 sm:mt-6">
          {selectedFiles.map(file => (
            <ImagePreview
              key={file.id}
              file={file}
              onRemove={removeFile}
              onProcess={processImage}
              outputDimensions={outputDimensions}
              hasWhiteBackground={hasWhiteBackground}
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

      {/* Modals */}
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

function MainApp() {
  return <MainAppContent />;
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