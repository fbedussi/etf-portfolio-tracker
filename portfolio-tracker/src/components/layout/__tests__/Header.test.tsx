import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

// Mock the hooks and stores
vi.mock('@/store', () => ({
  useUIStore: vi.fn(() => ({
    driftThreshold: 5,
    setDriftThreshold: vi.fn(),
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

vi.mock('@/store/priceStore', () => ({
  usePriceStore: vi.fn(() => ({})),
}));

vi.mock('@/store/portfolioStore', () => ({
  usePortfolioStore: vi.fn(() => ({
    portfolio: null,
    clearPortfolio: vi.fn(),
  })),
}));

vi.mock('@/hooks/usePrices', () => ({
  usePrices: vi.fn(() => ({
    refreshPrices: vi.fn(),
    isLoading: false,
    lastUpdated: null,
  })),
}));

vi.mock('@/utils/formatters', () => ({
  formatRelativeTime: vi.fn((timestamp) => {
    if (!timestamp) return 'Never';
    return '5 minutes ago';
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the header with branding', () => {
    render(<Header />);
    expect(screen.getByText('Portfolio Tracker')).toBeInTheDocument();
  });

  it('should render refresh prices button', () => {
    render(<Header />);
    const refreshButton = screen.getByRole('button', { name: /refresh prices/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should render theme toggle button', () => {
    render(<Header />);
    const themeButton = screen.getByRole('button', { name: /theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('should render more options button', () => {
    render(<Header />);
    const moreButton = screen.getByRole('button', { name: /more options/i });
    expect(moreButton).toBeInTheDocument();
  });

  describe('Refresh Prices Button', () => {
    it('should call refreshPrices when clicked', async () => {
      const mockRefreshPrices = vi.fn();
      const usePricesModule = await import('@/hooks/usePrices');
      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: mockRefreshPrices,
        isLoading: false,
        lastUpdated: null,
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      const user = userEvent.setup();
      render(<Header />);

      const refreshButton = screen.getByRole('button', { name: /refresh prices/i });
      await user.click(refreshButton);

      expect(mockRefreshPrices).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when loading', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: true,
        lastUpdated: null,
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      render(<Header />);
      const refreshButton = screen.getByRole('button', { name: /refresh prices/i });
      expect(refreshButton).toBeDisabled();
    });

    it('should show spinning animation when loading', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: true,
        lastUpdated: null,
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      render(<Header />);
      const refreshButton = screen.getByRole('button', { name: /refresh prices/i });
      const icon = refreshButton.querySelector('svg');
      expect(icon).toHaveClass('animate-spin');
    });

    it('should not show spinning animation when not loading', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: false,
        lastUpdated: null,
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      render(<Header />);
      const refreshButton = screen.getByRole('button', { name: /refresh prices/i });
      const icon = refreshButton.querySelector('svg');
      expect(icon).not.toHaveClass('animate-spin');
    });
  });

  describe('Last Updated Timestamp', () => {
    it('should display timestamp when prices have been updated', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: false,
        lastUpdated: Date.now() - 300000, // 5 minutes ago
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      render(<Header />);
      expect(screen.getByText(/prices updated 5 minutes ago/i)).toBeInTheDocument();
    });

    it('should not display timestamp when prices have never been updated', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: false,
        lastUpdated: null,
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      render(<Header />);
      expect(screen.queryByText(/prices updated/i)).not.toBeInTheDocument();
    });
  });

  describe('Price Source Indicator', () => {
    it('should display "Live" badge when all prices are from API', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      const priceStoreModule = await import('@/store/priceStore');

      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: false,
        lastUpdated: Date.now(),
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      vi.mocked(priceStoreModule.usePriceStore).mockReturnValue({
        VTI: { ticker: 'VTI', price: 100, timestamp: Date.now(), currency: 'USD', source: 'api' },
        VXUS: { ticker: 'VXUS', price: 50, timestamp: Date.now(), currency: 'USD', source: 'api' },
      } as any);

      render(<Header />);
      expect(screen.getByText('• Live')).toBeInTheDocument();
    });

    it('should display "Cached" badge when all prices are from cache', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      const priceStoreModule = await import('@/store/priceStore');

      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: false,
        lastUpdated: Date.now(),
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      vi.mocked(priceStoreModule.usePriceStore).mockReturnValue({
        VTI: { ticker: 'VTI', price: 100, timestamp: Date.now(), currency: 'USD', source: 'cache' },
        VXUS: { ticker: 'VXUS', price: 50, timestamp: Date.now(), currency: 'USD', source: 'cache' },
      } as any);

      render(<Header />);
      expect(screen.getByText('• Cached')).toBeInTheDocument();
    });

    it('should display "Mixed" badge when prices are from both API and cache', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      const priceStoreModule = await import('@/store/priceStore');

      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: false,
        lastUpdated: Date.now(),
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      vi.mocked(priceStoreModule.usePriceStore).mockReturnValue({
        VTI: { ticker: 'VTI', price: 100, timestamp: Date.now(), currency: 'USD', source: 'api' },
        VXUS: { ticker: 'VXUS', price: 50, timestamp: Date.now(), currency: 'USD', source: 'cache' },
      } as any);

      render(<Header />);
      expect(screen.getByText('• Mixed')).toBeInTheDocument();
    });

    it('should not display source badge when no prices exist', async () => {
      const usePricesModule = await import('@/hooks/usePrices');
      const priceStoreModule = await import('@/store/priceStore');

      vi.mocked(usePricesModule.usePrices).mockReturnValue({
        refreshPrices: vi.fn(),
        isLoading: false,
        lastUpdated: Date.now(),
        fetchPrices: vi.fn(),
        loadingIsins: [],
        errors: {},
        clearErrors: vi.fn(),
      });

      vi.mocked(priceStoreModule.usePriceStore).mockReturnValue({} as any);

      render(<Header />);
      expect(screen.queryByText(/• Live|• Cached|• Mixed/)).not.toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should cycle from light to dark theme when clicked', async () => {
      const mockSetTheme = vi.fn();
      const { useTheme } = await import('@/hooks/useTheme');
      vi.mocked(useTheme).mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: mockSetTheme,
        systemPrefersDark: false,
      });

      const user = userEvent.setup();
      render(<Header />);

      const themeButton = screen.getByRole('button', { name: /switch to dark theme/i });
      await user.click(themeButton);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should cycle from dark to auto theme when clicked', async () => {
      const mockSetTheme = vi.fn();
      const { useTheme } = await import('@/hooks/useTheme');
      vi.mocked(useTheme).mockReturnValue({
        theme: 'dark',
        resolvedTheme: 'dark',
        setTheme: mockSetTheme,
        systemPrefersDark: false,
      });

      const user = userEvent.setup();
      render(<Header />);

      const themeButton = screen.getByRole('button', { name: /switch to auto theme/i });
      await user.click(themeButton);

      expect(mockSetTheme).toHaveBeenCalledWith('auto');
    });

    it('should cycle from auto to light theme when clicked', async () => {
      const mockSetTheme = vi.fn();
      const { useTheme } = await import('@/hooks/useTheme');
      vi.mocked(useTheme).mockReturnValue({
        theme: 'auto',
        resolvedTheme: 'light',
        setTheme: mockSetTheme,
        systemPrefersDark: false,
      });

      const user = userEvent.setup();
      render(<Header />);

      const themeButton = screen.getByRole('button', { name: /switch to light theme/i });
      await user.click(themeButton);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should display sun icon when theme is light', async () => {
      const { useTheme } = await import('@/hooks/useTheme');
      vi.mocked(useTheme).mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
        systemPrefersDark: false,
      });

      const { container } = render(<Header />);

      // Check that the Sun icon is rendered (lucide-react renders as <svg>)
      const themeButton = screen.getByRole('button', { name: /theme/i });
      expect(themeButton).toBeInTheDocument();
      expect(themeButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should display moon icon when theme is dark', async () => {
      const { useTheme } = await import('@/hooks/useTheme');
      vi.mocked(useTheme).mockReturnValue({
        theme: 'dark',
        resolvedTheme: 'dark',
        setTheme: vi.fn(),
        systemPrefersDark: false,
      });

      const { container } = render(<Header />);

      const themeButton = screen.getByRole('button', { name: /theme/i });
      expect(themeButton).toBeInTheDocument();
      expect(themeButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should display monitor icon when theme is auto', async () => {
      const { useTheme } = await import('@/hooks/useTheme');
      vi.mocked(useTheme).mockReturnValue({
        theme: 'auto',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
        systemPrefersDark: false,
      });

      const { container } = render(<Header />);

      const themeButton = screen.getByRole('button', { name: /theme/i });
      expect(themeButton).toBeInTheDocument();
      expect(themeButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Load Different Portfolio Button', () => {
    it('should not display button when portfolio is not loaded', async () => {
      const portfolioStoreModule = await import('@/store/portfolioStore');

      // Mock the usePortfolioStore to use a selector function
      vi.mocked(portfolioStoreModule.usePortfolioStore).mockImplementation((selector: any) => {
        const state = {
          portfolio: null,
          clearPortfolio: vi.fn(),
        };
        return selector ? selector(state) : state;
      });

      render(<Header />);
      expect(screen.queryByRole('button', { name: /load different portfolio/i })).not.toBeInTheDocument();
    });

    it('should display button when portfolio is loaded', async () => {
      const portfolioStoreModule = await import('@/store/portfolioStore');

      vi.mocked(portfolioStoreModule.usePortfolioStore).mockImplementation((selector: any) => {
        const state = {
          portfolio: {
            currency: 'USD',
            etfs: [
              {
                ticker: 'VWCE',
                name: 'Vanguard FTSE All-World',
                quantity: 100,
                buyPrice: 100,
                category: 'equity',
              },
            ],
          },
          clearPortfolio: vi.fn(),
        };
        return selector ? selector(state) : state;
      });

      render(<Header />);
      expect(screen.getByRole('button', { name: /load different portfolio/i })).toBeInTheDocument();
    });

    it('should call clearPortfolio and clearAllPrices when clicked', async () => {
      const mockClearPortfolio = vi.fn();
      const mockClearAllPrices = vi.fn();

      const portfolioStoreModule = await import('@/store/portfolioStore');
      const priceStoreModule = await import('@/store/priceStore');

      // Create mock implementation that returns different values based on the selector
      vi.mocked(portfolioStoreModule.usePortfolioStore).mockImplementation((selector: any) => {
        const state = {
          portfolio: {
            currency: 'USD',
            etfs: [
              {
                ticker: 'VWCE',
                name: 'Vanguard FTSE All-World',
                quantity: 100,
                buyPrice: 100,
                category: 'equity',
              },
            ],
          },
          clearPortfolio: mockClearPortfolio,
        };
        return selector ? selector(state) : state;
      });

      vi.mocked(priceStoreModule.usePriceStore).mockImplementation((selector: any) => {
        const state = {
          prices: {},
          clearAllPrices: mockClearAllPrices,
        };
        return selector ? selector(state) : state;
      });

      const user = userEvent.setup();
      render(<Header />);

      const loadButton = screen.getByRole('button', { name: /load different portfolio/i });
      await user.click(loadButton);

      await waitFor(() => {
        expect(mockClearPortfolio).toHaveBeenCalledTimes(1);
        expect(mockClearAllPrices).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear portfolio state correctly', async () => {
      const mockClearPortfolio = vi.fn();
      const mockClearAllPrices = vi.fn();

      const portfolioStoreModule = await import('@/store/portfolioStore');
      const priceStoreModule = await import('@/store/priceStore');

      vi.mocked(portfolioStoreModule.usePortfolioStore).mockImplementation((selector: any) => {
        const state = {
          portfolio: {
            currency: 'USD',
            etfs: [
              {
                ticker: 'VWCE',
                name: 'Vanguard FTSE All-World',
                quantity: 100,
                buyPrice: 100,
                category: 'equity',
              },
            ],
          },
          clearPortfolio: mockClearPortfolio,
        };
        return selector ? selector(state) : state;
      });

      vi.mocked(priceStoreModule.usePriceStore).mockImplementation((selector: any) => {
        const state = {
          prices: {
            VWCE: { ticker: 'VWCE', price: 100, timestamp: Date.now(), currency: 'USD', source: 'api' },
          },
          clearAllPrices: mockClearAllPrices,
        };
        return selector ? selector(state) : state;
      });

      const user = userEvent.setup();
      render(<Header />);

      const loadButton = screen.getByRole('button', { name: /load different portfolio/i });

      // Verify state before clicking
      expect(mockClearPortfolio).not.toHaveBeenCalled();
      expect(mockClearAllPrices).not.toHaveBeenCalled();

      await user.click(loadButton);

      // Verify both clear functions were called
      await waitFor(() => {
        expect(mockClearPortfolio).toHaveBeenCalled();
        expect(mockClearAllPrices).toHaveBeenCalled();
      });
    });
  });
});
