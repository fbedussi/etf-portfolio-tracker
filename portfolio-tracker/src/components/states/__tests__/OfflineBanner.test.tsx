import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { OfflineBanner } from '../OfflineBanner';

describe('OfflineBanner', () => {
  const mockRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render offline message', () => {
      render(<OfflineBanner />);

      expect(screen.getByText("You're offline")).toBeInTheDocument();
    });

    it('should show cached prices message', () => {
      render(<OfflineBanner />);

      expect(
        screen.getByText(/Showing cached prices from/i)
      ).toBeInTheDocument();
    });

    it('should display "unknown" when no lastUpdated provided', () => {
      render(<OfflineBanner />);

      expect(screen.getByText(/from unknown/i)).toBeInTheDocument();
    });

    it('should display "just now" for very recent updates', () => {
      const now = Date.now();

      render(<OfflineBanner lastUpdated={now} />);

      expect(screen.getByText(/from just now/i)).toBeInTheDocument();
    });

    it('should display minutes for recent updates', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      render(<OfflineBanner lastUpdated={fiveMinutesAgo} />);

      expect(screen.getByText(/from 5 minutes ago/i)).toBeInTheDocument();
    });

    it('should display singular "minute" for 1 minute', () => {
      const oneMinuteAgo = Date.now() - 1 * 60 * 1000;

      render(<OfflineBanner lastUpdated={oneMinuteAgo} />);

      expect(screen.getByText(/from 1 minute ago/i)).toBeInTheDocument();
    });

    it('should display hours for older updates', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

      render(<OfflineBanner lastUpdated={twoHoursAgo} />);

      expect(screen.getByText(/from 2 hours ago/i)).toBeInTheDocument();
    });

    it('should display singular "hour" for 1 hour', () => {
      const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;

      render(<OfflineBanner lastUpdated={oneHourAgo} />);

      expect(screen.getByText(/from 1 hour ago/i)).toBeInTheDocument();
    });

    it('should show informative message about portfolio calculations', () => {
      render(<OfflineBanner />);

      expect(
        screen.getByText(/Portfolio calculations will continue to work with cached data/i)
      ).toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('should render retry button when onRetry provided', () => {
      render(<OfflineBanner onRetry={mockRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should not render retry button when onRetry not provided', () => {
      render(<OfflineBanner />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();

      render(<OfflineBanner onRetry={mockRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling', () => {
    it('should have yellow warning styling', () => {
      const { container } = render(<OfflineBanner />);

      const card = container.querySelector('.border-l-yellow-500');
      expect(card).toBeInTheDocument();
    });

    it('should have warning background', () => {
      const { container } = render(<OfflineBanner />);

      const card = container.querySelector('.bg-yellow-50');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative icon', () => {
      const { container } = render(<OfflineBanner />);

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should have accessible retry button label', () => {
      render(<OfflineBanner onRetry={mockRetry} />);

      const button = screen.getByRole('button', { name: /retry/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Time formatting edge cases', () => {
    it('should handle 0 milliseconds as just now', () => {
      const now = Date.now();

      render(<OfflineBanner lastUpdated={now} />);

      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });

    it('should handle 59 seconds as just now', () => {
      const almostOneMinute = Date.now() - 59 * 1000;

      render(<OfflineBanner lastUpdated={almostOneMinute} />);

      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });

    it('should handle 59 minutes correctly', () => {
      const almostOneHour = Date.now() - 59 * 60 * 1000;

      render(<OfflineBanner lastUpdated={almostOneHour} />);

      expect(screen.getByText(/59 minutes ago/i)).toBeInTheDocument();
    });

    it('should handle null lastUpdated', () => {
      render(<OfflineBanner lastUpdated={null} />);

      expect(screen.getByText(/from unknown/i)).toBeInTheDocument();
    });
  });
});
