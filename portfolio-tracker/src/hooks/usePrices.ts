import { useState, useCallback, useEffect } from 'react';
import { priceService, PriceServiceError } from '@/services/priceService';
import { cacheService } from '@/services/cacheService';
import { usePriceStore, type PriceError } from '@/store/priceStore';
import { priceRequestQueue } from '@/services/requestQueue';
import type { PriceData } from '@/types';

/**
 * Custom hook for managing price fetching and caching
 * Orchestrates price service, cache service, and price store
 */
export interface UsePricesReturn {
  fetchPrices: (tickers: string[]) => Promise<void>;
  refreshPrices: () => Promise<void>;
  isLoading: boolean;
  loadingTickers: string[];
  errors: Record<string, PriceError>;
  lastUpdated: number | null;
  clearErrors: () => void;
  clearError: (ticker: string) => void;
}

export function usePrices(tickers?: string[]): UsePricesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTickers, setLoadingTickers] = useState<string[]>([]);
  
  // Get price store
  const prices = usePriceStore((state) => state.prices);
  const setPrices = usePriceStore((state) => state.setPrices);
  const lastFetch = usePriceStore((state) => state.lastFetch);
  const errors = usePriceStore((state) => state.errors);
  const setError = usePriceStore((state) => state.setError);
  const clearError = usePriceStore((state) => state.clearError);
  const clearAllErrors = usePriceStore((state) => state.clearAllErrors);

  /**
   * Fetch prices for given tickers with cache check and error fallback
   */
  const fetchPrices = useCallback(async (tickersToFetch: string[]) => {
    if (tickersToFetch.length === 0) {
      return;
    }

    setIsLoading(true);
    setLoadingTickers(tickersToFetch);
    clearAllErrors();

    const newPrices: Record<string, PriceData> = {};
    const tickersToFetchFromAPI: string[] = [];

    // First, check cache for all tickers
    for (const ticker of tickersToFetch) {
      const cached = cacheService.getCachedPrice(ticker);
      if (cached) {
        newPrices[ticker] = cached;
        console.log(`Using cached price for ${ticker}`);
      } else {
        tickersToFetchFromAPI.push(ticker);
      }
    }

    // Fetch prices from API for tickers not in cache
    if (tickersToFetchFromAPI.length > 0) {
      console.log(`Fetching ${tickersToFetchFromAPI.length} prices from API...`);

      const unsubscribe = priceRequestQueue.onProgress((progress) => {
        if (progress.currentTicker) {
          setLoadingTickers([progress.currentTicker]);
        } else if (progress.queueLength === 0) {
          setLoadingTickers([]);
        }
      });

      try {
        const fetchResults = await Promise.all(
          tickersToFetchFromAPI.map((ticker) =>
            priceRequestQueue
              .enqueue(() => priceService.fetchPrice(ticker), ticker)
              .then(
                (priceData) => ({ ticker, priceData, success: true }),
                (error) => ({ ticker, error, success: false })
              )
          )
        );

        for (const result of fetchResults) {
          if (result.success && 'priceData' in result) {
            // Success: cache and store price
            cacheService.cachePriceData(result.priceData);
            newPrices[result.ticker] = result.priceData;
          } else {
            // Error: try fallback to cache, then create error
            const rawError = result.error;
            const priceError = rawError instanceof PriceServiceError
              ? rawError
              : null;

            // Attempt fallback to cached price (even if expired)
            const cachedData = cacheService.getCachedPrice(result.ticker);
            if (cachedData) {
              // Use cached data with warning
              newPrices[result.ticker] = {
                ...cachedData,
                source: 'cache' as const,
              };
              
              // Create warning-level error
              const cacheAge = Math.floor((Date.now() - cachedData.timestamp) / 1000 / 60);
              setError(result.ticker, {
                ticker: result.ticker,
                message: `Cannot fetch current price. Using cached data from ${cacheAge} minutes ago.`,
                code: priceError?.code || 'FALLBACK_CACHE',
                timestamp: Date.now(),
              });
              
              console.warn(`Using cached fallback for ${result.ticker} (${cacheAge}m old)`);
            } else {
              // No cache available - full error
              const userMessage = priceError
                ? priceError.getUserFriendlyMessage()
                : rawError instanceof Error
                ? rawError.message
                : 'Unable to fetch price. Please try again later.';

              setError(result.ticker, {
                ticker: result.ticker,
                message: userMessage,
                code: priceError?.code || 'UNKNOWN_ERROR',
                timestamp: Date.now(),
              });

              console.error(`Error fetching ${result.ticker}:`, userMessage);
            }
          }
        }
      } finally {
        unsubscribe();
        setLoadingTickers([]);
      }
    }

    // Update store with new prices
    setPrices(newPrices);
    
    // Clear loading state
    setIsLoading(false);
    setLoadingTickers([]);

    // Log results
    const successCount = Object.keys(newPrices).length;
    const errorCount = Object.keys(errors).length;
    console.log(`Price fetch complete: ${successCount} successful, ${errorCount} errors`);
  }, [setPrices, setError, clearAllErrors]);

  /**
   * Refresh prices for previously fetched tickers
   */
  const refreshPrices = useCallback(async () => {
    const tickersToRefresh = Object.keys(prices);
    if (tickersToRefresh.length === 0) {
      console.warn('No prices to refresh');
      return;
    }

    console.log(`Refreshing prices for ${tickersToRefresh.length} tickers...`);
    await fetchPrices(tickersToRefresh);
  }, [prices, fetchPrices]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    clearAllErrors();
  }, [clearAllErrors]);

  /**
   * Auto-fetch on mount if tickers provided
   */
  useEffect(() => {
    if (tickers && tickers.length > 0) {
      // Only fetch if we don't have prices for these tickers
      const missingTickers = tickers.filter((t) => !prices[t]);
      if (missingTickers.length > 0) {
        fetchPrices(missingTickers);
      }
    }
  }, [tickers, prices, fetchPrices]);

  return {
    fetchPrices,
    refreshPrices,
    isLoading,
    loadingTickers,
    errors,
    lastUpdated: lastFetch,
    clearErrors,
    clearError,
  };
}

