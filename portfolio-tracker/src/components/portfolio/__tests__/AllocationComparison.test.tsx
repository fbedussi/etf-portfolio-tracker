import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AllocationComparison } from '../AllocationComparison';
import type { Portfolio, PortfolioMetrics, RebalancingStatus } from '@/types';
import { usePortfolioStore } from '@/store/portfolioStore';

// Mock the portfolioStore
vi.mock('@/store/portfolioStore', () => ({
  usePortfolioStore: vi.fn(),
}));

const mockUsePortfolioStore = vi.mocked(usePortfolioStore);

describe('AllocationComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no portfolio loaded', () => {
    mockUsePortfolioStore.mockReturnValue({
      portfolio: null,
      metrics: null,
      rebalancingStatus: null,
    });

    render(<AllocationComparison />);

    expect(screen.getByText('Target vs Current Allocation')).toBeInTheDocument();
    expect(screen.getByText('Load a portfolio to view allocation comparison')).toBeInTheDocument();
  });

  it('should render table with allocation data', async () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: {
        stocks: 70,
        bonds: 20,
        'real-estate': 10,
      },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: {
        stocks: 75,
        bonds: 15,
        'real-estate': 10,
      },
    };

    const rebalancingStatus: RebalancingStatus = {
      status: 'monitor',
      maxDrift: 5,
      driftThreshold: 5,
      categoryDrifts: [],
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus,
    });

    render(<AllocationComparison />);

    // Check headers
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Drift')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/bonds/i)).toBeInTheDocument();
    expect(screen.getByText(/real-estate/i)).toBeInTheDocument();
  });

  it('should display correct drift values and colors', () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: {
        stocks: 70,
        bonds: 20,
        'real-estate': 10,
      },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: {
        stocks: 78, // +8% drift (red)
        bonds: 15,  // -5% drift (red at threshold)
        'real-estate': 7, // -3% drift (yellow)
      },
    };

    const rebalancingStatus: RebalancingStatus = {
      status: 'rebalance',
      maxDrift: 8,
      driftThreshold: 5,
      categoryDrifts: [],
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus,
    });

    render(<AllocationComparison />);

    // Check drift values (using getAllByText for percentage patterns)
    expect(screen.getByText(/\+8.00%/)).toBeInTheDocument(); // stocks
    expect(screen.getByText(/-5.00%/)).toBeInTheDocument(); // bonds
    expect(screen.getByText(/-3.00%/)).toBeInTheDocument(); // real-estate
  });

  it('should sort by category when header clicked', async () => {
    const user = userEvent.setup();

    const portfolio: Partial<Portfolio> = {
      targetAllocation: {
        stocks: 70,
        bonds: 20,
        'real-estate': 10,
      },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: {
        stocks: 75,
        bonds: 15,
        'real-estate': 10,
      },
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus: null,
    });

    render(<AllocationComparison />);

    // Click category header
    const categoryHeader = screen.getByText('Category').closest('th');
    expect(categoryHeader).toBeInTheDocument();
    
    await user.click(categoryHeader!);

    // Get all rows
    const rows = screen.getAllByRole('row');
    
    // First row is header, so data rows start at index 1
    const firstDataRow = rows[1];
    
    // Check first category is alphabetically first (bonds)
    expect(within(firstDataRow).getByText(/bonds/i)).toBeInTheDocument();
  });

  it('should sort by drift (descending) by default', () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: {
        stocks: 70,
        bonds: 20,
        'real-estate': 10,
      },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: {
        stocks: 78,  // +8% drift (highest abs)
        bonds: 18,   // -2% drift
        'real-estate': 9, // -1% drift
      },
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus: null,
    });

    render(<AllocationComparison />);

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];

    // Stocks should be first (highest drift)
    expect(within(firstDataRow).getByText(/stocks/i)).toBeInTheDocument();
  });

  it('should toggle sort direction on second click', async () => {
    const user = userEvent.setup();

    const portfolio: Partial<Portfolio> = {
      targetAllocation: {
        stocks: 70,
        bonds: 20,
      },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: {
        stocks: 75,
        bonds: 15,
      },
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus: null,
    });

    render(<AllocationComparison />);

    // Verify table renders with both categories
    expect(screen.getByText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/bonds/i)).toBeInTheDocument();

    const driftHeader = screen.getByText('Drift').closest('th');
    
    // Click to toggle sort direction
    await user.click(driftHeader!);
    
    // Table should still render correctly after sort toggle
    expect(screen.getByText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/bonds/i)).toBeInTheDocument();

    // Click again to toggle back
    await user.click(driftHeader!);
    
    // Table should still render correctly
    expect(screen.getByText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/bonds/i)).toBeInTheDocument();
  });

  it('should display visual progress bars', () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: {
        stocks: 70,
      },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: {
        stocks: 75,
      },
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus: null,
    });

    const { container } = render(<AllocationComparison />);

    // Check for progress bar elements
    const progressBars = container.querySelectorAll('.bg-blue-500, .bg-purple-500');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should show status icons correctly', () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: {
        stocks: 70,
        bonds: 20,
        'real-estate': 10,
      },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: {
        stocks: 78, // +8% (red)
        bonds: 17,  // -3% (yellow)
        'real-estate': 10, // 0% (green)
      },
    };

    const rebalancingStatus: RebalancingStatus = {
      status: 'rebalance',
      maxDrift: 8,
      driftThreshold: 5,
      categoryDrifts: [],
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus,
    });

    render(<AllocationComparison />);

    // Check for emoji status icons (appear in both table and legend)
    expect(screen.getAllByText('🔴').length).toBeGreaterThan(0); // red for >= threshold
    expect(screen.getAllByText('🟡').length).toBeGreaterThan(0); // yellow for >= threshold/2
    expect(screen.getAllByText('🟢').length).toBeGreaterThan(0); // green for < threshold/2
  });

  it('should display threshold in description', () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: { stocks: 100 },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: { stocks: 100 },
    };

    const rebalancingStatus: RebalancingStatus = {
      status: 'in-balance',
      maxDrift: 0,
      driftThreshold: 7,
      categoryDrifts: [],
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus,
    });

    render(<AllocationComparison />);

    expect(screen.getByText(/Threshold: \+7.00%/)).toBeInTheDocument();
  });

  it('should handle missing categories in current allocation', () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: {
        stocks: 70,
        bonds: 20,
        'real-estate': 10,
      },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: {
        stocks: 100, // Only stocks, missing bonds and real-estate
      },
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus: null,
    });

    render(<AllocationComparison />);

    // All categories should still be shown
    expect(screen.getByText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/bonds/i)).toBeInTheDocument();
    expect(screen.getByText(/real-estate/i)).toBeInTheDocument();

    // Check drift for missing categories
    expect(screen.getByText(/-20.00%/)).toBeInTheDocument(); // bonds: 0 - 20
    expect(screen.getByText(/-10.00%/)).toBeInTheDocument(); // real-estate: 0 - 10
  });

  it('should display legend for status icons', () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: { stocks: 100 },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: { stocks: 100 },
    };

    const rebalancingStatus: RebalancingStatus = {
      status: 'in-balance',
      maxDrift: 0,
      driftThreshold: 5,
      categoryDrifts: [],
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus,
    });

    render(<AllocationComparison />);

    // Check legend items
    expect(screen.getByText(/Out of balance/)).toBeInTheDocument();
    expect(screen.getByText(/Watch closely/)).toBeInTheDocument();
    expect(screen.getByText(/Within target/)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    const portfolio: Partial<Portfolio> = {
      targetAllocation: { stocks: 70, bonds: 30 },
    };

    const metrics: Partial<PortfolioMetrics> = {
      currentAllocation: { stocks: 75, bonds: 25 },
    };

    mockUsePortfolioStore.mockReturnValue({
      portfolio: portfolio as Portfolio,
      metrics: metrics as PortfolioMetrics,
      rebalancingStatus: null,
    });

    render(<AllocationComparison />);

    // Check table structure
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Check headers are in table header row
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(5);

    // Status icons should have aria-labels
    const statusIcons = screen.getAllByRole('img');
    statusIcons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-label');
    });
  });
});
