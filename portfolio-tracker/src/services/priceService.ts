import { ALPHA_VANTAGE_CONFIG, API_ENDPOINTS, validateAPIConfig } from '@/config/api.config';
import type { PriceData, AlphaVantageQuoteResponse } from '@/types/api.types';
import { retryWithBackoff, isRetryableError } from '@/utils/retry';

/**
 * Error types for price fetching
 */
export class PriceServiceError extends Error {
  code: string;
  ticker?: string;
  userMessage: string;

  constructor(
    message: string,
    code: string,
    ticker?: string,
    userMessage?: string
  ) {
    super(message);
    this.name = 'PriceServiceError';
    this.code = code;
    this.ticker = ticker;
    this.userMessage = userMessage || message;
  }

  /**
   * Get user-friendly error message based on error code
   */
  getUserFriendlyMessage(): string {
    switch (this.code) {
      case 'NETWORK_ERROR':
        return `Cannot fetch prices. Please check your internet connection and try again.`;
      
      case 'TIMEOUT':
        return `Request timed out for ${this.ticker}. The server took too long to respond.`;
      
      case 'RATE_LIMIT_EXCEEDED':
        return `API limit reached. Prices will refresh in a few minutes. Using cached data where available.`;
      
      case 'INVALID_TICKER':
        return `Price unavailable for ${this.ticker}. Please check the ticker symbol is correct.`;
      
      case 'MISSING_API_KEY':
        return `API key not configured. Please set up your Alpha Vantage API key.`;
      
      case 'API_KEY_ERROR':
        return `API key issue detected. Please verify your Alpha Vantage API key is valid.`;
      
      case 'NO_DATA':
        return `No price data available for ${this.ticker}. The ticker may be delisted or unavailable.`;
      
      case 'API_ERROR':
        return `Unable to fetch prices from the server. Please try again later.`;
      
      default:
        return this.userMessage;
    }
  }
}

/**
 * Service for fetching ETF prices from Alpha Vantage API
 */
export class PriceService {
  constructor() {
    // Validate API configuration on initialization
    const validation = validateAPIConfig();
    if (!validation.valid) {
      console.error('API Configuration errors:', validation.errors);
    }
  }

  /**
   * Fetch current price for a single ticker
   * @param ticker - ETF ticker symbol (e.g., "VTI")
   * @returns PriceData object with current price and metadata
   * @throws PriceServiceError if fetch fails
   */
  async fetchPrice(ticker: string): Promise<PriceData> {
    if (!ticker || ticker.trim() === '') {
      throw new PriceServiceError(
        'Ticker symbol is required',
        'INVALID_TICKER',
        ticker
      );
    }

    // Validate API key exists
    if (!ALPHA_VANTAGE_CONFIG.apiKey) {
      throw new PriceServiceError(
        'API key is not configured. Please set VITE_ALPHAVANTAGE_API_KEY in your .env file.',
        'MISSING_API_KEY',
        ticker
      );
    }

    // Wrap the fetch logic with retry mechanism
    return retryWithBackoff(
      async () => this._fetchPriceOnce(ticker),
      {
        maxAttempts: 3,
        delays: [2000, 5000, 10000], // 2s, 5s, 10s
        onRetry: (attempt, error) => {
          console.log(`⟳ Retry attempt ${attempt}/3 for ${ticker}: ${error.message}`);
        },
        onFinalFailure: (error) => {
          console.error(`✗ All retry attempts failed for ${ticker}:`, error.message);
        },
      }
    );
  }

  /**
   * Single attempt to fetch price (used internally by fetchPrice with retry logic)
   * @private
   */
  private async _fetchPriceOnce(ticker: string): Promise<PriceData> {
    try {
      console.log(`Fetching price for ${ticker}...`);

      // Build URL with query parameters
      const url = new URL(ALPHA_VANTAGE_CONFIG.baseURL);
      url.searchParams.append('function', API_ENDPOINTS.GLOBAL_QUOTE);
      url.searchParams.append('symbol', ticker);
      url.searchParams.append('apikey', ALPHA_VANTAGE_CONFIG.apiKey);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ALPHA_VANTAGE_CONFIG.timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new PriceServiceError(
          `API request failed: ${response.status} ${response.statusText}`,
          'API_ERROR',
          ticker
        );
      }

      const data = await response.json() as AlphaVantageQuoteResponse | any;

      // Check for API error responses
      if ('Error Message' in data) {
        throw new PriceServiceError(
          `Invalid ticker symbol: ${ticker}`,
          'INVALID_TICKER',
          ticker
        );
      }

      if ('Note' in data) {
        // Rate limit exceeded
        throw new PriceServiceError(
          'API rate limit exceeded. Please try again later.',
          'RATE_LIMIT_EXCEEDED',
          ticker
        );
      }

      if ('Information' in data) {
        // API key related issue
        throw new PriceServiceError(
          'API key issue. Please check your API key configuration.',
          'API_KEY_ERROR',
          ticker
        );
      }

      // Parse the global quote
      const quote = data['Global Quote'];
      
      if (!quote || Object.keys(quote).length === 0) {
        throw new PriceServiceError(
          `No price data available for ${ticker}`,
          'NO_DATA',
          ticker
        );
      }

      const price = parseFloat(quote['05. price']);
      const tradingDay = quote['07. latest trading day'];

      if (isNaN(price)) {
        throw new PriceServiceError(
          `Invalid price data for ${ticker}`,
          'INVALID_PRICE_DATA',
          ticker
        );
      }

      const priceData: PriceData = {
        ticker: ticker.toUpperCase(),
        price,
        timestamp: Date.now(),
        currency: 'USD', // Alpha Vantage returns USD prices
        source: 'alphavantage',
      };

      console.log(`✓ Fetched ${ticker}: $${price.toFixed(2)} (as of ${tradingDay})`);

      return priceData;
    } catch (error) {
      // Handle fetch errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new PriceServiceError(
          `Request timeout for ${ticker}`,
          'TIMEOUT',
          ticker
        );
      }

      // Re-throw PriceServiceError
      if (error instanceof PriceServiceError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new PriceServiceError(
          `Network error for ${ticker}. Check your internet connection.`,
          'NETWORK_ERROR',
          ticker
        );
      }

      // Handle unknown errors
      throw new PriceServiceError(
        `Failed to fetch price for ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN_ERROR',
        ticker
      );
    }
  }

  /**
   * Fetch prices for multiple tickers
   * Note: This will be enhanced with rate limiting queue in S3.5
   * @param tickers - Array of ticker symbols
   * @returns Map of ticker to PriceData or Error
   */
  async fetchPrices(tickers: string[]): Promise<Map<string, PriceData | Error>> {
    const results = new Map<string, PriceData | Error>();

    // For now, fetch sequentially to avoid rate limits
    // TODO: In S3.5, implement request queue with proper rate limiting
    for (const ticker of tickers) {
      try {
        const priceData = await this.fetchPrice(ticker);
        results.set(ticker, priceData);
        
        // Basic rate limiting: wait 12 seconds between calls (5 calls/min limit)
        if (tickers.indexOf(ticker) < tickers.length - 1) {
          await this.delay(12000);
        }
      } catch (error) {
        results.set(ticker, error instanceof Error ? error : new Error('Unknown error'));
      }
    }

    return results;
  }

  
  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get rate limit info
   */
  getRateLimits() {
    return ALPHA_VANTAGE_CONFIG.rateLimit;
  }
}

// Export singleton instance
export const priceService = new PriceService();
