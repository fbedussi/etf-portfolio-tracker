import { API_CONFIG, validateAPIConfig } from '@/config/api.config';
import type { PriceData, ApiResponse } from '@/types/api.types';

export class PriceServiceError extends Error {
  code: string;
  isin?: string;

  constructor(
    message: string,
    code: string,
    isin?: string,
  ) {
    super(message);
    this.name = 'PriceServiceError';
    this.code = code;
    this.isin = isin;
  }
}

export class PriceService {
  constructor() {
    const validation = validateAPIConfig();
    if (!validation.valid) {
      console.error('API Configuration errors:', validation.errors);
    }
  }

  async fetchPrice(isin: string): Promise<PriceData> {
    if (!isin || isin.trim() === '') {
      throw new PriceServiceError(
        'Isin is required',
        'INVALID_ISIN',
        isin
      );
    }

    if (!API_CONFIG.apiToken) {
      throw new PriceServiceError(
        'API token is not configured',
        'MISSING_API_TOKEN',
        isin
      );
    }

    return this._fetchPriceOnce(isin);
  }

  /**
   * Single attempt to fetch price (used internally by fetchPrice with retry logic)
   * @private
   */
  private async _fetchPriceOnce(isin: string): Promise<PriceData> {
    try {
      console.log(`Fetching price for ${isin}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseURL}/${isin},XMIL,ISIN/intraday?resolution=1MN`, {
        headers: {
          authorization: `Bearer ${API_CONFIG.apiToken}`
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new PriceServiceError(
          `API request failed: ${response.status} ${response.statusText}`,
          'API_ERROR',
          isin
        );
      }

      const data = await response.json() as ApiResponse;

      if (data.status === 2007) {
        throw new PriceServiceError(
          'Invalid isin',
          'INVALID_ISIN',
          isin
        );
      }

      if (!data?.intradayPoint?.length) {
        throw new PriceServiceError(
          'No price data available',
          'NO_DATA',
          isin
        );
      }

      const priceData: PriceData = {
        isin: isin.toUpperCase(),
        price: data.intradayPoint.at(-1)?.endPx || 0,
        timestamp: Date.now(),
        currency: 'EUR',
        source: 'api',
      };

      console.log(`✓ Fetched ${isin}: $${priceData.price.toFixed(2)} (as of ${data.intradayPoint.at(-1)?.time})`);

      return priceData;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new PriceServiceError(
          `Request timeout for ${isin}`,
          'TIMEOUT',
          isin
        );
      }

      // Re-throw PriceServiceError
      if (error instanceof PriceServiceError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new PriceServiceError(
          `Network error for ${isin}. Check your internet connection.`,
          'NETWORK_ERROR',
          isin
        );
      }

      // Handle unknown errors
      throw new PriceServiceError(
        `Failed to fetch price for ${isin}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN_ERROR',
        isin
      );
    }
  }

  async fetchPrices(isins: string[]): Promise<Map<string, PriceData | Error>> {
    const results = new Map<string, PriceData | Error>();

    for (const isin of isins) {
      try {
        const priceData = await this.fetchPrice(isin);
        results.set(isin, priceData);
      } catch (error) {
        results.set(isin, error instanceof Error ? error : new Error('Unknown error'));
      }
    }

    return results;
  }
}

// Export singleton instance
export const priceService = new PriceService();
