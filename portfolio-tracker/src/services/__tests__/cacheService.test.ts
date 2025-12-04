import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cacheService } from '../cacheService';
import 'fake-indexeddb/auto';

describe('CacheService', () => {
  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.clearCache();
  });

  afterEach(async () => {
    await cacheService.clearCache();
  });

  describe('getCachedPrice', () => {
    it('should return null for uncached ticker', async () => {
      const result = await cacheService.getCachedPrice('VTI');
      expect(result).toBeNull();
    });

    it('should return cached price if still fresh', async () => {
      // Set a price that expires in the future
      await cacheService.setCachedPrice('VTI', 235.50);

      const result = await cacheService.getCachedPrice('VTI');

      expect(result).not.toBeNull();
      expect(result?.ticker).toBe('VTI');
      expect(result?.price).toBe(235.50);
      expect(result?.source).toBe('cache');
    });

    it('should be case-insensitive for ticker symbols', async () => {
      await cacheService.setCachedPrice('VTI', 235.50);

      const result1 = await cacheService.getCachedPrice('vti');
      const result2 = await cacheService.getCachedPrice('VTI');

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result1?.ticker).toBe(result2?.ticker);
    });
  });

  describe('setCachedPrice', () => {
    it('should store a price in cache', async () => {
      await cacheService.setCachedPrice('VTI', 235.50);

      const result = await cacheService.getCachedPrice('VTI');

      expect(result).not.toBeNull();
      expect(result?.price).toBe(235.50);
    });

    it('should update existing cached price', async () => {
      await cacheService.setCachedPrice('VTI', 235.50);
      await cacheService.setCachedPrice('VTI', 240.00);

      const result = await cacheService.getCachedPrice('VTI');

      expect(result?.price).toBe(240.00);
    });

    it('should normalize ticker to uppercase', async () => {
      await cacheService.setCachedPrice('vti', 235.50);

      const result = await cacheService.getCachedPrice('VTI');

      expect(result).not.toBeNull();
      expect(result?.ticker).toBe('VTI');
    });
  });

  describe('cachePriceData', () => {
    it('should cache a PriceData object', async () => {
      await cacheService.cachePriceData({
        ticker: 'VTI',
        price: 235.50,
        timestamp: Date.now(),
        currency: 'USD',
        source: 'alphavantage',
      });

      const result = await cacheService.getCachedPrice('VTI');

      expect(result).not.toBeNull();
      expect(result?.price).toBe(235.50);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached prices', async () => {
      await cacheService.setCachedPrice('VTI', 235.50);
      await cacheService.setCachedPrice('BND', 72.30);

      await cacheService.clearCache();

      const vti = await cacheService.getCachedPrice('VTI');
      const bnd = await cacheService.getCachedPrice('BND');

      expect(vti).toBeNull();
      expect(bnd).toBeNull();
    });
  });

  describe('clearExpiredEntries', () => {
    it('should remove expired entries', async () => {
      await cacheService.setCachedPrice('VTI', 235.50);

      const removed = await cacheService.clearExpiredEntries();

      expect(removed).toBe(0);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      await cacheService.setCachedPrice('VTI', 235.50);
      await cacheService.setCachedPrice('BND', 72.30);

      const stats = await cacheService.getCacheStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.freshEntries).toBe(2);
      expect(stats.expiredEntries).toBe(0);
    });

    it('should return empty stats for empty cache', async () => {
      const stats = await cacheService.getCacheStats();

      expect(stats.totalEntries).toBe(0);
      expect(stats.freshEntries).toBe(0);
      expect(stats.expiredEntries).toBe(0);
      expect(stats.oldestEntry).toBeNull();
      expect(stats.newestEntry).toBeNull();
    });
  });

  describe('getCachedTickers', () => {
    it('should return all cached tickers', async () => {
      await cacheService.setCachedPrice('VTI', 235.50);
      await cacheService.setCachedPrice('BND', 72.30);

      const tickers = await cacheService.getCachedTickers();

      expect(tickers).toContain('VTI');
      expect(tickers).toContain('BND');
      expect(tickers.length).toBe(2);
    });

    it('should return empty array when cache is empty', async () => {
      const tickers = await cacheService.getCachedTickers();

      expect(tickers).toEqual([]);
    });
  });

  describe('isCached', () => {
    it('should return true for cached ticker', async () => {
      await cacheService.setCachedPrice('VTI', 235.50);

      const result = await cacheService.isCached('VTI');

      expect(result).toBe(true);
    });

    it('should return false for uncached ticker', async () => {
      const result = await cacheService.isCached('NONEXISTENT');

      expect(result).toBe(false);
    });
  });

  describe('getCacheExpiration', () => {
    it('should return cache expiration time in milliseconds', () => {
      const expiration = cacheService.getCacheExpiration();

      expect(expiration).toBe(24 * 60 * 60 * 1000); // 24 hours
    });
  });
});
