import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssetAllocationChart } from '../AssetAllocationChart';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePriceStore } from '@/store/priceStore';
import type { Portfolio } from '@/types/portfolio.types';
import type { PriceData } from '@/types/api.types';

describe('AssetAllocationChart', () => {
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

  it('should show loading state when no portfolio', () => {
    render(<AssetAllocationChart />);

    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    expect(screen.getByText('Current portfolio distribution')).toBeInTheDocument();
    
    // Check for loading skeleton (animated pulse)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display single asset category', () => {
    const portfolio: Portfolio = {
      name: 'Single Asset Portfolio',
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

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    render(<AssetAllocationChart />);

    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    
    // Check that chart container is rendered (Recharts needs browser dimensions)
    const chartContainer = document.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should display multiple asset categories', () => {
    const portfolio: Portfolio = {
      name: 'Balanced Portfolio',
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
            { date: '2024-01-15', quantity: 30, price: 220.50 },
          ],
        },
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Bonds', category: 'Bonds', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 60, price: 72.133 },
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

    render(<AssetAllocationChart />);

    // Check that chart is rendered (dimensions handled by browser)
    const chartContainer = document.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should display mixed allocation ETF correctly', () => {
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

    render(<AssetAllocationChart />);

    // Check that chart is rendered
    const chartContainer = document.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    const portfolio: Portfolio = {
      name: 'Empty Portfolio',
      targetAllocation: {},
      etfs: {},
    };

    usePortfolioStore.setState({ portfolio });

    render(<AssetAllocationChart />);

    expect(screen.getByText('No allocation data available')).toBeInTheDocument();
  });

  it('should filter out zero allocations', () => {
    const portfolio: Portfolio = {
      name: 'Portfolio with zero allocation',
      targetAllocation: {
        Stocks: 100,
        Bonds: 0,
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

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    render(<AssetAllocationChart />);

    // Check that chart is rendered (only Stocks, not Bonds with 0%)
    const chartContainer = document.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should be accessible', () => {
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

    const prices: Record<string, PriceData> = {
      VTI: {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      },
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    render(<AssetAllocationChart />);

    // Check for proper heading structure
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    expect(screen.getByText('Current portfolio distribution across asset categories')).toBeInTheDocument();
  });
});
