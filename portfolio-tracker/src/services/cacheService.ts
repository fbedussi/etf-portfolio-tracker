import type { PriceData } from '@/types/api.types';
import { priceCacheStorageService } from './priceCacheStorageService';

/**
 * Cache service for storing ETF prices in IndexedDB
 * Reduces API calls by caching prices with configurable expiration
 */
export class CacheService {
  private readonly CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours (1 day)
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize cache service and migrate from localStorage if needed
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      await priceCacheStorageService.initialize();
      await priceCacheStorageService.migrateFromLocalStorage();
    })();

    return this.initPromise;
  }

  /**
   * Get cached price for a ticker if still fresh
   * @param ticker - ETF ticker symbol
   * @returns PriceData if cached and fresh, null otherwise
   */
  async getCachedPrice(ticker: string): Promise<PriceData | null> {
    try {
      await this.ensureInitialized();
      const cached = await priceCacheStorageService.getCachedPrice(ticker);

      if (!cached) {
        return null;
      }

      const now = Date.now();
      console.log(`Cache hit for ${ticker} (expires in ${Math.round((cached.expiresAt - now) / 1000 / 60)}m)`);

      return {
        ticker: cached.ticker,
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

  /**
   * Store price in cache
   * @param ticker - ETF ticker symbol
   * @param price - Current price
   */
  async setCachedPrice(ticker: string, price: number): Promise<void> {
    try {
      await this.ensureInitialized();
      await priceCacheStorageService.setCachedPrice(
        ticker,
        price,
        this.CACHE_EXPIRATION_MS
      );
      console.log(`Cached ${ticker} at $${price.toFixed(2)}`);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  /**
   * Store PriceData in cache
   * @param priceData - PriceData object from API
   */
  async cachePriceData(priceData: PriceData): Promise<void> {
    await this.setCachedPrice(priceData.ticker, priceData.price);
  }

  /**
   * Clear all cached prices
   */
  async clearCache(): Promise<void> {
    try {
      await this.ensureInitialized();
      await priceCacheStorageService.clearCache();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear expired entries from cache
   * @returns Number of entries removed
   */
  async clearExpiredEntries(): Promise<number> {
    try {
      await this.ensureInitialized();
      return await priceCacheStorageService.clearExpiredEntries();
    } catch (error) {
      console.error('Error clearing expired entries:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
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

  /**
   * Get all cached tickers (fresh only)
   */
  async getCachedTickers(): Promise<string[]> {
    try {
      await this.ensureInitialized();
      return await priceCacheStorageService.getCachedTickers();
    } catch (error) {
      console.error('Error getting cached tickers:', error);
      return [];
    }
  }

  /**
   * Check if a ticker is cached and fresh
   */
  async isCached(ticker: string): Promise<boolean> {
    const cached = await this.getCachedPrice(ticker);
    return cached !== null;
  }

  /**
   * Get cache expiration time in milliseconds
   */
  getCacheExpiration(): number {
    return this.CACHE_EXPIRATION_MS;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
