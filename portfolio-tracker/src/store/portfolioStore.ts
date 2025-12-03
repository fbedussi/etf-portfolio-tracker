import { create } from 'zustand';
import type {
  Portfolio,
  Holdings,
  PortfolioMetrics,
  RebalancingStatus,
} from '@/types';

interface PortfolioState {
  // Data
  portfolio: Portfolio | null;
  holdings: Holdings | null;
  metrics: PortfolioMetrics | null;
  rebalancingStatus: RebalancingStatus | null;

  // Loading states
  isLoading: boolean;
  isFetchingPrices: boolean;

  // Error states
  error: string | null;

  // Actions
  setPortfolio: (portfolio: Portfolio) => void;
  loadPortfolio: (file: File) => Promise<void>;
  refreshPrices: () => Promise<void>;
  clearPortfolio: () => void;
  setError: (error: string | null) => void;
  setRebalancingStatus: (status: RebalancingStatus | null) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: null,
  holdings: null,
  metrics: null,
  rebalancingStatus: null,
  isLoading: false,
  isFetchingPrices: false,
  error: null,

  setPortfolio: (portfolio: Portfolio) => {
    set({ 
      portfolio,
      error: null,
    });
  },

  loadPortfolio: async (_file: File) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Implement file parsing
      // const fileService = new FileService();
      // const portfolio = await fileService.parsePortfolioFile(file);

      // Placeholder for now
      throw new Error('File parsing not yet implemented');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  refreshPrices: async () => {
    const { portfolio, holdings } = get();
    if (!portfolio || !holdings) return;

    set({ isFetchingPrices: true });

    try {
      // TODO: Implement price fetching
      // const priceService = new PriceService();
      // const prices = await priceService.refreshPrices(tickers);

      throw new Error('Price refresh not yet implemented');
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to refresh prices',
        isFetchingPrices: false,
      });
    }
  },

  clearPortfolio: () => {
    set({
      portfolio: null,
      holdings: null,
      metrics: null,
      rebalancingStatus: null,
      error: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setRebalancingStatus: (status: RebalancingStatus | null) => {
    set({ rebalancingStatus: status });
  },
}));
