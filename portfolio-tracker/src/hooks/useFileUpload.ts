import { useState, useCallback } from 'react';
import { fileService } from '@/services/fileService';
import { usePortfolioStore } from '@/store/portfolioStore';
import type { Portfolio } from '@/types';

/**
 * Custom hook for managing file upload workflow
 * Handles file selection, parsing, validation, and state updates
 */
export interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get portfolio store actions
  const setPortfolio = usePortfolioStore((state) => state.setPortfolio);
  const setStoreError = usePortfolioStore((state) => state.setError);

  /**
   * Upload and parse a portfolio file
   */
  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setStoreError(null);

    try {
      // Parse the file
      const portfolio: Portfolio = await fileService.parsePortfolioFile(file);

      // Validate asset categories (business rule)
      fileService.validateAssetCategories(portfolio);

      // Update the portfolio store
      setPortfolio(portfolio);

      console.log('Portfolio loaded successfully:', portfolio);
    } catch (err) {
      const errorObj = err instanceof Error 
        ? err 
        : new Error('Unknown error occurred while parsing file');
      
      console.error('File upload error:', errorObj);
      
      setError(errorObj);
      setStoreError(errorObj.message);
    } finally {
      setIsLoading(false);
    }
  }, [setPortfolio, setStoreError]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setStoreError(null);
  }, [setStoreError]);

  return {
    uploadFile,
    isLoading,
    error,
    clearError,
  };
}
