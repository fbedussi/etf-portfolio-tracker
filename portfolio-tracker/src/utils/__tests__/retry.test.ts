import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  retryWithBackoff,
  createRetryWrapper,
  isRetryableError,
  DEFAULT_RETRY_OPTIONS,
} from '../retry';

describe('retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('retryWithBackoff', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = retryWithBackoff(fn);
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValueOnce('success');

      const onRetry = vi.fn();

      const promise = retryWithBackoff(fn, {
        maxAttempts: 3,
        delays: [100, 200, 300],
        onRetry,
      });

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);

      // Wait for first retry delay
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2); // Initial + 1 retry
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should use exponential backoff delays', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const delays = [1000, 2000, 4000];
      const onRetry = vi.fn();

      const promise = retryWithBackoff(fn, {
        maxAttempts: 3,
        delays,
        onRetry,
      });

      // Initial attempt (fails immediately)
      await vi.advanceTimersByTimeAsync(0);

      // First retry after 1000ms
      await vi.advanceTimersByTimeAsync(1000);

      // Second retry after 2000ms
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(onRetry).toHaveBeenCalledTimes(2); // 2 retries
    });

    it('should throw last error after all retries fail', async () => {
      const error1 = new Error('Fail 1');
      const error2 = new Error('Fail 2');
      const error3 = new Error('Fail 3');
      const error4 = new Error('Fail 4');

      const fn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockRejectedValueOnce(error3)
        .mockRejectedValueOnce(error4);

      const onFinalFailure = vi.fn();

      const promise = retryWithBackoff(fn, {
        maxAttempts: 3,
        delays: [100, 200, 300],
        onFinalFailure,
      });

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(0); // Initial
      await vi.advanceTimersByTimeAsync(100); // Retry 1
      await vi.advanceTimersByTimeAsync(200); // Retry 2
      await vi.advanceTimersByTimeAsync(300); // Retry 3

      try {
        await promise;
        // Should not reach here
        expect.fail('Promise should have rejected');
      } catch (error) {
        expect(error).toBe(error4);
        expect(fn).toHaveBeenCalledTimes(4); // Initial + 3 retries
        expect(onFinalFailure).toHaveBeenCalledTimes(1);
        expect(onFinalFailure).toHaveBeenCalledWith(error4);
      }
    });

    it('should use default options when not provided', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle non-Error rejections', async () => {
      const fn = vi.fn().mockRejectedValueOnce('string error').mockResolvedValue('success');

      const promise = retryWithBackoff(fn, {
        maxAttempts: 1,
        delays: [100],
      });

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use last delay if attempts exceed delay array length', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockRejectedValueOnce(new Error('Fail 4'))
        .mockResolvedValue('success');

      const delays = [100, 200]; // Only 2 delays
      const onRetry = vi.fn();

      const promise = retryWithBackoff(fn, {
        maxAttempts: 4, // But 4 retries
        delays,
        onRetry,
      });

      await vi.advanceTimersByTimeAsync(0); // Initial
      await vi.advanceTimersByTimeAsync(100); // Retry 1 (delays[0])
      await vi.advanceTimersByTimeAsync(200); // Retry 2 (delays[1])
      await vi.advanceTimersByTimeAsync(200); // Retry 3 (delays[1] again)
      await vi.advanceTimersByTimeAsync(200); // Retry 4 (delays[1] again)

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(5);
      expect(onRetry).toHaveBeenCalledTimes(4);
    });
  });

  describe('createRetryWrapper', () => {
    it('should create a reusable retry function', async () => {
      const retryAPI = createRetryWrapper({
        maxAttempts: 2,
        delays: [100, 200],
      });

      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryAPI(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should apply provided options to wrapped functions', async () => {
      const onRetry = vi.fn();
      const retryAPI = createRetryWrapper({
        maxAttempts: 2,
        delays: [100, 200],
        onRetry,
      });

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');

      const promise = retryAPI(fn);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;

      expect(result).toBe('success');
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      const error = new Error('Network error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error = new Error('Request timeout');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for validation errors', () => {
      const error = new Error('Validation failed');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for invalid errors', () => {
      const error = new Error('Invalid input');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for 4xx client errors', () => {
      const error = new Error('Bad request') as Error & { status: number };
      error.status = 400;
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return true for 429 rate limit errors', () => {
      const error = new Error('Rate limit') as Error & { status: number };
      error.status = 429;
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for 5xx server errors', () => {
      const error = new Error('Server error') as Error & { status: number };
      error.status = 500;
      expect(isRetryableError(error)).toBe(true);
    });
  });

  describe('DEFAULT_RETRY_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_RETRY_OPTIONS.maxAttempts).toBe(3);
      expect(DEFAULT_RETRY_OPTIONS.delays).toEqual([2000, 5000, 10000]);
    });
  });
});
