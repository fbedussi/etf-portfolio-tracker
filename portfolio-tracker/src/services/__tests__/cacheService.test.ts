import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cacheService } from '../cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getCachedPrice', () => {
    it('should return null for uncached ticker', () => {
      const result = cacheService.getCachedPrice('VTI');
      expect(result).toBeNull();
    });

    it('should return cached price if still fresh', () => {
      // Set a price that expires in the future
      cacheService.setCachedPrice('VTI', 235.50);

      const result = cacheService.getCachedPrice('VTI');

      expect(result).not.toBeNull();
      expect(result?.ticker).toBe('VTI');
      expect(result?.price).toBe(235.50);
      expect(result?.source).toBe('cache');
    });

    it('should return null for expired cache', () => {
      // Manually set an expired cache entry
      const cache = {
        VTI: {
          price: 235.50,
          timestamp: Date.now() - 20 * 60 * 1000, // 20 minutes ago
          expiresAt: Date.now() - 5 * 60 * 1000, // Expired 5 minutes ago
        },
      };
      localStorage.setItem('portfolio_price_cache', JSON.stringify(cache));

      const result = cacheService.getCachedPrice('VTI');

      expect(result).toBeNull();
    });

    it('should be case-insensitive for ticker symbols', () => {
      cacheService.setCachedPrice('VTI', 235.50);

      const result1 = cacheService.getCachedPrice('vti');
      const result2 = cacheService.getCachedPrice('VTI');

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result1?.ticker).toBe(result2?.ticker);
    });
  });

  describe('setCachedPrice', () => {
    it('should store price in cache', () => {
      cacheService.setCachedPrice('VTI', 235.50);

      const cached = cacheService.getCachedPrice('VTI');

      expect(cached).not.toBeNull();
      expect(cached?.price).toBe(235.50);
    });

    it('should update existing cached price', () => {
      cacheService.setCachedPrice('VTI', 235.50);
      cacheService.setCachedPrice('VTI', 240.00);

      const cached = cacheService.getCachedPrice('VTI');

      expect(cached?.price).toBe(240.00);
    });

    it('should normalize ticker to uppercase', () => {
      cacheService.setCachedPrice('vti', 235.50);

      const cached = cacheService.getCachedPrice('VTI');

      expect(cached).not.toBeNull();
      expect(cached?.ticker).toBe('VTI');
    });
  });

  describe('cachePriceData', () => {
    it('should cache PriceData object', () => {
      const priceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: Date.now(),
        currency: 'USD',
        source: 'alphavantage' as const,
      };

      cacheService.cachePriceData(priceData);

      const cached = cacheService.getCachedPrice('VTI');

      expect(cached).not.toBeNull();
      expect(cached?.price).toBe(235.50);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached prices', () => {
      cacheService.setCachedPrice('VTI', 235.50);
      cacheService.setCachedPrice('BND', 72.30);

      cacheService.clearCache();

      expect(cacheService.getCachedPrice('VTI')).toBeNull();
      expect(cacheService.getCachedPrice('BND')).toBeNull();
    });
  });

  describe('clearExpiredEntries', () => {
    it('should remove only expired entries', () => {
      // Add fresh entry
      cacheService.setCachedPrice('VTI', 235.50);

      // Add expired entry manually
      const cache = JSON.parse(localStorage.getItem('portfolio_price_cache') || '{}');
      cache['BND'] = {
        price: 72.30,
        timestamp: Date.now() - 20 * 60 * 1000,
        expiresAt: Date.now() - 5 * 60 * 1000,
      };
      localStorage.setItem('portfolio_price_cache', JSON.stringify(cache));

      const removed = cacheService.clearExpiredEntries();

      expect(removed).toBe(1);
      expect(cacheService.getCachedPrice('VTI')).not.toBeNull();
      expect(cacheService.getCachedPrice('BND')).toBeNull();
    });

    it('should return 0 when no entries are expired', () => {
      cacheService.setCachedPrice('VTI', 235.50);
      cacheService.setCachedPrice('BND', 72.30);

      const removed = cacheService.clearExpiredEntries();

      expect(removed).toBe(0);
    });
  });

  describe('getCachedTickers', () => {
    it('should return all cached tickers', () => {
      cacheService.setCachedPrice('VTI', 235.50);
      cacheService.setCachedPrice('BND', 72.30);

      const tickers = cacheService.getCachedTickers();

      expect(tickers).toHaveLength(2);
      expect(tickers).toContain('VTI');
      expect(tickers).toContain('BND');
    });

    it('should return empty array when cache is empty', () => {
      const tickers = cacheService.getCachedTickers();
      expect(tickers).toEqual([]);
    });

    it('should exclude expired entries', () => {
      // Add fresh entry
      cacheService.setCachedPrice('VTI', 235.50);

      // Add expired entry
      const cache = JSON.parse(localStorage.getItem('portfolio_price_cache') || '{}');
      cache['BND'] = {
        price: 72.30,
        timestamp: Date.now() - 20 * 60 * 1000,
        expiresAt: Date.now() - 5 * 60 * 1000,
      };
      localStorage.setItem('portfolio_price_cache', JSON.stringify(cache));

      const tickers = cacheService.getCachedTickers();

      expect(tickers).toHaveLength(1);
      expect(tickers[0]).toBe('VTI');
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      cacheService.setCachedPrice('VTI', 235.50);
      cacheService.setCachedPrice('BND', 72.30);

      const stats = cacheService.getCacheStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.expiredEntries).toBe(0);
      expect(stats.freshEntries).toBe(2);
    });

    it('should count expired entries correctly', () => {
      // Add fresh entry
      cacheService.setCachedPrice('VTI', 235.50);

      // Add expired entry
      const cache = JSON.parse(localStorage.getItem('portfolio_price_cache') || '{}');
      cache['BND'] = {
        price: 72.30,
        timestamp: Date.now() - 20 * 60 * 1000,
        expiresAt: Date.now() - 5 * 60 * 1000,
      };
      localStorage.setItem('portfolio_price_cache', JSON.stringify(cache));

      const stats = cacheService.getCacheStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.expiredEntries).toBe(1);
      expect(stats.freshEntries).toBe(1);
    });
  });
});
