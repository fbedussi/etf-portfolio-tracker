// API and Price Data Models

export interface PriceData {
  ticker: string;
  price: number;
  timestamp: number; // Unix timestamp
  currency: string; // e.g., "EUR", "USD"
  source: 'api' | 'cache';
}

export interface PriceCache {
  [ticker: string]: {
    price: number;
    timestamp: number;
    expiresAt: number;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AlphaVantageQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}
