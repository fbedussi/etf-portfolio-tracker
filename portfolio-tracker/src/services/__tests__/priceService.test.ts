import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { priceService, PriceServiceError } from '../priceService';
import { API_CONFIG } from '@/config/api.config';

// Mock fetch globally
globalThis.fetch = vi.fn();

const mockResponse = {
  intradayPoint: [
    {
      "time": "20251215-09:04:00",
      "nbTrade": 292,
      "beginPx": 110.91,
      "beginTime": "09:04:13",
      "endPx": 110.84,
      "endTime": "09:04:33",
      "highPx": 110.92,
      "lowPx": 110.84,
      "beginAskPx": {
        "source": "0.0",
        "parsedValue": 0
      },
      "endAskPx": {
        "source": "0.0",
        "parsedValue": 0
      },
      "highAskPx": {
        "source": "0.0",
        "parsedValue": 0
      },
      "lowAskPx": {
        "source": "0.0",
        "parsedValue": 0
      },
      "beginBidPx": {
        "source": "0.0",
        "parsedValue": 0
      },
      "endBidPx": {
        "source": "0.0",
        "parsedValue": 0
      },
      "highBidPx": {
        "source": "0.0",
        "parsedValue": 0
      },
      "lowBidPx": {
        "source": "0.0",
        "parsedValue": 0
      },
      "vol": {
        "source": "5449.0",
        "parsedValue": 5449
      },
      "amt": 604342.71,
      "previousClosingPx": 110.34,
      "previousClosingDt": "20251212",
      "previousSettlementPx": 111.291142,
      "previousSettlementDt": "20251212"
    }
  ],
  status: 0,
  entityID: 'euronext',
  view: 'LIGHT',
  sessionQuality: 'RT',
  currency: 'EUR',
  accuracy: 2,
  tickSizeRule: 'ERX_34',
  label: 'ISHARES CORE MSCI WORLD UCITS ETF ACC',
  instrType: 'TRACK'
};

describe('PriceService', () => {
  const originalApiKey = API_CONFIG.apiToken;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Mock API key
    API_CONFIG.apiToken = 'test-api-key';
  });

  afterEach(() => {
    vi.useRealTimers();
    API_CONFIG.apiToken = originalApiKey;
  });

  describe('fetchPrice', () => {
    it('should fetch price successfully for valid isin', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await priceService.fetchPrice('IE00B4L5Y983');

      expect(result.isin).toBe('IE00B4L5Y983');
      expect(result.price).toBe(110.84);
      expect(result.currency).toBe('EUR');
    });

    it('should throw error for empty ticker', async () => {
      await expect(priceService.fetchPrice('')).rejects.toThrow(PriceServiceError);
      await expect(priceService.fetchPrice('')).rejects.toThrow('Isin is required');
    });

    it('should throw error when API key is missing', async () => {
      const originalKey = API_CONFIG.apiToken;
      API_CONFIG.apiToken = '';

      await expect(priceService.fetchPrice('IE00B4L5Y983')).rejects.toThrow(PriceServiceError);
      await expect(priceService.fetchPrice('IE00B4L5Y983')).rejects.toThrow('API token is not configured');

      API_CONFIG.apiToken = originalKey;
    });

    it('should throw error for invalid isin', async () => {
      const mockResponse = {
        'status': 2007,
      };

      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const promise = priceService.fetchPrice('INVALID');

      await expect(promise).rejects.toThrow('Invalid isin');
    });

    it('should throw error when API request fails', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const promise = priceService.fetchPrice('VTI');

      await expect(promise).rejects.toThrow(PriceServiceError);
    });

    it('should throw error when no data is available', async () => {
      const mockResponse = {
        intradayPoint: [],
        status: 0,
        entityID: 'euronext',
        view: 'LIGHT',
        sessionQuality: 'RT',
        currency: 'EUR',
        accuracy: 2,
        tickSizeRule: 'ERX_34',
        label: 'ISHARES CORE MSCI WORLD UCITS ETF ACC',
        instrType: 'TRACK'
      };

      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const promise = priceService.fetchPrice('VTI');

      await expect(promise).rejects.toThrow('No price data available');
    });

    it('should handle network errors', async () => {
      (globalThis.fetch as any).mockRejectedValue(new Error('Network error'));

      const promise = priceService.fetchPrice('VTI');

      await expect(promise).rejects.toThrow('Failed to fetch price for VTI');
    });

    it('should timeout after configured duration', async () => {
      vi.useFakeTimers();

      let abortSignal: AbortSignal | undefined;
      (globalThis.fetch as any).mockImplementation(
        (url: string, options: any) => {
          abortSignal = options?.signal;
          return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => resolve({ ok: true }), 15000);
            if (abortSignal) {
              abortSignal.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                const abortError = new Error('The operation was aborted');
                abortError.name = 'AbortError';
                reject(abortError);
              });
            }
          });
        }
      );

      const fetchPromise = priceService.fetchPrice('VTI');

      await vi.advanceTimersByTimeAsync(10000); // Retry 3 timeout

      // Catch and verify the rejection
      try {
        await fetchPromise;
        throw new Error('Should have thrown');
      } catch (error: any) {
        // After retries, abort errors get converted to TIMEOUT errors on first attempt
        // then potentially network errors on retries
        expect(error instanceof PriceServiceError).toBe(true);
      }

      vi.useRealTimers();
    });
  });

  describe('fetchPrices', () => {
    it('should fetch multiple prices successfully', async () => {
      vi.useFakeTimers();

      (globalThis.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

      const promise = priceService.fetchPrices(['IE00B4L5Y983', 'LU0478205379']);
      await vi.runAllTimersAsync();
      const results = await promise;

      expect(results.size).toBe(2);
      expect((results.get('IE00B4L5Y983') as any).isin).toBe('IE00B4L5Y983');
      expect((results.get('LU0478205379') as any).isin).toBe('LU0478205379');

      vi.useRealTimers();
    });

    it('should handle partial failures gracefully', async () => {
      vi.useFakeTimers();

      (globalThis.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Error',
        });

      const promise = priceService.fetchPrices(['IE00B4L5Y983', 'INVALID']);
      await vi.runAllTimersAsync();
      const results = await promise;

      expect(results.size).toBe(2);
      expect((results.get('IE00B4L5Y983') as any).isin).toBe('IE00B4L5Y983');
      expect(results.get('INVALID')).toBeInstanceOf(Error);

      vi.useRealTimers();
    });

    it('should return empty Map for empty isin list', async () => {
      const results = await priceService.fetchPrices([]);
      expect(results.size).toBe(0);
    });
  });
});
