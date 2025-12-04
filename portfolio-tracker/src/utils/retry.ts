/**
 * Options for retry with exponential backoff
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Delay in milliseconds for each retry attempt */
  delays: number[];
  /** Callback invoked before each retry attempt */
  onRetry?: (attempt: number, error: Error) => void;
  /** Callback invoked when all retries fail */
  onFinalFailure?: (error: Error) => void;
}

/**
 * Default retry options with exponential backoff
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delays: [2000, 5000, 10000], // 2s, 5s, 10s
};

/**
 * Retry a function with exponential backoff
 * 
 * Attempts to execute a function multiple times with increasing delays
 * between attempts. If all attempts fail, throws the last error.
 * 
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Promise resolving to the function's result
 * @throws The last error if all retry attempts fail
 * 
 * @example
 * ```typescript
 * const data = await retryWithBackoff(
 *   () => fetchPrice('VTI'),
 *   {
 *     maxAttempts: 3,
 *     delays: [2000, 5000, 10000],
 *     onRetry: (attempt, error) => {
 *       console.log(`Retry attempt ${attempt}: ${error.message}`);
 *     }
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  let lastError: Error | null = null;

  // First attempt (not a retry)
  try {
    return await fn();
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
  }

  // Retry attempts
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    // Get delay for this attempt (use last delay if we've exceeded the array length)
    const delayIndex = Math.min(attempt - 1, opts.delays.length - 1);
    const delay = opts.delays[delayIndex];

    // Notify about retry attempt
    if (opts.onRetry && lastError) {
      opts.onRetry(attempt, lastError);
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Attempt the function again
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // All retries failed
  if (opts.onFinalFailure && lastError) {
    opts.onFinalFailure(lastError);
  }

  // Throw the last error
  throw lastError;
}

/**
 * Create a retry wrapper for a function with predefined options
 * Useful for creating reusable retry functions
 * 
 * @param options - Retry configuration options
 * @returns Function that wraps any async function with retry logic
 * 
 * @example
 * ```typescript
 * const retryAPI = createRetryWrapper({
 *   maxAttempts: 3,
 *   delays: [1000, 2000, 4000],
 * });
 * 
 * const data = await retryAPI(() => fetch('/api/data'));
 * ```
 */
export function createRetryWrapper(options: Partial<RetryOptions> = {}) {
  return <T>(fn: () => Promise<T>): Promise<T> => {
    return retryWithBackoff(fn, options);
  };
}

/**
 * Check if an error should be retried
 * Some errors (like validation errors) shouldn't be retried
 * 
 * @param error - Error to check
 * @returns true if the error is retryable, false otherwise
 */
export function isRetryableError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();

  // Don't retry validation errors
  if (errorMessage.includes('validation')) {
    return false;
  }

  // Don't retry invalid input errors
  if (errorMessage.includes('invalid')) {
    return false;
  }

  // Don't retry client errors (4xx)
  if ('status' in error && typeof error.status === 'number') {
    const status = error.status as number;
    if (status >= 400 && status < 500 && status !== 429) {
      // Don't retry 4xx errors except rate limiting (429)
      return false;
    }
  }

  // Retry network errors, timeouts, and 5xx errors
  return true;
}
