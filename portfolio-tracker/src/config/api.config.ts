export interface ApiConfig {
  baseURL: string;
  apiToken: string;
  timeout: number;
}

export const API_CONFIG: ApiConfig = {
  baseURL: 'https://grafici.borsaitaliana.it/api/instruments',
  apiToken: import.meta.env.VITE_API_TOKEN || '',
  timeout: 10000, // 10 seconds
};

export function validateAPIConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!API_CONFIG.apiToken) {
    errors.push(
      'API token is missing. Please set VITE_API_TOKEN in your .env file.'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

