import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatRelativeTime,
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatCompactNumber,
  formatDate,
  formatDateTime,
} from '../formatters';

describe('formatRelativeTime', () => {
  let originalDateNow: () => number;
  const MOCK_NOW = 1700000000000; // Fixed timestamp for testing

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = vi.fn(() => MOCK_NOW);
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it('should return "Never" for null timestamp', () => {
    expect(formatRelativeTime(null)).toBe('Never');
  });

  it('should return "just now" for timestamps less than 10 seconds ago', () => {
    const timestamp = MOCK_NOW - 5000; // 5 seconds ago
    expect(formatRelativeTime(timestamp)).toBe('just now');
  });

  it('should return seconds for timestamps less than 1 minute ago', () => {
    const timestamp = MOCK_NOW - 30000; // 30 seconds ago
    expect(formatRelativeTime(timestamp)).toBe('30 seconds ago');
  });

  it('should return "1 minute ago" for exactly 1 minute', () => {
    const timestamp = MOCK_NOW - 60000; // 1 minute ago
    expect(formatRelativeTime(timestamp)).toBe('1 minute ago');
  });

  it('should return minutes for timestamps less than 1 hour ago', () => {
    const timestamp = MOCK_NOW - 900000; // 15 minutes ago
    expect(formatRelativeTime(timestamp)).toBe('15 minutes ago');
  });

  it('should return "1 hour ago" for exactly 1 hour', () => {
    const timestamp = MOCK_NOW - 3600000; // 1 hour ago
    expect(formatRelativeTime(timestamp)).toBe('1 hour ago');
  });

  it('should return hours for timestamps less than 1 day ago', () => {
    const timestamp = MOCK_NOW - 7200000; // 2 hours ago
    expect(formatRelativeTime(timestamp)).toBe('2 hours ago');
  });

  it('should return "1 day ago" for exactly 1 day', () => {
    const timestamp = MOCK_NOW - 86400000; // 1 day ago
    expect(formatRelativeTime(timestamp)).toBe('1 day ago');
  });

  it('should return days for timestamps more than 1 day ago', () => {
    const timestamp = MOCK_NOW - 172800000; // 2 days ago
    expect(formatRelativeTime(timestamp)).toBe('2 days ago');
  });
});

describe('formatCurrency', () => {
  it('should format USD currency by default', () => {
    expect(formatCurrency(1234.56)).toBe('€1,234.56');
  });

  it('should format with custom currency', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('should handle zero values', () => {
    expect(formatCurrency(0)).toBe('€0.00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-1234.56)).toBe('-€1,234.56');
  });

  it('should format large numbers with commas', () => {
    expect(formatCurrency(1234567.89)).toBe('€1,234,567.89');
  });

  it('should handle null values', () => {
    expect(formatCurrency(null)).toBe('€0.00');
  });

  it('should handle undefined values', () => {
    expect(formatCurrency(undefined)).toBe('€0.00');
  });
});

describe('formatPercentage', () => {
  it('should format positive percentage with + prefix', () => {
    expect(formatPercentage(5.25)).toBe('+5.25%');
  });

  it('should format negative percentage with - prefix', () => {
    expect(formatPercentage(-3.75)).toBe('-3.75%');
  });

  it('should format zero percentage', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });

  it('should respect decimals parameter', () => {
    expect(formatPercentage(5.12345, 4)).toBe('+5.1235%');
    expect(formatPercentage(5.12345, 0)).toBe('+5%');
  });

  it('should format without sign when showSign is false', () => {
    expect(formatPercentage(5.25, 2, false)).toBe('5.25%');
    expect(formatPercentage(-3.75, 2, false)).toBe('-3.75%');
  });

  it('should handle null values', () => {
    expect(formatPercentage(null)).toBe('0.00%');
  });

  it('should handle undefined values', () => {
    expect(formatPercentage(undefined)).toBe('0.00%');
  });
});

describe('formatNumber', () => {
  it('should format number with default 2 decimals', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });

  it('should format number with custom decimals', () => {
    expect(formatNumber(1234.56789, 4)).toBe('1,234.5679');
  });

  it('should format number with no decimals', () => {
    expect(formatNumber(1234.56, 0)).toBe('1,235');
  });

  it('should handle zero values', () => {
    expect(formatNumber(0)).toBe('0.00');
  });

  it('should format large numbers with commas', () => {
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('should handle null values', () => {
    expect(formatNumber(null)).toBe('0');
  });

  it('should handle undefined values', () => {
    expect(formatNumber(undefined)).toBe('0');
  });
});

describe('formatCompactNumber', () => {
  it('should format numbers under 1K without suffix', () => {
    expect(formatCompactNumber(999)).toMatch(/^999/);
  });

  it('should format thousands with K suffix', () => {
    const result = formatCompactNumber(1500);
    expect(result).toMatch(/1[.,]5K/);
  });

  it('should format millions with M suffix', () => {
    const result = formatCompactNumber(2500000);
    expect(result).toMatch(/2[.,]5M/);
  });

  it('should format billions with B suffix', () => {
    const result = formatCompactNumber(3500000000);
    expect(result).toMatch(/3[.,]5B/);
  });

  it('should handle negative values', () => {
    const result = formatCompactNumber(-1500);
    expect(result).toMatch(/-1[.,]5K/);
  });

  it('should respect decimals parameter', () => {
    const result = formatCompactNumber(1234, 2);
    expect(result).toMatch(/1[.,]2/);
  });

  it('should handle zero values', () => {
    expect(formatCompactNumber(0)).toBe('0.0');
  });

  it('should handle null values', () => {
    expect(formatCompactNumber(null)).toBe('0');
  });

  it('should handle undefined values', () => {
    expect(formatCompactNumber(undefined)).toBe('0');
  });
});

describe('formatDate', () => {
  it('should format date from ISO string', () => {
    const result = formatDate('2024-12-01T12:00:00Z');
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/2024/);
  });

  it('should format date from timestamp', () => {
    const timestamp = new Date('2024-12-01').getTime();
    const result = formatDate(timestamp);
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/2024/);
  });

  it('should format date from Date object', () => {
    const date = new Date('2024-12-01');
    const result = formatDate(date);
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/2024/);
  });

  it('should handle null values', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('should handle undefined values', () => {
    expect(formatDate(undefined)).toBe('N/A');
  });

  it('should handle invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid date');
  });

  it('should respect custom options', () => {
    const result = formatDate('2024-12-01', { 
      month: 'long',
      year: 'numeric',
    });
    expect(result).toMatch(/December/);
    expect(result).toMatch(/2024/);
  });
});

describe('formatDateTime', () => {
  it('should format date and time from ISO string', () => {
    const result = formatDateTime('2024-12-01T14:30:00Z');
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/2024/);
    // Time format can vary by locale, just check it's included
    expect(result.length).toBeGreaterThan(15);
  });

  it('should handle null values', () => {
    expect(formatDateTime(null)).toBe('N/A');
  });

  it('should handle undefined values', () => {
    expect(formatDateTime(undefined)).toBe('N/A');
  });
});
