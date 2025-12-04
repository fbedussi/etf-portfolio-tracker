/**
 * IndexedDB storage service for price cache
 * Provides persistent, high-capacity storage for ETF price data
 */

import type { PriceData } from '@/types/api.types';

const DB_NAME = 'portfolio-tracker-db';
const DB_VERSION = 1;
const PRICE_CACHE_STORE = 'price-cache';

export interface CachedPrice {
  ticker: string;
  price: number;
  timestamp: number;
  expiresAt: number;
}

export class PriceCacheStorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async initialize(): Promise<void> {
    if (this.db) {
      return; // Already initialized
    }

    if (this.initPromise) {
      return this.initPromise; // Initialization in progress
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Price cache IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create price cache store if it doesn't exist
        if (!db.objectStoreNames.contains(PRICE_CACHE_STORE)) {
          const priceStore = db.createObjectStore(PRICE_CACHE_STORE, {
            keyPath: 'ticker',
          });
          
          // Create indexes for efficient queries
          priceStore.createIndex('timestamp', 'timestamp', { unique: false });
          priceStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          
          console.log('Price cache object store created');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get cached price for a ticker
   */
  async getCachedPrice(ticker: string): Promise<CachedPrice | null> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readonly');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.get(ticker.toUpperCase());

      request.onsuccess = () => {
        const cached = request.result as CachedPrice | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // Check if still fresh
        if (Date.now() > cached.expiresAt) {
          // Expired, remove it
          this.deleteCachedPrice(ticker).catch(console.error);
          resolve(null);
          return;
        }

        resolve(cached);
      };

      request.onerror = () => {
        console.error('Error reading cached price:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Store price in cache
   */
  async setCachedPrice(
    ticker: string,
    price: number,
    expirationMs: number
  ): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const now = Date.now();
    const cachedPrice: CachedPrice = {
      ticker: ticker.toUpperCase(),
      price,
      timestamp: now,
      expiresAt: now + expirationMs,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.put(cachedPrice);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error storing cached price:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete a cached price
   */
  async deleteCachedPrice(ticker: string): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.delete(ticker.toUpperCase());

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting cached price:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all cached prices
   */
  async clearCache(): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Price cache cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing cache:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all cached tickers (fresh only)
   */
  async getCachedTickers(): Promise<string[]> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readonly');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        const tickers = request.result as string[];
        resolve(tickers);
      };

      request.onerror = () => {
        console.error('Error getting cached tickers:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all cached prices
   */
  async getAllCachedPrices(): Promise<CachedPrice[]> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readonly');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const prices = request.result as CachedPrice[];
        resolve(prices);
      };

      request.onerror = () => {
        console.error('Error getting all cached prices:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear expired entries from cache
   */
  async clearExpiredEntries(): Promise<number> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const now = Date.now();
    let removed = 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const index = store.index('expiresAt');
      
      // Get all entries that have expired (expiresAt < now)
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          cursor.delete();
          removed++;
          cursor.continue();
        } else {
          // Done iterating
          if (removed > 0) {
            console.log(`Removed ${removed} expired cache entries`);
          }
          resolve(removed);
        }
      };

      request.onerror = () => {
        console.error('Error clearing expired entries:', request.error);
        reject(request.error);
      };
    });
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
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const allPrices = await this.getAllCachedPrices();
    const now = Date.now();

    const fresh = allPrices.filter((p) => p.expiresAt > now);
    const expired = allPrices.filter((p) => p.expiresAt <= now);

    const timestamps = allPrices.map((p) => p.timestamp);
    const oldest = timestamps.length > 0 ? Math.min(...timestamps) : null;
    const newest = timestamps.length > 0 ? Math.max(...timestamps) : null;

    return {
      totalEntries: allPrices.length,
      freshEntries: fresh.length,
      expiredEntries: expired.length,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }

  /**
   * Migrate data from localStorage to IndexedDB
   */
  async migrateFromLocalStorage(): Promise<number> {
    const CACHE_KEY = 'portfolio_price_cache';
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        return 0; // Nothing to migrate
      }

      const localStorageCache = JSON.parse(cached);
      const tickers = Object.keys(localStorageCache);
      
      let migrated = 0;
      for (const ticker of tickers) {
        const entry = localStorageCache[ticker];
        
        // Only migrate if still fresh
        if (Date.now() < entry.expiresAt) {
          await this.setCachedPrice(
            ticker,
            entry.price,
            entry.expiresAt - Date.now()
          );
          migrated++;
        }
      }

      // Clear localStorage cache after successful migration
      if (migrated > 0) {
        localStorage.removeItem(CACHE_KEY);
        console.log(`Migrated ${migrated} price entries from localStorage to IndexedDB`);
      }

      return migrated;
    } catch (error) {
      console.error('Error migrating price cache:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const priceCacheStorageService = new PriceCacheStorageService();
