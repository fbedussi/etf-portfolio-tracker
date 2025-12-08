/**
 * IndexedDB storage service for price cache
 * Provides persistent, high-capacity storage for ETF price data
 */

const DB_NAME = 'portfolio-tracker-db';
const DB_VERSION = 1;
const PRICE_CACHE_STORE = 'price-cache';

export interface CachedPrice {
  isin: string;
  price: number;
  timestamp: number;
  expiresAt: number;
}

export class PriceCacheStorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

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
            keyPath: 'isin',
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

  async getCachedPrice(isin: string): Promise<CachedPrice | null> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readonly');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.get(isin.toUpperCase());

      request.onsuccess = () => {
        const cached = request.result as CachedPrice | undefined;

        if (!cached) {
          resolve(null);
          return;
        }

        // Check if still fresh
        if (Date.now() > cached.expiresAt) {
          // Expired, remove it
          this.deleteCachedPrice(isin).catch(console.error);
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

  async setCachedPrice(
    isin: string,
    price: number,
    expirationMs: number
  ): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const now = Date.now();
    const cachedPrice: CachedPrice = {
      isin: isin.toUpperCase(),
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

  async deleteCachedPrice(isin: string): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.delete(isin.toUpperCase());

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting cached price:', request.error);
        reject(request.error);
      };
    });
  }

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

  async getCachedIsins(): Promise<string[]> {
    await this.initialize();

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRICE_CACHE_STORE], 'readonly');
      const store = transaction.objectStore(PRICE_CACHE_STORE);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        const isins = request.result as string[];
        resolve(isins);
      };

      request.onerror = () => {
        console.error('Error getting cached isins:', request.error);
        reject(request.error);
      };
    });
  }

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
}

// Export singleton instance
export const priceCacheStorageService = new PriceCacheStorageService();
