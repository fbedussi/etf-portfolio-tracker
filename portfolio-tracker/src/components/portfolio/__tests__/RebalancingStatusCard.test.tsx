import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RebalancingStatusCard } from '../RebalancingStatusCard';
import type { RebalancingStatus } from '@/types/portfolio.types';

// Mock the store
vi.mock('@/store/portfolioStore', () => ({
  usePortfolioStore: vi.fn(),
}));

describe('RebalancingStatusCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when no rebalancing status', async () => {
    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: null };
      return selector ? selector(state) : state;
    });

    render(<RebalancingStatusCard />);

    expect(screen.getByText('Rebalancing Status')).toBeInTheDocument();
    // Check for loading skeleton
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render in-balance status correctly', async () => {
    const mockStatus: RebalancingStatus = {
      status: 'in-balance',
      maxDrift: 2.5,
      driftThreshold: 5,
      categoryDrifts: [
        { category: 'stocks', currentPercent: 71, targetPercent: 70, drift: 1, absDrift: 1 },
        { category: 'bonds', currentPercent: 19, targetPercent: 20, drift: -1, absDrift: 1 },
        { category: 'real-estate', currentPercent: 10, targetPercent: 10, drift: 0, absDrift: 0 },
      ],
    };

    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: mockStatus };
      return selector ? selector(state) : state;
    });

    render(<RebalancingStatusCard />);

    expect(screen.getByText('Your portfolio is balanced')).toBeInTheDocument();
    expect(screen.getByText(/2.50% max drift/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum drift:/)).toBeInTheDocument();
    expect(screen.getByText(/All categories are within/)).toBeInTheDocument();
  });

  it('should render monitor status correctly', async () => {
    const mockStatus: RebalancingStatus = {
      status: 'monitor',
      maxDrift: 6.5,
      driftThreshold: 5,
      categoryDrifts: [
        { category: 'stocks', currentPercent: 76.5, targetPercent: 70, drift: 6.5, absDrift: 6.5 },
        { category: 'bonds', currentPercent: 15, targetPercent: 20, drift: -5, absDrift: 5 },
        { category: 'real-estate', currentPercent: 8.5, targetPercent: 10, drift: -1.5, absDrift: 1.5 },
      ],
    };

    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: mockStatus };
      return selector ? selector(state) : state;
    });

    render(<RebalancingStatusCard />);

    expect(screen.getByText('Minor drift detected, keep monitoring')).toBeInTheDocument();
    expect(screen.getByText(/6.50% max drift/i)).toBeInTheDocument();
    expect(screen.getByText('Categories out of balance:')).toBeInTheDocument();
    expect(screen.getByText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/6.50% over target/)).toBeInTheDocument();
    expect(screen.getByText(/bonds/i)).toBeInTheDocument();
    expect(screen.getByText(/5.00% under target/)).toBeInTheDocument();
  });

  it('should render rebalance status correctly', async () => {
    const mockStatus: RebalancingStatus = {
      status: 'rebalance',
      maxDrift: 15,
      driftThreshold: 5,
      categoryDrifts: [
        { category: 'stocks', currentPercent: 85, targetPercent: 70, drift: 15, absDrift: 15 },
        { category: 'bonds', currentPercent: 10, targetPercent: 20, drift: -10, absDrift: 10 },
        { category: 'real-estate', currentPercent: 5, targetPercent: 10, drift: -5, absDrift: 5 },
      ],
    };

    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: mockStatus };
      return selector ? selector(state) : state;
    });

    render(<RebalancingStatusCard />);

    expect(screen.getByText('Rebalancing recommended')).toBeInTheDocument();
    expect(screen.getByText(/15.00% max drift/i)).toBeInTheDocument();
    expect(screen.getByText('Categories out of balance:')).toBeInTheDocument();
    
    // All three categories should be listed (all exceed 5% threshold)
    expect(screen.getByText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/15.00% over target/)).toBeInTheDocument();
    expect(screen.getByText(/bonds/i)).toBeInTheDocument();
    expect(screen.getByText(/10.00% under target/)).toBeInTheDocument();
    expect(screen.getByText(/real-estate/i)).toBeInTheDocument();
    expect(screen.getByText(/5.00% under target/)).toBeInTheDocument();
  });

  it('should only list categories exceeding threshold', async () => {
    const mockStatus: RebalancingStatus = {
      status: 'monitor',
      maxDrift: 7,
      driftThreshold: 5,
      categoryDrifts: [
        { category: 'stocks', currentPercent: 77, targetPercent: 70, drift: 7, absDrift: 7 },
        { category: 'bonds', currentPercent: 18, targetPercent: 20, drift: -2, absDrift: 2 },
        { category: 'real-estate', currentPercent: 5, targetPercent: 10, drift: -5, absDrift: 5 },
      ],
    };

    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: mockStatus };
      return selector ? selector(state) : state;
    });

    render(<RebalancingStatusCard />);

    // Stocks and real-estate should be listed (≥5%), bonds should not (3%)
    expect(screen.getByText(/stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/real-estate/i)).toBeInTheDocument();
    expect(screen.queryByText(/bonds/i)).not.toBeInTheDocument();
  });

  it('should display drift direction indicators', async () => {
    const mockStatus: RebalancingStatus = {
      status: 'rebalance',
      maxDrift: 10,
      driftThreshold: 5,
      categoryDrifts: [
        { category: 'stocks', currentPercent: 80, targetPercent: 70, drift: 10, absDrift: 10 },
        { category: 'bonds', currentPercent: 10, targetPercent: 20, drift: -10, absDrift: 10 },
      ],
    };

    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: mockStatus };
      return selector ? selector(state) : state;
    });

    render(<RebalancingStatusCard />);

    expect(screen.getByText(/over target/)).toBeInTheDocument();
    expect(screen.getByText(/under target/)).toBeInTheDocument();
  });

  it('should show threshold in subtitle', async () => {
    const mockStatus: RebalancingStatus = {
      status: 'in-balance',
      maxDrift: 3,
      driftThreshold: 7,
      categoryDrifts: [
        { category: 'stocks', currentPercent: 73, targetPercent: 70, drift: 3, absDrift: 3 },
      ],
    };

    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: mockStatus };
      return selector ? selector(state) : state;
    });

    render(<RebalancingStatusCard />);

    // Verify threshold appears in the parenthetical note
    const thresholdText = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('threshold:') && element?.textContent?.includes('7.00%') || false;
    });
    expect(thresholdText.length).toBeGreaterThan(0);
  });

  it('should apply correct styling for in-balance status', async () => {
    const mockStatus: RebalancingStatus = {
      status: 'in-balance',
      maxDrift: 2,
      driftThreshold: 5,
      categoryDrifts: [],
    };

    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: mockStatus };
      return selector ? selector(state) : state;
    });

    const { container } = render(<RebalancingStatusCard />);

    // Check for green color classes
    const card = container.querySelector('.border-green-200, .dark\\:border-green-800');
    expect(card).toBeInTheDocument();
  });

  it('should be accessible', async () => {
    const mockStatus: RebalancingStatus = {
      status: 'monitor',
      maxDrift: 6,
      driftThreshold: 5,
      categoryDrifts: [
        { category: 'stocks', currentPercent: 76, targetPercent: 70, drift: 6, absDrift: 6 },
      ],
    };

    const { usePortfolioStore } = await import('@/store/portfolioStore');
    vi.mocked(usePortfolioStore).mockImplementation((selector: any) => {
      const state = { rebalancingStatus: mockStatus };
      return selector ? selector(state) : state;
    });

    render(<RebalancingStatusCard />);

    // Check that important information is in the document
    expect(screen.getByText('Rebalancing Status')).toBeInTheDocument();
    expect(screen.getByText(/max drift/i)).toBeInTheDocument();
  });
});
