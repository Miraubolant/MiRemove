import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImagePreview } from '../../components/ImagePreview';

// Mock stores
jest.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({ user: { id: '1' } })
}));

describe('ImagePreview', () => {
  const mockFile = {
    id: '1',
    file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
    preview: 'mock-preview-url',
    status: 'pending' as const,
    dimensions: {
      width: 1600,
      height: 2400,
      original: { width: 1600, height: 2400 }
    }
  };

  const defaultProps = {
    file: mockFile,
    onRemove: jest.fn(),
    onProcess: jest.fn()
  };

  it('renders image preview', () => {
    console.log('🧪 Testing ImagePreview render...');
    render(<ImagePreview {...defaultProps} />);
    expect(screen.getByTitle('Informations')).toBeInTheDocument();
    console.log('✅ ImagePreview render test passed');
  });

  it('shows compact dimensions badge', () => {
    console.log('🧪 Testing dimensions format...');
    render(<ImagePreview {...defaultProps} />);
    // Should show 1.6k×2.4k instead of 1600×2400
    expect(screen.getByText('1.6k×2.4k')).toBeInTheDocument();
    console.log('✅ Compact dimensions test passed');
  });

  it('shows pending status', () => {
    console.log('🧪 Testing pending status...');
    render(<ImagePreview {...defaultProps} />);
    expect(screen.getByText('En attente')).toBeInTheDocument();
    console.log('✅ Pending status test passed');
  });
});