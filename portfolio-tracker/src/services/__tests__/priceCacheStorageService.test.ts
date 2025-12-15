import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { priceCacheStorageService } from '../priceCacheStorageService';
import 'fake-indexeddb/auto';

describe('PriceCacheStorageService', () => {
  beforeEach(async () => {
    // Clear IndexedDB before each test
    await priceCacheStorageService.clearCache();
  });

  afterEach(async () => {
    // Clean up after each test
    await priceCacheStorageService.clearCache();
  });

  describe('initialize', () => {
    it('should initialize IndexedDB connection', async () => {
      await expect(priceCacheStorageService.initialize()).resolves.toBeUndefined();
    });

    it('should not reinitialize if already initialized', async () => {
      await priceCacheStorageService.initialize();
      await expect(priceCacheStorageService.initialize()).resolves.toBeUndefined();
    });
  });

  describe('setCachedPrice and getCachedPrice', () => {
    it('should store and retrieve a cached price', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);

      const cached = await priceCacheStorageService.getCachedPrice('VTI');

      expect(cached).toBeTruthy();
      expect(cached?.isin).toBe('VTI');
      expect(cached?.price).toBe(235.50);
      expect(cached?.timestamp).toBeGreaterThan(0);
      expect(cached?.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should normalize ticker symbols to uppercase', async () => {
      await priceCacheStorageService.setCachedPrice('vti', 235.50, 3600000);

      const cached = await priceCacheStorageService.getCachedPrice('VTI');

      expect(cached?.isin).toBe('VTI');
    });

    it('should return null for non-existent ticker', async () => {
      const cached = await priceCacheStorageService.getCachedPrice('NONEXISTENT');

      expect(cached).toBeNull();
    });

    it('should automatically delete expired entries', async () => {
      // Set with immediate expiration
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 0);

      // Wait a bit to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const cached = await priceCacheStorageService.getCachedPrice('VTI');

      expect(cached).toBeNull();
    });

    it('should update existing cached price', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);
      await priceCacheStorageService.setCachedPrice('VTI', 240.00, 3600000);

      const cached = await priceCacheStorageService.getCachedPrice('VTI');

      expect(cached?.price).toBe(240.00);
    });
  });

  describe('deleteCachedPrice', () => {
    it('should delete a cached price', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);

      await priceCacheStorageService.deleteCachedPrice('VTI');

      const cached = await priceCacheStorageService.getCachedPrice('VTI');
      expect(cached).toBeNull();
    });

    it('should handle deleting non-existent ticker', async () => {
      await expect(
        priceCacheStorageService.deleteCachedPrice('NONEXISTENT')
      ).resolves.toBeUndefined();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached prices', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);
      await priceCacheStorageService.setCachedPrice('BND', 72.30, 3600000);

      await priceCacheStorageService.clearCache();

      const vti = await priceCacheStorageService.getCachedPrice('VTI');
      const bnd = await priceCacheStorageService.getCachedPrice('BND');

      expect(vti).toBeNull();
      expect(bnd).toBeNull();
    });
  });

  describe('getCachedTickers', () => {
    it('should return all cached ticker symbols', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);
      await priceCacheStorageService.setCachedPrice('BND', 72.30, 3600000);

      const tickers = await priceCacheStorageService.getCachedIsins();

      expect(tickers).toContain('VTI');
      expect(tickers).toContain('BND');
      expect(tickers.length).toBe(2);
    });

    it('should return empty array when cache is empty', async () => {
      const tickers = await priceCacheStorageService.getCachedIsins();

      expect(tickers).toEqual([]);
    });
  });

  describe('getAllCachedPrices', () => {
    it('should return all cached prices', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);
      await priceCacheStorageService.setCachedPrice('BND', 72.30, 3600000);

      const prices = await priceCacheStorageService.getAllCachedPrices();

      expect(prices.length).toBe(2);
      expect(prices.some((p) => p.isin === 'VTI' && p.price === 235.50)).toBe(true);
      expect(prices.some((p) => p.isin === 'BND' && p.price === 72.30)).toBe(true);
    });
  });

  describe('clearExpiredEntries', () => {
    it('should remove only expired entries', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000); // Fresh
      await priceCacheStorageService.setCachedPrice('BND', 72.30, 0); // Expired

      // Wait to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const removed = await priceCacheStorageService.clearExpiredEntries();

      expect(removed).toBe(1);

      const vti = await priceCacheStorageService.getCachedPrice('VTI');
      const bnd = await priceCacheStorageService.getCachedPrice('BND');

      expect(vti).toBeTruthy();
      expect(bnd).toBeNull();
    });

    it('should return 0 when no entries are expired', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);
      await priceCacheStorageService.setCachedPrice('BND', 72.30, 3600000);

      const removed = await priceCacheStorageService.clearExpiredEntries();

      expect(removed).toBe(0);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);
      await priceCacheStorageService.setCachedPrice('BND', 72.30, 3600000);

      const stats = await priceCacheStorageService.getCacheStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.freshEntries).toBe(2);
      expect(stats.expiredEntries).toBe(0);
      expect(stats.oldestEntry).toBeGreaterThan(0);
      expect(stats.newestEntry).toBeGreaterThan(0);
    });

    it('should count expired entries correctly', async () => {
      await priceCacheStorageService.setCachedPrice('VTI', 235.50, 3600000);
      await priceCacheStorageService.setCachedPrice('BND', 72.30, 0);

      // Wait to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const stats = await priceCacheStorageService.getCacheStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.freshEntries).toBe(1);
      expect(stats.expiredEntries).toBe(1);
    });

    it('should return empty stats for empty cache', async () => {
      const stats = await priceCacheStorageService.getCacheStats();

      expect(stats.totalEntries).toBe(0);
      expect(stats.freshEntries).toBe(0);
      expect(stats.expiredEntries).toBe(0);
      expect(stats.oldestEntry).toBeNull();
      expect(stats.newestEntry).toBeNull();
    });
  });
});
