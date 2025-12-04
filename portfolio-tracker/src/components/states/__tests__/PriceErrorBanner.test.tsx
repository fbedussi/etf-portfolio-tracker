import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PriceErrorBanner } from '../PriceErrorBanner';
import type { PriceError } from '@/store/priceStore';

describe('PriceErrorBanner', () => {
  const mockRetry = vi.fn();
  const mockDismiss = vi.fn();
  const mockDismissAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when there are no errors', () => {
      const { container } = render(<PriceErrorBanner errors={{}} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render single error message', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Price unavailable for VTI. Please check the ticker symbol.',
          code: 'INVALID_TICKER',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} />);

      expect(
        screen.getByText('Price unavailable for VTI. Please check the ticker symbol.')
      ).toBeInTheDocument();
    });

    it('should render multiple errors in a list', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Network error',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
        BND: {
          ticker: 'BND',
          message: 'Timeout error',
          code: 'TIMEOUT',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} />);

      expect(screen.getByText('2 price fetch errors')).toBeInTheDocument();
      expect(screen.getByText(/VTI:/)).toBeInTheDocument();
      expect(screen.getByText(/BND:/)).toBeInTheDocument();
    });

    it('should display warning style for cache fallback errors', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Using cached data from 5 minutes ago',
          code: 'FALLBACK_CACHE',
          timestamp: Date.now(),
        },
      };

      const { container } = render(<PriceErrorBanner errors={errors} />);

      const card = container.querySelector('.border-l-yellow-500');
      expect(card).toBeInTheDocument();
    });

    it('should display error style for non-cache errors', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Network error',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
      };

      const { container } = render(<PriceErrorBanner errors={errors} />);

      const card = container.querySelector('.border-l-destructive');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render retry button when onRetry provided', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} onRetry={mockRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} onRetry={mockRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should render dismiss all button when onDismissAll provided', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} onDismissAll={mockDismissAll} />);

      expect(screen.getByLabelText('Dismiss all errors')).toBeInTheDocument();
    });

    it('should call onDismissAll when dismiss all button clicked', async () => {
      const user = userEvent.setup();
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} onDismissAll={mockDismissAll} />);

      const dismissButton = screen.getByLabelText('Dismiss all errors');
      await user.click(dismissButton);

      expect(mockDismissAll).toHaveBeenCalledTimes(1);
    });

    it('should render individual dismiss buttons for multiple errors', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error 1',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
        BND: {
          ticker: 'BND',
          message: 'Error 2',
          code: 'TIMEOUT',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} onDismiss={mockDismiss} />);

      expect(screen.getByLabelText('Dismiss error for VTI')).toBeInTheDocument();
      expect(screen.getByLabelText('Dismiss error for BND')).toBeInTheDocument();
    });

    it('should call onDismiss with correct ticker when individual dismiss clicked', async () => {
      const user = userEvent.setup();
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error 1',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
        BND: {
          ticker: 'BND',
          message: 'Error 2',
          code: 'TIMEOUT',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} onDismiss={mockDismiss} />);

      const dismissVTI = screen.getByLabelText('Dismiss error for VTI');
      await user.click(dismissVTI);

      expect(mockDismiss).toHaveBeenCalledWith('VTI');
      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative icon', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
      };

      const { container } = render(<PriceErrorBanner errors={errors} />);

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should have accessible labels for dismiss buttons', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error 1',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
        BND: {
          ticker: 'BND',
          message: 'Error 2',
          code: 'TIMEOUT',
          timestamp: Date.now(),
        },
      };

      render(
        <PriceErrorBanner
          errors={errors}
          onDismiss={mockDismiss}
          onDismissAll={mockDismissAll}
        />
      );

      expect(screen.getByLabelText('Dismiss error for VTI')).toBeInTheDocument();
      expect(screen.getByLabelText('Dismiss error for BND')).toBeInTheDocument();
      expect(screen.getByLabelText('Dismiss all errors')).toBeInTheDocument();
    });
  });

  describe('Error Formatting', () => {
    it('should display ticker and message for multiple errors', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Network error occurred',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
        BND: {
          ticker: 'BND',
          message: 'Timeout error',
          code: 'TIMEOUT',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} />);

      expect(screen.getByText(/VTI:/)).toBeInTheDocument();
      expect(screen.getByText(/BND:/)).toBeInTheDocument();
      expect(screen.getByText(/Network error occurred/)).toBeInTheDocument();
      expect(screen.getByText(/Timeout error/)).toBeInTheDocument();
    });

    it('should show singular "error" for single error count', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Network error occurred',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} />);

      // Single error shows message directly, not count
      expect(screen.queryByText(/1 price fetch error/)).not.toBeInTheDocument();
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('should show plural "errors" for multiple error count', () => {
      const errors: Record<string, PriceError> = {
        VTI: {
          ticker: 'VTI',
          message: 'Error 1',
          code: 'NETWORK_ERROR',
          timestamp: Date.now(),
        },
        BND: {
          ticker: 'BND',
          message: 'Error 2',
          code: 'TIMEOUT',
          timestamp: Date.now(),
        },
      };

      render(<PriceErrorBanner errors={errors} />);

      expect(screen.getByText('2 price fetch errors')).toBeInTheDocument();
    });
  });
});
