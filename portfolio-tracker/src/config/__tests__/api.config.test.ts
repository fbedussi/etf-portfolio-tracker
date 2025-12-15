import { describe, it, expect, beforeEach, vi } from 'vitest';
import { API_CONFIG, validateAPIConfig } from '../api.config';

describe('API Configuration', () => {
  describe('validateAPIConfig', () => {
    it('returns errors when API key is missing', () => {
      const originalApiKey = API_CONFIG.apiToken;
      API_CONFIG.apiToken = '';

      const result = validateAPIConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'API token is missing. Please set VITE_API_TOKEN in your .env file.'
      );

      API_CONFIG.apiToken = originalApiKey;
    });

    it('returns valid when API token is properly configured', () => {
      const originalApiKey = API_CONFIG.apiToken;
      API_CONFIG.apiToken = 'valid-api-token-12345';

      const result = validateAPIConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);

      API_CONFIG.apiToken = originalApiKey;
    });
  });
});
