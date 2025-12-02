import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortfolioValueCard } from '../PortfolioValueCard';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePriceStore } from '@/store/priceStore';
import type { Portfolio } from '@/types/portfolio.types';
import type { PriceData } from '@/types/api.types';

describe('PortfolioValueCard', () => {
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
    render(<PortfolioValueCard />);

    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
    // Check for loading skeleton (animated pulse)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display total portfolio value with profit', () => {
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

    render(<PortfolioValueCard />);

    // Check total value is displayed
    expect(screen.getByText(/\$2,355/)).toBeInTheDocument();

    // Check P&L is displayed with positive formatting
    expect(screen.getByText(/\$150/)).toBeInTheDocument();
    expect(screen.getByText(/\+6\.80%/)).toBeInTheDocument();

    // Check cost basis is displayed
    expect(screen.getByText(/Cost Basis:/)).toBeInTheDocument();
    expect(screen.getByText(/\$2,205/)).toBeInTheDocument();

    // Check for profit indicator (TrendingUp icon)
    const profitIndicators = document.querySelectorAll('.text-green-600, .dark\\:text-green-400');
    expect(profitIndicators.length).toBeGreaterThan(0);
  });

  it('should display portfolio value with loss', () => {
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
            { date: '2024-01-15', quantity: 10, price: 250.00 },
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

    render(<PortfolioValueCard />);

    // Check total value
    expect(screen.getByText(/\$2,355/)).toBeInTheDocument();

    // Check P&L shows loss (absolute value displayed, but negative in data)
    expect(screen.getByText(/\$145/)).toBeInTheDocument();
    expect(screen.getByText(/-5\.80%/)).toBeInTheDocument();

    // Check for loss indicator (red color)
    const lossIndicators = document.querySelectorAll('.text-red-600, .dark\\:text-red-400');
    expect(lossIndicators.length).toBeGreaterThan(0);
  });

  it('should display neutral state when P&L is zero', () => {
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
            { date: '2024-01-15', quantity: 10, price: 235.50 },
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

    render(<PortfolioValueCard />);

    // Check P&L is zero
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    expect(screen.getByText(/0\.00%/)).toBeInTheDocument();

    // Check for neutral color (gray)
    const neutralIndicators = document.querySelectorAll('.text-gray-600, .dark\\:text-gray-400');
    expect(neutralIndicators.length).toBeGreaterThan(0);
  });

  it('should format large values correctly', () => {
    const portfolio: Portfolio = {
      name: 'Large Portfolio',
      targetAllocation: { Stocks: 100 },
      etfs: {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 5000, price: 200.00 },
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

    render(<PortfolioValueCard />);

    // Check large value with thousands separators
    // Total value: 5000 × 235.50 = 1,177,500
    expect(screen.getByText(/\$1,177,500/)).toBeInTheDocument();

    // P&L: (1,177,500 - 1,000,000) = 177,500
    expect(screen.getByText(/\$177,500/)).toBeInTheDocument();
  });

  it('should have accessible structure', () => {
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

    render(<PortfolioValueCard />);

    // Check for proper heading
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();

    // Check icon has aria-hidden
    const icons = document.querySelectorAll('[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
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

    render(<PortfolioValueCard />);

    // Check for responsive classes (sm:)
    const element = screen.getByText(/\$2,355/).closest('div');
    expect(element?.className).toContain('sm:');
  });
});
