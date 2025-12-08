import { create } from 'zustand';
import type { PriceData, PriceCache } from '@/types';

/**
 * Price error information
 */
export interface PriceError {
  isin: string;
  message: string;
  code: string;
  timestamp: number;
}

interface PriceState {
  // Data
  prices: Record<string, PriceData>;
  cache: PriceCache;

  // Loading state
  isFetching: boolean;
  lastFetch: number | null;

  // Error state
  errors: Record<string, PriceError>;
  globalError: string | null;

  // Actions
  setPrices: (prices: Record<string, PriceData>) => void;
  fetchPrice: (ticker: string) => Promise<void>;
  fetchPrices: (tickers: string[]) => Promise<void>;
  getCachedPrice: (ticker: string) => PriceData | null;
  setError: (ticker: string, error: PriceError) => void;
  setGlobalError: (error: string | null) => void;
  clearError: (ticker: string) => void;
  clearAllErrors: () => void;
  clearCache: () => void;
  clearAllPrices: () => void;
}

export const usePriceStore = create<PriceState>((set, get) => ({
  prices: {},
  cache: {},
  isFetching: false,
  lastFetch: null,
  errors: {},
  globalError: null,

  setPrices: (newPrices: Record<string, PriceData>) => {
    set({
      prices: { ...get().prices, ...newPrices },
      lastFetch: Date.now(),
    });
  },

  fetchPrice: async (ticker: string) => {
    await get().fetchPrices([ticker]);
  },

  fetchPrices: async (_tickers: string[]) => {
    set({ isFetching: true });

    try {
      // TODO: Implement actual API calls
      // const priceService = new PriceService();
      // const newPrices = await priceService.fetchPrices(tickers);

      // Placeholder
      const newPrices: Record<string, PriceData> = {};

      set({
        prices: { ...get().prices, ...newPrices },
        isFetching: false,
        lastFetch: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      set({ isFetching: false });
    }
  },

  getCachedPrice: (ticker: string) => {
    const cached = get().cache[ticker];
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiresAt) {
      return null;
    }

    return {
      isin: ticker,
      price: cached.price,
      timestamp: cached.timestamp,
      currency: 'USD', // TODO: Make configurable
      source: 'cache' as const,
    };
  },

  setError: (ticker: string, error: PriceError) => {
    set({
      errors: { ...get().errors, [ticker]: error },
    });
  },

  setGlobalError: (error: string | null) => {
    set({ globalError: error });
  },

  clearError: (ticker: string) => {
    const errors = { ...get().errors };
    delete errors[ticker];
    set({ errors });
  },

  clearAllErrors: () => {
    set({ errors: {}, globalError: null });
  },

  clearCache: () => {
    set({ cache: {}, prices: {} });
  },

  clearAllPrices: () => {
    set({
      prices: {},
      cache: {},
      isFetching: false,
      lastFetch: null,
      errors: {},
      globalError: null,
    });
  },
}));
