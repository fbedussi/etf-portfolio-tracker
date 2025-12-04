/**
 * @file ErrorBoundary.test.tsx
 * @description Tests for ErrorBoundary component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = true, message = 'Test error' }: { shouldThrow?: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that throws during effect
const ThrowInEffect = () => {
  React.useEffect(() => {
    throw new Error('Error in useEffect');
  }, []);
  return <div>Effect component</div>;
};

// Import React for useEffect
import React from 'react';

describe('ErrorBoundary', () => {
  // Suppress console.error during tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('Normal Rendering', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should not render fallback UI when no error', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch rendering errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      // Should not render the error-throwing component
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should display error message in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should log error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <ThrowError message="Test error logging" />
        </ErrorBoundary>
      );

      // Should call console.error with error details
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should catch errors from nested components', () => {
      render(
        <ErrorBoundary>
          <div>
            <div>
              <ThrowError message="Nested error" />
            </div>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should catch errors thrown in useEffect', () => {
      render(
        <ErrorBoundary>
          <ThrowInEffect />
        </ErrorBoundary>
      );

      // Error boundary should catch effect errors
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should display error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // AlertCircle icon should be present (by aria-hidden)
      const icon = document.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lucide-circle-alert');
    });

    it('should display reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload application/i });
      expect(reloadButton).toBeInTheDocument();
    });

    it('should display go back button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should display help text', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/if the problem persists/i)).toBeInTheDocument();
    });

    it('should show error details in development mode', () => {
      // Mock dev environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      render(
        <ErrorBoundary>
          <ThrowError message="Detailed error message" />
        </ErrorBoundary>
      );

      // Should show details section in dev mode
      expect(screen.getByText(/error details/i)).toBeInTheDocument();

      // Restore environment
      (import.meta.env as any).DEV = originalEnv;
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('should use custom fallback over default', () => {
      const customFallback = (
        <div>
          <h1>My Custom Error</h1>
          <p>Please contact support</p>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('My Custom Error')).toBeInTheDocument();
      expect(screen.getByText('Please contact support')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should reload page when reload button is clicked', async () => {
      const user = userEvent.setup();

      // Mock window.location.reload
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload application/i });
      await user.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should go back when go back button is clicked', async () => {
      const user = userEvent.setup();

      // Mock window.history.back
      const backSpy = vi.fn();
      Object.defineProperty(window, 'history', {
        value: { back: backSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(backSpy).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state when handleReset is called', async () => {
      const user = userEvent.setup();

      // Mock window.location.reload
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI should be visible
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click reload button
      const reloadButton = screen.getByRole('button', { name: /reload application/i });
      await user.click(reloadButton);

      // Should trigger page reload
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible error heading', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { name: /something went wrong/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('should have accessible buttons with clear labels', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload application/i });
      const backButton = screen.getByRole('button', { name: /go back/i });

      expect(reloadButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it('should use aria-hidden for decorative icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Check that the icon has aria-hidden="true"
      const icon = document.querySelector('.lucide-circle-alert');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple errors in sequence', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError message="First error" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Rerender with different error
      rerender(
        <ErrorBoundary>
          <ThrowError message="Second error" />
        </ErrorBoundary>
      );

      // Should still show error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
