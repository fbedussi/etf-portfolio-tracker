import { useState, useCallback, useEffect } from 'react';
import { priceService } from '@/services/priceService';
import { cacheService } from '@/services/cacheService';
import { usePriceStore, type PriceError } from '@/store/priceStore';
import type { PriceData } from '@/types';

/**
 * Custom hook for managing price fetching and caching
 * Orchestrates price service, cache service, and price store
 */
export interface UsePricesReturn {
  fetchPrices: (isins: string[]) => Promise<void>;
  refreshPrices: () => Promise<void>;
  isLoading: boolean;
  loadingIsins: string[];
  errors: Record<string, PriceError>;
  lastUpdated: number | null;
  clearErrors: () => void;
  clearError: (isin: string) => void;
}

export function usePrices(isins?: string[]): UsePricesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIsins, setLoadingIsins] = useState<string[]>([]);

  const prices = usePriceStore((state) => state.prices);
  const setPrices = usePriceStore((state) => state.setPrices);
  const lastFetch = usePriceStore((state) => state.lastFetch);
  const errors = usePriceStore((state) => state.errors);
  const setError = usePriceStore((state) => state.setError);
  const clearError = usePriceStore((state) => state.clearError);
  const clearAllErrors = usePriceStore((state) => state.clearAllErrors);

  const fetchPrices = useCallback(async (isinsToFetch: string[]) => {
    if (isinsToFetch.length === 0) {
      return;
    }

    setIsLoading(true);
    setLoadingIsins(isinsToFetch);
    clearAllErrors();

    const newPrices: Record<string, PriceData> = {};
    const isinsToFetchFromAPI: string[] = [];

    // First, check cache
    for (const isin of isinsToFetch) {
      const cached = await cacheService.getCachedPrice(isin);
      if (cached) {
        newPrices[isin] = cached;
        console.log(`Using cached price for ${isin}`);
      } else {
        isinsToFetchFromAPI.push(isin);
      }
    }

    // Fetch prices from API for isins not in cache
    if (isinsToFetchFromAPI.length > 0) {
      console.log(`Fetching ${isinsToFetchFromAPI.length} prices from API...`);

      try {
        const fetchResults = await Promise.all(
          isinsToFetchFromAPI.map((isin) =>
            priceService.fetchPrice(isin)
              .then(
                (priceData) => ({ isin, priceData, success: true }),
                (error) => ({ isin, error, success: false })
              )
          )
        );

        for (const result of fetchResults) {
          if (result.success && 'priceData' in result) {
            // Success: cache and store price
            await cacheService.cachePriceData(result.priceData);
            newPrices[result.isin] = result.priceData;
          } else if ('error' in result) {
            const userMessage = result.error.message || 'Unable to fetch price. Please try again later.';

            setError(result.isin, {
              isin: result.isin,
              message: userMessage,
              code: result.error?.code || 'UNKNOWN_ERROR',
              timestamp: Date.now(),
            });

            console.error(`Error fetching ${result.isin}:`, userMessage);
          }
        }
      } finally {
        setLoadingIsins([]);
      }
    }

    // Update store with new prices
    setPrices(newPrices);

    // Clear loading state
    setIsLoading(false);
    setLoadingIsins([]);

    // Log results
    const successCount = Object.keys(newPrices).length;
    const errorCount = Object.keys(errors).length;
    console.log(`Price fetch complete: ${successCount} successful, ${errorCount} errors`);
  }, [setPrices, setError, clearAllErrors]);

  const refreshPrices = useCallback(async () => {
    const isinsToRefresh = Object.keys(prices);
    if (isinsToRefresh.length === 0) {
      console.warn('No prices to refresh');
      return;
    }

    console.log(`Refreshing prices for ${isinsToRefresh.length} isins...`);
    await fetchPrices(isinsToRefresh);
  }, [prices, fetchPrices]);

  const clearErrors = useCallback(() => {
    clearAllErrors();
  }, [clearAllErrors]);

  /**
   * Auto-fetch on mount if isins provided
   */
  useEffect(() => {
    if (isins && isins.length > 0) {
      // Only fetch if we don't have prices for these isins
      const missingIsins = isins.filter((t) => !prices[t]);
      if (missingIsins.length > 0) {
        fetchPrices(missingIsins);
      }
    }
  }, [isins, prices, fetchPrices]);

  return {
    fetchPrices,
    refreshPrices,
    isLoading,
    loadingIsins,
    errors,
    lastUpdated: lastFetch,
    clearErrors,
    clearError,
  };
}

