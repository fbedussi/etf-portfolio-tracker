/**
 * @file responsive.test.tsx
 * @description Tests responsive CSS classes and layout behavior
 * Note: These tests verify that responsive utility classes are present.
 * Actual viewport-based rendering is tested in integration/E2E tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Dashboard } from '@/components/dashboard';
import { Header } from '@/components/layout';
import { HoldingsTable, PortfolioValueCard } from '@/components/portfolio';
import { usePortfolioStore } from '@/store';
import { Portfolio } from '@/types';

// Mock stores and hooks
vi.mock('@/store', () => ({
  usePortfolioStore: vi.fn(),
  usePriceStore: vi.fn(() => ({
    prices: {
      VTI: { price: 220, lastUpdated: Date.now(), source: 'mock' },
      BND: { price: 82, lastUpdated: Date.now(), source: 'mock' },
    },
    lastUpdated: Date.now(),
    isLoading: false,
    error: null,
    fetchPrices: vi.fn(),
  })),
  useUIStore: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    driftThreshold: 5,
    setDriftThreshold: vi.fn(),
    currentView: 'dashboard',
    setCurrentView: vi.fn(),
    sidebarExpanded: false,
    setSidebarExpanded: vi.fn(),
    rebalancingExpanded: false,
    setRebalancingExpanded: vi.fn(),
  })),
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: vi.fn(),
    systemPrefersDark: false,
  })),
}));

vi.mock('@/hooks/usePrices', () => ({
  usePrices: vi.fn(() => ({
    refreshPrices: vi.fn(),
    isLoading: false,
    fetchPrices: vi.fn(),
  })),
}));

vi.mock('@/hooks/usePortfolio', () => ({
  usePortfolio: vi.fn(() => ({
    metrics: {
      totalValue: 38400,
      totalCostBasis: 36000,
      totalProfitLoss: 2400,
      totalProfitLossPercent: 6.67,
      holdingsByETF: [
        {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          quantity: 100,
          costBasis: 20000,
          category: 'US Stocks',
          currentPrice: 220,
          currentValue: 22000,
          profitLoss: 2000,
          profitLossPercent: 10,
        },
        {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          quantity: 200,
          costBasis: 16000,
          category: 'US Bonds',
          currentPrice: 82,
          currentValue: 16400,
          profitLoss: 400,
          profitLossPercent: 2.5,
        },
      ],
    },
    rebalancingStatus: null,
    isCalculating: false,
  })),
}));

vi.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: vi.fn(() => ({
    handleFileUpload: vi.fn(),
    isLoading: false,
    error: null,
  })),
}));

const mockPortfolio: Portfolio = {
  etfs: {
    VTI: {
      ticker: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      quantity: 100,
      costBasis: 20000,
      category: 'US Stocks',
      currentPrice: 220,
      currentValue: 22000,
      profitLoss: 2000,
      profitLossPercent: 10,
    },
    BND: {
      ticker: 'BND',
      name: 'Vanguard Total Bond Market ETF',
      quantity: 200,
      costBasis: 16000,
      category: 'US Bonds',
      currentPrice: 82,
      currentValue: 16400,
      profitLoss: 400,
      profitLossPercent: 2.5,
    },
  },
  targetAllocation: {
    'US Stocks': 60,
    'US Bonds': 40,
  },
};

describe('Responsive CSS Classes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePortfolioStore as any).mockReturnValue({
      portfolio: mockPortfolio,
      setPortfolio: vi.fn(),
      clearPortfolio: vi.fn(),
    });
  });

  describe('Dashboard Layout', () => {
    it('should have responsive grid classes', () => {
      const { container } = render(<Dashboard />);
      
      // Check for md:grid-cols-2 class
      const gridElement = container.querySelector('.md\\:grid-cols-2');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveClass('grid', 'gap-6', 'md:grid-cols-2');
    });

    it('should have container with proper spacing', () => {
      const { container } = render(<Dashboard />);
      
      const dashboard = container.querySelector('[data-testid="dashboard"]');
      expect(dashboard).toBeInTheDocument();
      expect(dashboard).toHaveClass('container', 'mx-auto', 'space-y-6', 'py-6');
    });
  });

  describe('HoldingsTable Responsive Columns', () => {
    it('should have hidden columns for mobile breakpoints', () => {
      const { container } = render(<HoldingsTable />);
      
      // Name column should be hidden on mobile (sm:table-cell)
      const nameHeader = container.querySelector('.hidden.sm\\:table-cell');
      expect(nameHeader).toBeInTheDocument();
      
      // Price column should be hidden on mobile (md:table-cell)
      const priceHeader = container.querySelector('.hidden.md\\:table-cell');
      expect(priceHeader).toBeInTheDocument();
    });
  });

  describe('PortfolioValueCard Responsive Text', () => {
    it('should have responsive text sizing classes', () => {
      const { container } = render(<PortfolioValueCard />);
      
      // Value should have text-4xl sm:text-5xl
      const valueElement = container.querySelector('.text-4xl.sm\\:text-5xl');
      expect(valueElement).toBeInTheDocument();
    });

    it('should have responsive flex layout', () => {
      const { container } = render(<PortfolioValueCard />);
      
      // PnL section should have flex-col sm:flex-row
      const pnlElement = container.querySelector('.flex-col.sm\\:flex-row');
      expect(pnlElement).toBeInTheDocument();
    });
  });

  describe('Header Responsive Elements', () => {
    it('should have hidden elements on mobile', () => {
      const { container } = render(<Header />);
      
      // Some elements should be hidden on small screens
      const hiddenElements = container.querySelectorAll('.hidden.sm\\:flex, .hidden.md\\:block, .hidden.md\\:flex');
      expect(hiddenElements.length).toBeGreaterThan(0);
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have adequate button heights', () => {
      const { container } = render(<Header />);
      
      // Buttons should have h-9 (36px) or larger
      // Button component uses h-9 as default
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should have minimum height
      buttons.forEach((button) => {
        const classes = button.className;
        // Should have h-8, h-9, h-10, or larger
        const hasHeight = classes.includes('h-8') || 
                         classes.includes('h-9') || 
                         classes.includes('h-10') ||
                         classes.includes('h-11') ||
                         classes.includes('h-12');
        expect(hasHeight).toBe(true);
      });
    });
  });

  describe('Responsive Documentation', () => {
    it('should document all responsive breakpoints used', () => {
      /**
       * Tailwind Responsive Breakpoints:
       * - sm: 640px (min-width)
       * - md: 768px (min-width)
       * - lg: 1024px (min-width)
       * - xl: 1280px (min-width)
       * - 2xl: 1536px (min-width)
       * 
       * Current Usage:
       * - Dashboard: md:grid-cols-2 (2 columns on tablets and up)
       * - HoldingsTable: hidden sm:table-cell (Name column), hidden md:table-cell (Price column)
       * - PortfolioValueCard: text-4xl sm:text-5xl, flex-col sm:flex-row
       * - Header: hidden sm:flex, hidden md:block, hidden md:flex
       * 
       * Mobile-First Approach:
       * - Base styles are for mobile (<640px)
       * - Progressive enhancement for larger screens
       * - Single column layouts on mobile
       * - Multi-column grids on tablet (md) and up
       */
      expect(true).toBe(true); // Documentation test
    });
  });
});
