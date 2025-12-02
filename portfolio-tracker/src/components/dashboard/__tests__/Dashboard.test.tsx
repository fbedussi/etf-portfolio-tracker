import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePriceStore } from '@/store/priceStore';
import type { Portfolio } from '@/types/portfolio.types';
import type { PriceData } from '@/types/api.types';

describe('Dashboard', () => {
  beforeEach(() => {
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

  it('should render all dashboard components', () => {
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

    render(<Dashboard />);

    // Check all major components are present
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    expect(screen.getByText('Holdings')).toBeInTheDocument();
  });

  it('should display portfolio data correctly', () => {
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

    render(<Dashboard />);

    // Check portfolio value is displayed (appears in value card)
    const valueElements = screen.getAllByText(/\$2,355/);
    expect(valueElements.length).toBeGreaterThan(0);

    // Check holdings table shows ticker
    expect(screen.getByText('VTI')).toBeInTheDocument();
  });

  it('should show loading states when calculating', () => {
    render(<Dashboard />);

    // All components should show loading/skeleton states
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should handle multiple ETFs', () => {
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

    render(<Dashboard />);

    // Check both ETFs are displayed
    expect(screen.getByText('VTI')).toBeInTheDocument();
    expect(screen.getByText('BND')).toBeInTheDocument();
    expect(screen.getByText('2 ETFs in portfolio')).toBeInTheDocument();
  });

  it('should be responsive', () => {
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

    const { container } = render(<Dashboard />);

    // Check for responsive grid classes
    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('md:grid-cols-2');
  });

  it('should use container layout', () => {
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

    const { container } = render(<Dashboard />);

    // Check for container and spacing
    const mainContainer = container.querySelector('.container');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer?.className).toContain('space-y-6');
  });
});
