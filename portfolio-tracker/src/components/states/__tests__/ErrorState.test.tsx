import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders error details correctly', () => {
    render(
      <ErrorState
        error="Validation Error: Invalid portfolio structure."
      />
    );

    expect(screen.getByText('Validation Error')).toBeInTheDocument();
    expect(
      screen.getByText('The portfolio file structure is invalid.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Validation Error: Invalid portfolio structure.')
    ).toBeInTheDocument();
  });

  it('calls onRetry when the Try Again button is clicked', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        error="Validation Error: Invalid portfolio structure."
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when the Dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorState
        error="Validation Error: Invalid portfolio structure."
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});