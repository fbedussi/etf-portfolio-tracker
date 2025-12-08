import type { PriceData } from '@/types/api.types';
import { priceCacheStorageService } from './priceCacheStorageService';

/**
 * Cache service for storing ETF prices in IndexedDB
 * Reduces API calls by caching prices with configurable expiration
 */
export class CacheService {
  private readonly CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours (1 day)
  private initPromise: Promise<void> | null = null;

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = priceCacheStorageService.initialize();
  
    return this.initPromise;
  }

  async getCachedPrice(isin: string): Promise<PriceData | null> {
    try {
      await this.ensureInitialized();
      const cached = await priceCacheStorageService.getCachedPrice(isin);

      if (!cached) {
        return null;
      }

      const now = Date.now();
      console.log(`Cache hit for ${isin} (expires in ${Math.round((cached.expiresAt - now) / 1000 / 60)}m)`);

      return {
        isin: cached.isin,
        price: cached.price,
        timestamp: cached.timestamp,
        currency: 'USD',
        source: 'cache',
      };
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  async setCachedPrice(isin: string, price: number): Promise<void> {
    try {
      await this.ensureInitialized();
      await priceCacheStorageService.setCachedPrice(
        isin,
        price,
        this.CACHE_EXPIRATION_MS
      );
      console.log(`Cached ${isin} at $${price.toFixed(2)}`);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  async cachePriceData(priceData: PriceData): Promise<void> {
    await this.setCachedPrice(priceData.isin, priceData.price);
  }

  async clearCache(): Promise<void> {
    try {
      await this.ensureInitialized();
      await priceCacheStorageService.clearCache();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async clearExpiredEntries(): Promise<number> {
    try {
      await this.ensureInitialized();
      return await priceCacheStorageService.clearExpiredEntries();
    } catch (error) {
      console.error('Error clearing expired entries:', error);
      return 0;
    }
  }

  async getCacheStats(): Promise<{
    totalEntries: number;
    freshEntries: number;
    expiredEntries: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  }> {
    try {
      await this.ensureInitialized();
      return await priceCacheStorageService.getCacheStats();
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalEntries: 0,
        freshEntries: 0,
        expiredEntries: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }

  async getCachedIsins(): Promise<string[]> {
    try {
      await this.ensureInitialized();
      return await priceCacheStorageService.getCachedIsins();
    } catch (error) {
      console.error('Error getting cached isins:', error);
      return [];
    }
  }

  async isCached(isin: string): Promise<boolean> {
    const cached = await this.getCachedPrice(isin);
    return cached !== null;
  }

  getCacheExpiration(): number {
    return this.CACHE_EXPIRATION_MS;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
