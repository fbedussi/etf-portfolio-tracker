import { create } from 'zustand';
import type { PriceData, PriceCache } from '@/types';

interface PriceState {
  // Data
  prices: Record<string, PriceData>;
  cache: PriceCache;

  // Loading state
  isFetching: boolean;
  lastFetch: number | null;

  // Actions
  setPrices: (prices: Record<string, PriceData>) => void;
  fetchPrice: (ticker: string) => Promise<void>;
  fetchPrices: (tickers: string[]) => Promise<void>;
  getCachedPrice: (ticker: string) => PriceData | null;
  clearCache: () => void;
}

export const usePriceStore = create<PriceState>((set, get) => ({
  prices: {},
  cache: {},
  isFetching: false,
  lastFetch: null,

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
      ticker,
      price: cached.price,
      timestamp: cached.timestamp,
      currency: 'USD', // TODO: Make configurable
      source: 'cache' as const,
    };
  },

  clearCache: () => {
    set({ cache: {}, prices: {} });
  },
}));
