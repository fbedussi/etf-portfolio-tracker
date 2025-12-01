/**
 * API Configuration for external services
 */

export interface AlphaVantageConfig {
  baseURL: string;
  apiKey: string;
  timeout: number;
  rateLimit: {
    callsPerMinute: number;
    callsPerDay: number;
  };
}

/**
 * Alpha Vantage API Configuration
 * Free tier limits: 25 requests/day, 5 calls/minute
 */
export const ALPHA_VANTAGE_CONFIG: AlphaVantageConfig = {
  baseURL: 'https://www.alphavantage.co/query',
  apiKey: import.meta.env.VITE_ALPHAVANTAGE_API_KEY || '',
  timeout: 10000, // 10 seconds
  rateLimit: {
    callsPerMinute: 5,
    callsPerDay: 25,
  },
};

/**
 * Validate API configuration
 */
export function validateAPIConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ALPHA_VANTAGE_CONFIG.apiKey) {
    errors.push(
      'Alpha Vantage API key is missing. Please set VITE_ALPHAVANTAGE_API_KEY in your .env file.'
    );
  }

  if (ALPHA_VANTAGE_CONFIG.apiKey === 'demo') {
    errors.push(
      'Using demo API key. Please get your own free API key from https://www.alphavantage.co/support/#api-key'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  GLOBAL_QUOTE: 'GLOBAL_QUOTE',
  TIME_SERIES_DAILY: 'TIME_SERIES_DAILY',
} as const;

export type APIFunction = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
