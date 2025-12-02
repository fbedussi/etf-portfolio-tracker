import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoldingsTable } from '../HoldingsTable';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePriceStore } from '@/store/priceStore';
import type { Portfolio } from '@/types/portfolio.types';
import type { PriceData } from '@/types/api.types';

describe('HoldingsTable', () => {
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

  it('should show loading state when no portfolio', () => {
    render(<HoldingsTable />);

    expect(screen.getByText('Holdings')).toBeInTheDocument();
    expect(screen.getByText('Your ETF positions')).toBeInTheDocument();

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display single holding', () => {
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

    render(<HoldingsTable />);

    expect(screen.getByText('1 ETF in portfolio')).toBeInTheDocument();
    expect(screen.getByText('VTI')).toBeInTheDocument();
    expect(screen.getByText('Vanguard Total Stock Market ETF')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/\$235\.50/)).toBeInTheDocument();
    expect(screen.getByText(/\$2,355/)).toBeInTheDocument();
  });

  it('should display multiple holdings', () => {
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

    render(<HoldingsTable />);

    expect(screen.getByText('2 ETFs in portfolio')).toBeInTheDocument();
    expect(screen.getByText('VTI')).toBeInTheDocument();
    expect(screen.getByText('BND')).toBeInTheDocument();
  });

  it('should color-code profit and loss', () => {
    const portfolio: Portfolio = {
      name: 'Mixed Portfolio',
      targetAllocation: {
        Stocks: 50,
        Bonds: 50,
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
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Bonds', category: 'Bonds', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 30, price: 75.00 },
          ],
        },
      },
    };

    const prices: Record<string, PriceData> = {
      VTI: {
        ticker: 'VTI',
        price: 235.50, // Profit
        timestamp: '2024-12-01T12:00:00Z',
      },
      BND: {
        ticker: 'BND',
        price: 73.00, // Loss
        timestamp: '2024-12-01T12:00:00Z',
      },
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    render(<HoldingsTable />);

    const greenText = document.querySelectorAll('.text-green-600, .dark\\:text-green-400');
    const redText = document.querySelectorAll('.text-red-600, .dark\\:text-red-400');

    expect(greenText.length).toBeGreaterThan(0);
    expect(redText.length).toBeGreaterThan(0);
  });

  it('should sort by ticker by default', () => {
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
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Bonds', category: 'Stocks', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 20, price: 72.00 },
          ],
        },
      },
    };

    const prices: Record<string, PriceData> = {
      VTI: { ticker: 'VTI', price: 235.50, timestamp: '2024-12-01T12:00:00Z' },
      BND: { ticker: 'BND', price: 73.00, timestamp: '2024-12-01T12:00:00Z' },
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    render(<HoldingsTable />);

    const rows = screen.getAllByRole('row');
    const tickerCells = rows.slice(1).map((row) => 
      row.querySelector('td')?.textContent
    );

    expect(tickerCells[0]).toBe('BND');
    expect(tickerCells[1]).toBe('VTI');
  });

  it('should sort columns when clicked', async () => {
    const user = userEvent.setup();
    
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
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Bonds', category: 'Stocks', percentage: 100 },
          ],
          transactions: [
            { date: '2024-01-15', quantity: 20, price: 72.00 },
          ],
        },
      },
    };

    const prices: Record<string, PriceData> = {
      VTI: { ticker: 'VTI', price: 235.50, timestamp: '2024-12-01T12:00:00Z' },
      BND: { ticker: 'BND', price: 73.00, timestamp: '2024-12-01T12:00:00Z' },
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    render(<HoldingsTable />);

    const qtyButton = screen.getByRole('button', { name: /Qty/i });
    await user.click(qtyButton);

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    
    expect(firstDataRow.textContent).toContain('VTI');
  });

  it('should show empty state when no holdings', () => {
    const portfolio: Portfolio = {
      name: 'Empty Portfolio',
      targetAllocation: {},
      etfs: {},
    };

    usePortfolioStore.setState({ portfolio });

    render(<HoldingsTable />);

    expect(screen.getByText('No holdings to display')).toBeInTheDocument();
  });

  it('should handle missing prices gracefully', () => {
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

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices: {} });

    render(<HoldingsTable />);

    expect(screen.getByText('VTI')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
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
      VTI: { ticker: 'VTI', price: 235.50, timestamp: '2024-12-01T12:00:00Z' },
    };

    usePortfolioStore.setState({ portfolio });
    usePriceStore.setState({ prices });

    render(<HoldingsTable />);

    const hiddenCells = document.querySelectorAll('.hidden.sm\\:table-cell, .hidden.md\\:table-cell');
    expect(hiddenCells.length).toBeGreaterThan(0);
  });
});
