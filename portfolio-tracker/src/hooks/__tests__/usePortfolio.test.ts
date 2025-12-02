import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePortfolio } from '../usePortfolio';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePriceStore } from '@/store/priceStore';
import type { Portfolio } from '@/types/portfolio.types';
import type { PriceData } from '@/types/api.types';

describe('usePortfolio', () => {
  beforeEach(() => {
    // Reset stores before each test
    usePortfolioStore.setState({
      portfolio: null,
      holdings: null,
      metrics: null,
      rebalancingStatus: null,
      isLoading: false,
      isFetchingPrices: false,
      error: null,
    });

    usePriceStore.setState({
      prices: {},
      loadingTickers: new Set(),
      errors: {},
      lastFetchTime: null,
      priceSource: null,
    });
  });

  it('should return null metrics when no portfolio is loaded', () => {
    const { result } = renderHook(() => usePortfolio());

    expect(result.current.metrics).toBeNull();
    expect(result.current.isCalculating).toBe(false);
  });

  it('should calculate metrics for simple portfolio', async () => {
    const portfolio: Portfolio = {
      name: 'Test Portfolio',
      targetAllocation: {
        Stocks: 100,
      },
      etfs: {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
          ],
        },
      },
    };

    const prices: Record<string, PriceData> = {
      VTI: {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      },
    };

    // Set portfolio and prices
    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    const { result } = renderHook(() => usePortfolio());

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    const metrics = result.current.metrics!;

    // Total value: 10 × 235.50 = 2355
    expect(metrics.totalValue).toBeCloseTo(2355, 2);

    // Total cost: 10 × 220.50 = 2205
    expect(metrics.totalCost).toBeCloseTo(2205, 2);

    // P&L: 2355 - 2205 = 150
    expect(metrics.totalProfitLoss).toBeCloseTo(150, 2);

    // P&L%: (150 / 2205) × 100 ≈ 6.80%
    expect(metrics.totalProfitLossPercent).toBeCloseTo(6.80, 2);

    // Allocation: 100% Stocks
    expect(metrics.currentAllocation).toEqual({ Stocks: 100 });

    // Holdings by ETF
    expect(metrics.holdingsByETF).toHaveLength(1);
    expect(metrics.holdingsByETF[0]).toMatchObject({
      ticker: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      quantity: 10,
      currentPrice: 235.50,
      currentValue: 2355,
      costBasis: 220.50,
    });
  });

  it('should calculate metrics for multi-ETF portfolio', async () => {
    const portfolio: Portfolio = {
      name: 'Diversified Portfolio',
      targetAllocation: {
        Stocks: 60,
        Bonds: 40,
      },
      etfs: {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 15, price: 225.40 },
          ],
        },
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Bonds', category: 'Bonds', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 30, price: 72.133 },
          ],
        },
      },
    };

    const prices: Record<string, PriceData> = {
      VTI: {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      },
      BND: {
        ticker: 'BND',
        price: 73.00,
        timestamp: '2024-12-01T12:00:00Z',
      },
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    const { result } = renderHook(() => usePortfolio());

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    const metrics = result.current.metrics!;

    // VTI: 15 × 235.50 = 3532.50
    // BND: 30 × 73.00 = 2190.00
    // Total: 5722.50
    expect(metrics.totalValue).toBeCloseTo(5722.50, 2);

    // VTI cost: 15 × 225.40 = 3381
    // BND cost: 30 × 72.133 = 2163.99
    // Total: 5544.99
    expect(metrics.totalCost).toBeCloseTo(5544.99, 2);

    // P&L: 5722.50 - 5544.99 = 177.51
    expect(metrics.totalProfitLoss).toBeCloseTo(177.51, 2);

    // Holdings by ETF
    expect(metrics.holdingsByETF).toHaveLength(2);

    const vtiHolding = metrics.holdingsByETF.find((h) => h.ticker === 'VTI');
    expect(vtiHolding).toBeDefined();
    expect(vtiHolding?.currentValue).toBeCloseTo(3532.50, 2);

    const bndHolding = metrics.holdingsByETF.find((h) => h.ticker === 'BND');
    expect(bndHolding).toBeDefined();
    expect(bndHolding?.currentValue).toBeCloseTo(2190, 2);
  });

  it('should handle missing prices gracefully', async () => {
    const portfolio: Portfolio = {
      name: 'Test Portfolio',
      targetAllocation: {
        Stocks: 60,
        Bonds: 40,
      },
      etfs: {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 15, price: 225.40 },
          ],
        },
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Bonds', category: 'Bonds', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 30, price: 72.133 },
          ],
        },
      },
    };

    const prices: Record<string, PriceData> = {
      VTI: {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      },
      // BND price missing
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    const { result } = renderHook(() => usePortfolio());

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    const metrics = result.current.metrics!;

    // Only VTI counted: 15 × 235.50 = 3532.50
    expect(metrics.totalValue).toBeCloseTo(3532.50, 2);

    // BND should have 0 for current price and value
    const bndHolding = metrics.holdingsByETF.find((h) => h.ticker === 'BND');
    expect(bndHolding).toBeDefined();
    expect(bndHolding?.currentPrice).toBe(0);
    expect(bndHolding?.currentValue).toBe(0);
  });

  it('should recalculate when portfolio changes', async () => {
    const initialPortfolio: Portfolio = {
      name: 'Initial Portfolio',
      targetAllocation: { Stocks: 100 },
      etfs: {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
          ],
        },
      },
    };

    const prices: Record<string, PriceData> = {
      VTI: {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      },
    };

    usePortfolioStore.setState({ portfolio: initialPortfolio });
    usePriceStore.setState({ prices });

    const { result, rerender } = renderHook(() => usePortfolio());

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    const initialValue = result.current.metrics!.totalValue;
    expect(initialValue).toBeCloseTo(2355, 2);

    // Update portfolio with more shares
    const updatedPortfolio: Portfolio = {
      ...initialPortfolio,
      etfs: {
        VTI: {
          ...initialPortfolio.etfs.VTI,
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
            { date: '2024-06-15', quantity: 5, price: 235.20 },
          ],
        },
      },
    };

    usePortfolioStore.setState({ portfolio: updatedPortfolio });
    rerender();

    await waitFor(() => {
      // New total: 15 × 235.50 = 3532.50
      expect(result.current.metrics?.totalValue).toBeCloseTo(3532.50, 2);
    });
  });

  it('should recalculate when prices change', async () => {
    const portfolio: Portfolio = {
      name: 'Test Portfolio',
      targetAllocation: { Stocks: 100 },
      etfs: {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
          ],
        },
      },
    };

    const initialPrices: Record<string, PriceData> = {
      VTI: {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      },
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices: initialPrices });

    const { result, rerender } = renderHook(() => usePortfolio());

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    expect(result.current.metrics!.totalValue).toBeCloseTo(2355, 2);

    // Update prices
    const updatedPrices: Record<string, PriceData> = {
      VTI: {
        ticker: 'VTI',
        price: 250.00,
        timestamp: '2024-12-02T12:00:00Z',
      },
    };

    usePriceStore.setState({ prices: updatedPrices });
    rerender();

    await waitFor(() => {
      // New total: 10 × 250.00 = 2500
      expect(result.current.metrics?.totalValue).toBeCloseTo(2500, 2);
    });
  });

  it('should handle empty ETFs object', async () => {
    const portfolio: Portfolio = {
      name: 'Empty Portfolio',
      targetAllocation: {},
      etfs: {},
    };

    usePortfolioStore.setState({ portfolio });

    const { result } = renderHook(() => usePortfolio());

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    const metrics = result.current.metrics!;

    expect(metrics.totalValue).toBe(0);
    expect(metrics.totalCost).toBe(0);
    expect(metrics.totalProfitLoss).toBe(0);
    expect(metrics.holdingsByETF).toHaveLength(0);
  });

  it('should provide recalculate function', () => {
    const { result } = renderHook(() => usePortfolio());

    expect(typeof result.current.recalculate).toBe('function');
    
    // Should not throw when called
    expect(() => result.current.recalculate()).not.toThrow();
  });

  it('should handle complex allocation with mixed asset classes', async () => {
    const portfolio: Portfolio = {
      name: 'Mixed Allocation',
      targetAllocation: {
        Stocks: 80,
        Bonds: 20,
      },
      etfs: {
        AOA: {
          ticker: 'AOA',
          name: 'iShares Aggressive Allocation ETF',
          assetClasses: [
            { name: 'Global Stocks', category: 'Stocks', percentage: 80 },
            { name: 'Global Bonds', category: 'Bonds', percentage: 20 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 100, price: 50.00 },
          ],
        },
      },
    };

    const prices: Record<string, PriceData> = {
      AOA: {
        ticker: 'AOA',
        price: 60.00,
        timestamp: '2024-12-01T12:00:00Z',
      },
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    const { result } = renderHook(() => usePortfolio());

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    const metrics = result.current.metrics!;

    // Value: 100 × 60 = 6000
    expect(metrics.totalValue).toBeCloseTo(6000, 2);

    // Allocation should be 80/20 split
    expect(metrics.currentAllocation.Stocks).toBeCloseTo(80, 2);
    expect(metrics.currentAllocation.Bonds).toBeCloseTo(20, 2);
  });
});
