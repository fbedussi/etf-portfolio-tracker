import { useState, useCallback, useEffect } from 'react';
import { priceService, PriceServiceError } from '@/services/priceService';
import { cacheService } from '@/services/cacheService';
import { usePriceStore } from '@/store/priceStore';
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
  errors: Record<string, string>;
  lastUpdated: number | null;
  clearErrors: () => void;
}

export function usePrices(tickers?: string[]): UsePricesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTickers, setLoadingTickers] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get price store
  const prices = usePriceStore((state) => state.prices);
  const setPrices = usePriceStore((state) => state.setPrices);
  const lastFetch = usePriceStore((state) => state.lastFetch);

  /**
   * Fetch prices for given tickers with cache check
   */
  const fetchPrices = useCallback(async (tickersToFetch: string[]) => {
    if (tickersToFetch.length === 0) {
      return;
    }

    setIsLoading(true);
    setLoadingTickers(tickersToFetch);
    setErrors({});

    const newPrices: Record<string, PriceData> = {};
    const newErrors: Record<string, string> = {};
    const tickersToFetchFromAPI: string[] = [];

    // First, check cache for all tickers
    for (const ticker of tickersToFetch) {
      const cached = cacheService.getCachedPrice(ticker);
      if (cached) {
        newPrices[ticker] = cached;
      } else {
        tickersToFetchFromAPI.push(ticker);
      }
    }

    // Fetch prices from API for tickers not in cache
    if (tickersToFetchFromAPI.length > 0) {
      console.log(`Fetching ${tickersToFetchFromAPI.length} prices from API...`);
      
      for (let i = 0; i < tickersToFetchFromAPI.length; i++) {
        const ticker = tickersToFetchFromAPI[i];
        
        try {
          setLoadingTickers([ticker]); // Update to show which ticker is loading
          
          const priceData = await priceService.fetchPrice(ticker);
          
          // Store in cache
          cacheService.cachePriceData(priceData);
          
          // Add to results
          newPrices[ticker] = priceData;
          
          // Rate limiting: wait between API calls (except for last one)
          if (i < tickersToFetchFromAPI.length - 1) {
            console.log(`Waiting 12s before next API call (rate limit)...`);
            await delay(12000); // 12 seconds to stay under 5 calls/min
          }
        } catch (error) {
          const errorMessage = error instanceof PriceServiceError
            ? error.message
            : error instanceof Error
            ? error.message
            : 'Unknown error occurred';
          
          console.error(`Error fetching ${ticker}:`, errorMessage);
          newErrors[ticker] = errorMessage;
        }
      }
    }

    // Update store with new prices
    setPrices(newPrices);
    
    // Update errors
    setErrors(newErrors);
    
    // Clear loading state
    setIsLoading(false);
    setLoadingTickers([]);

    // Log results
    const successCount = Object.keys(newPrices).length;
    const errorCount = Object.keys(newErrors).length;
    console.log(`Price fetch complete: ${successCount} successful, ${errorCount} failed`);
  }, [setPrices]);

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
    setErrors({});
  }, []);

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
  };
}

/**
 * Helper function for delays
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
