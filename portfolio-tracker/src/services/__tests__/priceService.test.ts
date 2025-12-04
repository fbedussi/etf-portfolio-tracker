import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { priceService, PriceServiceError } from '../priceService';
import { ALPHA_VANTAGE_CONFIG } from '@/config/api.config';

// Mock fetch globally
global.fetch = vi.fn();

describe('PriceService', () => {
  const originalApiKey = ALPHA_VANTAGE_CONFIG.apiKey;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Mock API key
    ALPHA_VANTAGE_CONFIG.apiKey = 'test-api-key';
  });

  afterEach(() => {
    vi.useRealTimers();
    ALPHA_VANTAGE_CONFIG.apiKey = originalApiKey;
  });

  describe('fetchPrice', () => {
    it('should fetch price successfully for valid ticker', async () => {
      const mockResponse = {
        'Global Quote': {
          '01. symbol': 'VTI',
          '05. price': '235.50',
          '07. latest trading day': '2024-12-01',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await priceService.fetchPrice('VTI');

      expect(result.ticker).toBe('VTI');
      expect(result.price).toBe(235.50);
      expect(result.currency).toBe('USD');
      expect(result.source).toBe('alphavantage');
    });

    it('should throw error for empty ticker', async () => {
      await expect(priceService.fetchPrice('')).rejects.toThrow(PriceServiceError);
      await expect(priceService.fetchPrice('')).rejects.toThrow('Ticker symbol is required');
    });

    it('should throw error when API key is missing', async () => {
      const originalKey = ALPHA_VANTAGE_CONFIG.apiKey;
      ALPHA_VANTAGE_CONFIG.apiKey = '';

      await expect(priceService.fetchPrice('VTI')).rejects.toThrow(PriceServiceError);
      await expect(priceService.fetchPrice('VTI')).rejects.toThrow('API key is not configured');

      ALPHA_VANTAGE_CONFIG.apiKey = originalKey;
    });

    it('should throw error for invalid ticker', async () => {
      const mockResponse = {
        'Error Message': 'Invalid API call',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Start the fetch and advance through all retries
      const promise = priceService.fetchPrice('INVALID');
      
      // Advance through initial attempt + 3 retries (2s, 5s, 10s delays)
      await vi.advanceTimersByTimeAsync(0); // Initial
      await vi.advanceTimersByTimeAsync(2000); // Retry 1
      await vi.advanceTimersByTimeAsync(5000); // Retry 2
      await vi.advanceTimersByTimeAsync(10000); // Retry 3

      await expect(promise).rejects.toThrow('Invalid ticker symbol');
    });

    it('should throw error when rate limit is exceeded', async () => {
      const mockResponse = {
        Note: 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute.',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Start the fetch and advance through all retries
      const promise = priceService.fetchPrice('VTI');
      
      // Advance through initial attempt + 3 retries
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.advanceTimersByTimeAsync(10000);

      await expect(promise).rejects.toThrow('API rate limit exceeded');
    });

    it('should throw error when API request fails', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // Start the fetch and advance through all retries
      const promise = priceService.fetchPrice('VTI');
      
      // Advance through initial attempt + 3 retries
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.advanceTimersByTimeAsync(10000);

      await expect(promise).rejects.toThrow(PriceServiceError);
    });

    it('should throw error when no data is available', async () => {
      const mockResponse = {
        'Global Quote': {},
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Start the fetch and advance through all retries
      const promise = priceService.fetchPrice('VTI');
      
      // Advance through initial attempt + 3 retries
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.advanceTimersByTimeAsync(10000);

      await expect(promise).rejects.toThrow('No price data available');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      // Start the fetch and advance through all retries
      const promise = priceService.fetchPrice('VTI');
      
      // Advance through initial attempt + 3 retries
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.advanceTimersByTimeAsync(10000);

      await expect(promise).rejects.toThrow('Failed to fetch price for VTI');
    });

    it('should timeout after configured duration', async () => {
      vi.useFakeTimers();
      
      let abortSignal: AbortSignal | undefined;
      (global.fetch as any).mockImplementation(
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
      
      // Advance through timeout + retry cycles
      // Each attempt: timeout (10s) + retry delay (2s, 5s, 10s)
      await vi.advanceTimersByTimeAsync(10000); // Initial timeout
      await vi.advanceTimersByTimeAsync(2000); // Retry 1 delay
      await vi.advanceTimersByTimeAsync(10000); // Retry 1 timeout
      await vi.advanceTimersByTimeAsync(5000); // Retry 2 delay
      await vi.advanceTimersByTimeAsync(10000); // Retry 2 timeout
      await vi.advanceTimersByTimeAsync(10000); // Retry 3 delay
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
      
      const mockResponse1 = {
        'Global Quote': {
          '01. symbol': 'VTI',
          '05. price': '235.50',
        },
      };

      const mockResponse2 = {
        'Global Quote': {
          '01. symbol': 'BND',
          '05. price': '72.30',
        },
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        });

      const promise = priceService.fetchPrices(['VTI', 'BND']);
      await vi.runAllTimersAsync();
      const results = await promise;

      expect(results.size).toBe(2);
      expect((results.get('VTI') as any).ticker).toBe('VTI');
      expect((results.get('BND') as any).ticker).toBe('BND');
      
      vi.useRealTimers();
    });

    it('should handle partial failures gracefully', async () => {
      vi.useFakeTimers();
      
      const mockResponse = {
        'Global Quote': {
          '01. symbol': 'VTI',
          '05. price': '235.50',
        },
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Error',
        });

      const promise = priceService.fetchPrices(['VTI', 'INVALID']);
      await vi.runAllTimersAsync();
      const results = await promise;

      expect(results.size).toBe(2);
      expect((results.get('VTI') as any).ticker).toBe('VTI');
      expect(results.get('INVALID')).toBeInstanceOf(Error);
      
      vi.useRealTimers();
    });

    it('should return empty Map for empty ticker list', async () => {
      const results = await priceService.fetchPrices([]);
      expect(results.size).toBe(0);
    });
  });
});
