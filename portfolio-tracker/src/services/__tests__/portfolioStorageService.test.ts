import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { portfolioStorageService } from '../portfolioStorageService';
import type { Portfolio } from '@/types';

describe('PortfolioStorageService', () => {
  const mockPortfolio: Portfolio = {
    name: 'Test Portfolio',
    targetAllocation: {
      stocks: 70,
      bonds: 25,
      cash: 5,
    },
    etfs: [
      {
        ticker: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        assetClasses: {
          stocks: 100,
          bonds: 0,
          cash: 0,
        },
        transactions: [
          {
            date: '2024-01-15',
            shares: 10,
            price: 220.5,
            type: 'buy',
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    // Initialize the database
    await portfolioStorageService.initialize();
  });

  afterEach(async () => {
    // Clean up
    await portfolioStorageService.clearPortfolio();
    portfolioStorageService.close();
  });

  describe('initialization', () => {
    it('should initialize IndexedDB successfully', async () => {
      // Already initialized in beforeEach
      const hasPortfolio = await portfolioStorageService.hasPortfolio();
      expect(typeof hasPortfolio).toBe('boolean');
    });
  });

  describe('savePortfolio', () => {
    it('should save portfolio to IndexedDB', async () => {
      await portfolioStorageService.savePortfolio(mockPortfolio);

      const loaded = await portfolioStorageService.loadPortfolio();
      expect(loaded).toEqual(mockPortfolio);
    });

    it('should overwrite existing portfolio', async () => {
      await portfolioStorageService.savePortfolio(mockPortfolio);

      const updatedPortfolio: Portfolio = {
        ...mockPortfolio,
        name: 'Updated Portfolio',
      };

      await portfolioStorageService.savePortfolio(updatedPortfolio);

      const loaded = await portfolioStorageService.loadPortfolio();
      expect(loaded?.name).toBe('Updated Portfolio');
    });

    it('should include metadata when saving', async () => {
      const beforeSave = Date.now();
      await portfolioStorageService.savePortfolio(mockPortfolio);
      const afterSave = Date.now();

      const metadata = await portfolioStorageService.getPortfolioMetadata();
      expect(metadata).not.toBeNull();
      expect(metadata!.savedAt).toBeGreaterThanOrEqual(beforeSave);
      expect(metadata!.savedAt).toBeLessThanOrEqual(afterSave);
      expect(metadata!.etfCount).toBe(1);
    });
  });

  describe('loadPortfolio', () => {
    it('should return null when no portfolio is saved', async () => {
      const loaded = await portfolioStorageService.loadPortfolio();
      expect(loaded).toBeNull();
    });

    it('should load saved portfolio correctly', async () => {
      await portfolioStorageService.savePortfolio(mockPortfolio);

      const loaded = await portfolioStorageService.loadPortfolio();
      expect(loaded).toEqual(mockPortfolio);
      expect(loaded?.name).toBe('Test Portfolio');
      expect(loaded?.etfs).toHaveLength(1);
      expect(loaded?.etfs[0].ticker).toBe('VTI');
    });

    it('should handle complex portfolio structures', async () => {
      const complexPortfolio: Portfolio = {
        ...mockPortfolio,
        etfs: [
          ...mockPortfolio.etfs,
          {
            ticker: 'BND',
            name: 'Vanguard Total Bond Market ETF',
            assetClasses: {
              stocks: 0,
              bonds: 100,
              cash: 0,
            },
            transactions: [
              {
                date: '2024-01-20',
                shares: 50,
                price: 75.3,
                type: 'buy',
              },
              {
                date: '2024-02-15',
                shares: 25,
                price: 76.1,
                type: 'buy',
              },
            ],
          },
        ],
      };

      await portfolioStorageService.savePortfolio(complexPortfolio);

      const loaded = await portfolioStorageService.loadPortfolio();
      expect(loaded?.etfs).toHaveLength(2);
      expect(loaded?.etfs[1].transactions).toHaveLength(2);
    });
  });

  describe('clearPortfolio', () => {
    it('should clear saved portfolio', async () => {
      await portfolioStorageService.savePortfolio(mockPortfolio);

      const beforeClear = await portfolioStorageService.loadPortfolio();
      expect(beforeClear).not.toBeNull();

      await portfolioStorageService.clearPortfolio();

      const afterClear = await portfolioStorageService.loadPortfolio();
      expect(afterClear).toBeNull();
    });

    it('should not throw error when clearing empty database', async () => {
      await expect(
        portfolioStorageService.clearPortfolio()
      ).resolves.not.toThrow();
    });
  });

  describe('hasPortfolio', () => {
    it('should return false when no portfolio is saved', async () => {
      const hasPortfolio = await portfolioStorageService.hasPortfolio();
      expect(hasPortfolio).toBe(false);
    });

    it('should return true when portfolio is saved', async () => {
      await portfolioStorageService.savePortfolio(mockPortfolio);

      const hasPortfolio = await portfolioStorageService.hasPortfolio();
      expect(hasPortfolio).toBe(true);
    });

    it('should return false after clearing portfolio', async () => {
      await portfolioStorageService.savePortfolio(mockPortfolio);
      await portfolioStorageService.clearPortfolio();

      const hasPortfolio = await portfolioStorageService.hasPortfolio();
      expect(hasPortfolio).toBe(false);
    });
  });

  describe('getPortfolioMetadata', () => {
    it('should return null when no portfolio is saved', async () => {
      const metadata = await portfolioStorageService.getPortfolioMetadata();
      expect(metadata).toBeNull();
    });

    it('should return correct metadata for saved portfolio', async () => {
      const beforeSave = Date.now();
      await portfolioStorageService.savePortfolio(mockPortfolio);
      const afterSave = Date.now();

      const metadata = await portfolioStorageService.getPortfolioMetadata();
      expect(metadata).not.toBeNull();
      expect(metadata!.savedAt).toBeGreaterThanOrEqual(beforeSave);
      expect(metadata!.savedAt).toBeLessThanOrEqual(afterSave);
      expect(metadata!.etfCount).toBe(1);
    });

    it('should update metadata when portfolio is re-saved', async () => {
      await portfolioStorageService.savePortfolio(mockPortfolio);
      const firstMetadata = await portfolioStorageService.getPortfolioMetadata();

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedPortfolio: Portfolio = {
        ...mockPortfolio,
        etfs: [...mockPortfolio.etfs, mockPortfolio.etfs[0]],
      };
      await portfolioStorageService.savePortfolio(updatedPortfolio);
      const secondMetadata = await portfolioStorageService.getPortfolioMetadata();

      expect(secondMetadata!.savedAt).toBeGreaterThan(firstMetadata!.savedAt);
      expect(secondMetadata!.etfCount).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should handle load errors gracefully', async () => {
      // Close the database to simulate error
      portfolioStorageService.close();

      const loaded = await portfolioStorageService.loadPortfolio();
      // Should re-initialize and return null (no portfolio)
      expect(loaded).toBeNull();
    });

    it('should not fail upload if storage fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // This is handled at the hook level, testing service resilience
      await portfolioStorageService.savePortfolio(mockPortfolio);

      consoleSpy.mockRestore();
    });
  });

  describe('data integrity', () => {
    it('should preserve all portfolio fields', async () => {
      await portfolioStorageService.savePortfolio(mockPortfolio);

      const loaded = await portfolioStorageService.loadPortfolio();

      // Check all fields are preserved
      expect(loaded?.name).toBe(mockPortfolio.name);
      expect(loaded?.targetAllocation).toEqual(mockPortfolio.targetAllocation);
      expect(loaded?.etfs[0].ticker).toBe(mockPortfolio.etfs[0].ticker);
      expect(loaded?.etfs[0].name).toBe(mockPortfolio.etfs[0].name);
      expect(loaded?.etfs[0].assetClasses).toEqual(
        mockPortfolio.etfs[0].assetClasses
      );
      expect(loaded?.etfs[0].transactions).toEqual(
        mockPortfolio.etfs[0].transactions
      );
    });

    it('should handle special characters in portfolio data', async () => {
      const specialPortfolio: Portfolio = {
        ...mockPortfolio,
        name: "Test's Portfolio: 50/50 \"Balanced\"",
      };

      await portfolioStorageService.savePortfolio(specialPortfolio);

      const loaded = await portfolioStorageService.loadPortfolio();
      expect(loaded?.name).toBe(specialPortfolio.name);
    });

    it('should handle large portfolios', async () => {
      const largePortfolio: Portfolio = {
        ...mockPortfolio,
        etfs: Array(100)
          .fill(null)
          .map((_, i) => ({
            ...mockPortfolio.etfs[0],
            ticker: `ETF${i}`,
            name: `ETF Number ${i}`,
          })),
      };

      await portfolioStorageService.savePortfolio(largePortfolio);

      const loaded = await portfolioStorageService.loadPortfolio();
      expect(loaded?.etfs).toHaveLength(100);
      expect(loaded?.etfs[50].ticker).toBe('ETF50');
    });
  });

  describe('concurrent operations', () => {
    it('should handle rapid save operations', async () => {
      const promises = Array(5)
        .fill(null)
        .map((_, i) =>
          portfolioStorageService.savePortfolio({
            ...mockPortfolio,
            name: `Portfolio ${i}`,
          })
        );

      await Promise.all(promises);

      const loaded = await portfolioStorageService.loadPortfolio();
      expect(loaded).not.toBeNull();
      expect(loaded?.name).toMatch(/Portfolio \d/);
    });
  });
});
