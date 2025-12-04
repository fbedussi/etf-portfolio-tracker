import type { Portfolio } from '@/types';

/**
 * Service for persisting portfolio data to IndexedDB
 * Enables automatic restoration of portfolio on page reload
 */
export class PortfolioStorageService {
  private readonly DB_NAME = 'portfolio_tracker_db';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'portfolios';
  private readonly PORTFOLIO_KEY = 'current_portfolio';

  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
          console.log('Created portfolios object store');
        }
      };
    });
  }

  /**
   * Save portfolio to IndexedDB
   */
  async savePortfolio(portfolio: Portfolio): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const portfolioData = {
        portfolio,
        savedAt: Date.now(),
        version: this.DB_VERSION,
      };

      const request = store.put(portfolioData, this.PORTFOLIO_KEY);

      request.onsuccess = () => {
        console.log('Portfolio saved to IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save portfolio:', request.error);
        reject(new Error('Failed to save portfolio to IndexedDB'));
      };
    });
  }

  /**
   * Load portfolio from IndexedDB
   */
  async loadPortfolio(): Promise<Portfolio | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(this.PORTFOLIO_KEY);

      request.onsuccess = () => {
        const data = request.result;
        
        if (!data || !data.portfolio) {
          console.log('No saved portfolio found');
          resolve(null);
          return;
        }

        // Check if data structure is valid
        if (typeof data.portfolio !== 'object') {
          console.warn('Invalid portfolio data structure');
          resolve(null);
          return;
        }

        console.log('Portfolio loaded from IndexedDB', {
          savedAt: new Date(data.savedAt).toISOString(),
          etfCount: data.portfolio.etfs?.length || 0,
        });

        resolve(data.portfolio);
      };

      request.onerror = () => {
        console.error('Failed to load portfolio:', request.error);
        // Don't reject - just return null for failed loads
        resolve(null);
      };
    });
  }

  /**
   * Clear saved portfolio
   */
  async clearPortfolio(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(this.PORTFOLIO_KEY);

      request.onsuccess = () => {
        console.log('Portfolio cleared from IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear portfolio:', request.error);
        reject(new Error('Failed to clear portfolio from IndexedDB'));
      };
    });
  }

  /**
   * Check if a portfolio is saved
   */
  async hasPortfolio(): Promise<boolean> {
    try {
      const portfolio = await this.loadPortfolio();
      return portfolio !== null;
    } catch (error) {
      console.error('Error checking for saved portfolio:', error);
      return false;
    }
  }

  /**
   * Get metadata about saved portfolio
   */
  async getPortfolioMetadata(): Promise<{
    savedAt: number;
    etfCount: number;
  } | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(this.PORTFOLIO_KEY);

      request.onsuccess = () => {
        const data = request.result;
        
        if (!data || !data.portfolio) {
          resolve(null);
          return;
        }

        resolve({
          savedAt: data.savedAt,
          etfCount: data.portfolio.etfs?.length || 0,
        });
      };

      request.onerror = () => {
        console.error('Failed to get portfolio metadata:', request.error);
        resolve(null);
      };
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('IndexedDB connection closed');
    }
  }
}

// Export singleton instance
export const portfolioStorageService = new PortfolioStorageService();
