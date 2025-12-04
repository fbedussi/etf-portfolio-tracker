import type { PriceCache, PriceData } from '@/types/api.types';

/**
 * Cache service for storing ETF prices in localStorage
 * Reduces API calls by caching prices with configurable expiration
 */
export class CacheService {
  private readonly CACHE_KEY = 'portfolio_price_cache';
  private readonly CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours (1 day)

  /**
   * Get cached price for a ticker if still fresh
   * @param ticker - ETF ticker symbol
   * @returns PriceData if cached and fresh, null otherwise
   */
  getCachedPrice(ticker: string): PriceData | null {
    try {
      const cache = this.readCache();
      const normalizedTicker = ticker.toUpperCase();
      const cached = cache[normalizedTicker];

      if (!cached) {
        return null;
      }

      // Check if cache is still fresh
      const now = Date.now();
      if (now > cached.expiresAt) {
        console.log(`Cache expired for ${ticker}`);
        // Remove expired entry
        delete cache[normalizedTicker];
        this.writeCache(cache);
        return null;
      }

      console.log(`Cache hit for ${ticker} (expires in ${Math.round((cached.expiresAt - now) / 1000 / 60)}m)`);

      return {
        ticker: normalizedTicker,
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
  setCachedPrice(ticker: string, price: number): void {
    try {
      const cache = this.readCache();
      const normalizedTicker = ticker.toUpperCase();
      const now = Date.now();

      cache[normalizedTicker] = {
        price,
        timestamp: now,
        expiresAt: now + this.CACHE_EXPIRATION_MS,
      };

      this.writeCache(cache);
      console.log(`Cached ${ticker} at $${price.toFixed(2)}`);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  /**
   * Store PriceData in cache
   * @param priceData - PriceData object from API
   */
  cachePriceData(priceData: PriceData): void {
    this.setCachedPrice(priceData.ticker, priceData.price);
  }

  /**
   * Clear all cached prices
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('Price cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear expired entries from cache
   * @returns Number of entries removed
   */
  clearExpiredEntries(): number {
    try {
      const cache = this.readCache();
      const now = Date.now();
      let removed = 0;

      Object.keys(cache).forEach((ticker) => {
        if (now > cache[ticker].expiresAt) {
          delete cache[ticker];
          removed++;
        }
      });

      if (removed > 0) {
        this.writeCache(cache);
        console.log(`Removed ${removed} expired cache entries`);
      }

      return removed;
    } catch (error) {
      console.error('Error clearing expired entries:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    freshEntries: number;
    expiredEntries: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    try {
      const cache = this.readCache();
      const now = Date.now();
      const tickers = Object.keys(cache);

      const fresh = tickers.filter((t) => cache[t].expiresAt > now);
      const expired = tickers.filter((t) => cache[t].expiresAt <= now);

      const timestamps = tickers.map((t) => cache[t].timestamp);
      const oldest = timestamps.length > 0 ? Math.min(...timestamps) : null;
      const newest = timestamps.length > 0 ? Math.max(...timestamps) : null;

      return {
        totalEntries: tickers.length,
        freshEntries: fresh.length,
        expiredEntries: expired.length,
        oldestEntry: oldest,
        newestEntry: newest,
      };
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
  getCachedTickers(): string[] {
    try {
      const cache = this.readCache();
      const now = Date.now();

      return Object.keys(cache).filter((ticker) => cache[ticker].expiresAt > now);
    } catch (error) {
      console.error('Error getting cached tickers:', error);
      return [];
    }
  }

  /**
   * Check if a ticker is cached and fresh
   */
  isCached(ticker: string): boolean {
    return this.getCachedPrice(ticker) !== null;
  }

  /**
   * Get cache expiration time in milliseconds
   */
  getCacheExpiration(): number {
    return this.CACHE_EXPIRATION_MS;
  }

  /**
   * Read cache from localStorage
   */
  private readCache(): PriceCache {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return {};
      }

      const parsed = JSON.parse(cached);
      
      // Validate cache structure
      if (typeof parsed !== 'object' || parsed === null) {
        console.warn('Invalid cache structure, resetting cache');
        return {};
      }

      return parsed;
    } catch (error) {
      console.error('Error reading cache, resetting:', error);
      return {};
    }
  }

  /**
   * Write cache to localStorage
   */
  private writeCache(cache: PriceCache): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      // Handle localStorage quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded, clearing old cache');
        this.clearCache();
      } else {
        console.error('Error writing to cache:', error);
      }
    }
  }

  /**
   * Export cache for debugging
   */
  exportCache(): PriceCache {
    return this.readCache();
  }

  /**
   * Import cache (for testing or migration)
   */
  importCache(cache: PriceCache): void {
    this.writeCache(cache);
  }
}

// Export singleton instance
export const cacheService = new CacheService();
