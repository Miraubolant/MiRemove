import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelSelector } from '../../components/ModelSelector';

// Mock the stores
jest.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@test.com' }
  })
}));

jest.mock('../../stores/adminSettingsStore', () => ({
  useAdminSettingsStore: () => ({
    settings: { free_user_max_images: 10 }
  })
}));

describe('ModelSelector', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    hasPendingFiles: true,
    hasCompletedFiles: true,
    onDownloadAllJpg: jest.fn(),
    onDeleteAll: jest.fn(),
    isProcessing: false,
    totalToProcess: 5,
    completed: 2,
    pendingCount: 3,
    onApplyResize: jest.fn(),
    outputDimensions: null,
    hasWhiteBackground: false,
    onApplyWhiteBackground: jest.fn()
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the main processing button', () => {
    render(<ModelSelector {...defaultProps} />);
    expect(screen.getByRole('button', { name: /traiter les images/i })).toBeInTheDocument();
  });

  it('shows pending count when there are pending files', () => {
    render(<ModelSelector {...defaultProps} pendingCount={5} />);
    expect(screen.getByText('5 images en attente')).toBeInTheDocument();
  });

  it('opens dropdown when configuration button is clicked', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    const configButton = screen.getByRole('button', { name: /configurer le traitement/i });
    fireEvent.click(configButton);

    await waitFor(() => {
      expect(screen.getByText('Configuration du traitement')).toBeInTheDocument();
    });
  });

  it('applies correct mode when treatments are selected', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: /configurer le traitement/i }));
    
    // Select crop head and AI removal
    fireEvent.click(screen.getByLabelText(/couper la tête/i));
    fireEvent.click(screen.getByLabelText(/supprimer l'arrière-plan/i));
    
    // Apply configuration
    fireEvent.click(screen.getByText('Appliquer la configuration'));

    expect(defaultProps.onApplyResize).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'all' })
    );
  });

  it('saves dimensions to localStorage when changed', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /configurer le traitement/i }));
    
    const widthInput = screen.getByLabelText('Largeur');
    fireEvent.change(widthInput, { target: { value: '800' } });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'miremover-dimensions',
        JSON.stringify({ width: 800, height: 1500 })
      );
    });
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /supprimer toutes les photos/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Cliquez à nouveau pour confirmer')).toBeInTheDocument();
    });
  });

  it('disables processing button when no pending files', () => {
    render(<ModelSelector {...defaultProps} hasPendingFiles={false} />);
    
    const processButton = screen.getByRole('button', { name: /traiter les images/i });
    expect(processButton).toBeDisabled();
  });
});