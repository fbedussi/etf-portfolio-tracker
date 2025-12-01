import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ALPHA_VANTAGE_CONFIG, validateAPIConfig } from '../api.config';

describe('API Configuration', () => {
  describe('ALPHA_VANTAGE_CONFIG', () => {
    it('has correct base URL', () => {
      expect(ALPHA_VANTAGE_CONFIG.baseURL).toBe('https://www.alphavantage.co/query');
    });

    it('has rate limit configuration', () => {
      expect(ALPHA_VANTAGE_CONFIG.rateLimit).toEqual({
        callsPerMinute: 5,
        callsPerDay: 25,
      });
    });

    it('has timeout configuration', () => {
      expect(ALPHA_VANTAGE_CONFIG.timeout).toBe(10000);
    });
  });

  describe('validateAPIConfig', () => {
    it('returns errors when API key is missing', () => {
      const originalApiKey = ALPHA_VANTAGE_CONFIG.apiKey;
      ALPHA_VANTAGE_CONFIG.apiKey = '';

      const result = validateAPIConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Alpha Vantage API key is missing. Please set VITE_ALPHAVANTAGE_API_KEY in your .env file.'
      );

      ALPHA_VANTAGE_CONFIG.apiKey = originalApiKey;
    });

    it('returns warning when using demo API key', () => {
      const originalApiKey = ALPHA_VANTAGE_CONFIG.apiKey;
      ALPHA_VANTAGE_CONFIG.apiKey = 'demo';

      const result = validateAPIConfig();

      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('demo API key'))).toBe(true);

      ALPHA_VANTAGE_CONFIG.apiKey = originalApiKey;
    });

    it('returns valid when API key is properly configured', () => {
      const originalApiKey = ALPHA_VANTAGE_CONFIG.apiKey;
      ALPHA_VANTAGE_CONFIG.apiKey = 'valid-api-key-12345';

      const result = validateAPIConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);

      ALPHA_VANTAGE_CONFIG.apiKey = originalApiKey;
    });
  });
});
