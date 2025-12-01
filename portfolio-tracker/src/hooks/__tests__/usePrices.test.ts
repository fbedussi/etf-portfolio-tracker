import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePrices } from '../usePrices';
import { priceService, PriceServiceError } from '@/services/priceService';
import { cacheService } from '@/services/cacheService';

// Mock services
vi.mock('@/services/priceService', () => ({
  priceService: {
    fetchPrice: vi.fn(),
    fetchPrices: vi.fn(),
  },
  PriceServiceError: class PriceServiceError extends Error {
    code: string;
    ticker?: string;
    constructor(message: string, code: string, ticker?: string) {
      super(message);
      this.code = code;
      this.ticker = ticker;
    }
  },
}));

vi.mock('@/services/cacheService', () => ({
  cacheService: {
    getCachedPrice: vi.fn(),
    setCachedPrice: vi.fn(),
    cachePriceData: vi.fn(),
    clearCache: vi.fn(),
  },
}));

describe('usePrices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('fetchPrices', () => {
    it('should fetch prices for given tickers', async () => {
      const mockPriceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: Date.now(),
        currency: 'USD',
        source: 'alphavantage' as const,
      };

      (cacheService.getCachedPrice as any).mockReturnValue(null);
      (priceService.fetchPrice as any).mockResolvedValue(mockPriceData);

      const { result } = renderHook(() => usePrices());

      await act(async () => {
        await result.current.fetchPrices(['VTI']);
      });

      expect(priceService.fetchPrice).toHaveBeenCalledWith('VTI');
      expect(cacheService.cachePriceData).toHaveBeenCalledWith(mockPriceData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.errors).toEqual({});
    });

    it('should use cached prices when available', async () => {
      const cachedPrice = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: Date.now(),
        currency: 'USD',
        source: 'cache' as const,
      };

      (cacheService.getCachedPrice as any).mockReturnValue(cachedPrice);

      const { result } = renderHook(() => usePrices());

      await act(async () => {
        await result.current.fetchPrices(['VTI']);
      });

      expect(priceService.fetchPrice).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle errors for individual tickers', async () => {
      const error = new PriceServiceError('Invalid ticker', 'INVALID_TICKER', 'INVALID');

      (cacheService.getCachedPrice as any).mockReturnValue(null);
      (priceService.fetchPrice as any).mockRejectedValue(error);

      const { result } = renderHook(() => usePrices());

      await act(async () => {
        await result.current.fetchPrices(['INVALID']);
      });

      expect(result.current.errors['INVALID']).toBe('Invalid ticker');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle partial failures', async () => {
      const mockPriceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: Date.now(),
        currency: 'USD',
        source: 'alphavantage' as const,
      };

      const error = new PriceServiceError('Invalid ticker', 'INVALID_TICKER', 'INVALID');

      (cacheService.getCachedPrice as any).mockReturnValue(null);
      (priceService.fetchPrice as any)
        .mockResolvedValueOnce(mockPriceData)
        .mockRejectedValueOnce(error);

      const { result } = renderHook(() => usePrices());

      const fetchPromise = act(async () => {
        await result.current.fetchPrices(['VTI', 'INVALID']);
      });

      // Fast-forward through the 12-second delay
      await vi.runAllTimersAsync();
      await fetchPromise;

      expect(priceService.fetchPrice).toHaveBeenCalledTimes(2);
      expect(result.current.errors['INVALID']).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const mockPriceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: Date.now(),
        currency: 'USD',
        source: 'alphavantage' as const,
      };

      (cacheService.getCachedPrice as any).mockReturnValue(null);
      (priceService.fetchPrice as any).mockResolvedValue(mockPriceData);

      const { result } = renderHook(() => usePrices());

      const fetchPromise = act(async () => {
        await result.current.fetchPrices(['VTI']);
      });

      await fetchPromise;

      expect(result.current.isLoading).toBe(false);
    });

    it('should track loading tickers', async () => {
      const mockPriceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: Date.now(),
        currency: 'USD',
        source: 'alphavantage' as const,
      };

      (cacheService.getCachedPrice as any).mockReturnValue(null);
      (priceService.fetchPrice as any).mockResolvedValue(mockPriceData);

      const { result } = renderHook(() => usePrices());

      if (result.current) {
        await act(async () => {
          await result.current.fetchPrices(['VTI']);
        });

        expect(result.current.loadingTickers).toEqual([]);
      }
    });

    it('should handle empty ticker array', async () => {
      const { result } = renderHook(() => usePrices());

      if (result.current) {
        await act(async () => {
          await result.current.fetchPrices([]);
        });

        expect(priceService.fetchPrice).not.toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);
      }
    });
  });

  describe('refreshPrices', () => {
    it('should refetch all previously fetched tickers', async () => {
      const mockPriceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: Date.now(),
        currency: 'USD',
        source: 'alphavantage' as const,
      };

      (cacheService.getCachedPrice as any).mockReturnValue(null);
      (priceService.fetchPrice as any).mockResolvedValue(mockPriceData);

      const { result } = renderHook(() => usePrices());

      if (result.current) {
        // First fetch
        await act(async () => {
          await result.current.fetchPrices(['VTI']);
        });

        vi.clearAllMocks();

        // Refresh
        await act(async () => {
          await result.current.refreshPrices();
        });

        expect(priceService.fetchPrice).toHaveBeenCalledWith('VTI');
      }
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', async () => {
      const error = new PriceServiceError('Invalid ticker', 'INVALID_TICKER', 'INVALID');

      (cacheService.getCachedPrice as any).mockReturnValue(null);
      (priceService.fetchPrice as any).mockRejectedValue(error);

      const { result } = renderHook(() => usePrices());

      if (result.current) {
        await act(async () => {
          await result.current.fetchPrices(['INVALID']);
        });

        expect(Object.keys(result.current.errors)).toHaveLength(1);

        act(() => {
          result.current.clearErrors();
        });

        expect(result.current.errors).toEqual({});
      }
    });
  });
});
