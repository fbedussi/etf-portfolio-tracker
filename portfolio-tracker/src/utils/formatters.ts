/**
 * Utility functions for formatting values
 */

/**
 * Format a timestamp as relative time (e.g., "2 minutes ago", "just now")
 */
export function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) {
    return 'Never';
  }

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 10) {
    return 'just now';
  } else if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`;
  } else if (diffMinutes === 1) {
    return '1 minute ago';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours === 1) {
    return '1 hour ago';
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else {
    return `${diffDays} days ago`;
  }
}

/**
 * Format currency value with locale support
 * @param value - The numeric value to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: user's locale)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | null | undefined,
  currency = 'USD',
  locale?: string
): string {
  if (value === null || value === undefined) {
    return formatCurrency(0, currency, locale);
  }

  const userLocale = locale || navigator.language || 'en-US';
  
  return new Intl.NumberFormat(userLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage value with optional sign and decimals
 * @param value - The numeric percentage value
 * @param decimals - Number of decimal places (default: 2)
 * @param showSign - Whether to show + sign for positive values (default: true)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals = 2,
  showSign = true
): string {
  if (value === null || value === undefined) {
    return '0.00%';
  }

  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separators
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale string (default: user's locale)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 2,
  locale?: string
): string {
  if (value === null || value === undefined) {
    return '0';
  }

  const userLocale = locale || navigator.language || 'en-US';
  
  return new Intl.NumberFormat(userLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format large numbers in compact form (1.2M, 5.3K, etc.)
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 1)
 * @param locale - Locale string (default: user's locale)
 * @returns Formatted compact number string
 */
export function formatCompactNumber(
  value: number | null | undefined,
  decimals = 1,
  locale?: string
): string {
  if (value === null || value === undefined) {
    return '0';
  }

  const userLocale = locale || navigator.language || 'en-US';
  
  // Use Intl.NumberFormat with compact notation for modern browsers
  if ('compactDisplay' in Intl.NumberFormat.prototype) {
    return new Intl.NumberFormat(userLocale, {
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  
  // Fallback for older browsers
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`;
  } else if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`;
  } else if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(decimals)}K`;
  }
  
  return value.toFixed(decimals);
}

/**
 * Format date from ISO string or timestamp
 * @param date - ISO date string or timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) {
    return 'N/A';
  }

  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(navigator.language || 'en-US', defaultOptions).format(dateObj);
}

/**
 * Format date and time from ISO string or timestamp
 * @param date - ISO date string or timestamp
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: string | number | Date | null | undefined
): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
