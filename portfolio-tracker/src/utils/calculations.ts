/**
 * Calculation Utilities
 * 
 * Reusable utility functions for common financial and mathematical calculations.
 */

/**
 * Calculate weighted average.
 * 
 * @param values - Array of values
 * @param weights - Array of corresponding weights
 * @returns Weighted average, or 0 if total weight is 0
 * 
 * @example
 * ```typescript
 * const avg = calculateWeightedAverage([10, 20, 30], [1, 2, 3]);
 * // Returns: 23.33 (weighted average)
 * ```
 */
export function calculateWeightedAverage(
  values: number[],
  weights: number[]
): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must have the same length');
  }

  if (values.length === 0) {
    return 0;
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = values.reduce(
    (sum, value, index) => sum + value * weights[index],
    0
  );

  return weightedSum / totalWeight;
}

/**
 * Sum values by a specific key in an array of objects.
 * 
 * @param items - Array of objects
 * @param key - Key to sum
 * @returns Sum of all values for the specified key
 * 
 * @example
 * ```typescript
 * const sum = sumByKey([{ amount: 10 }, { amount: 20 }], 'amount');
 * // Returns: 30
 * ```
 */
export function sumByKey<T extends Record<string, any>>(
  items: T[],
  key: keyof T
): number {
  return items.reduce((sum, item) => {
    const value = item[key];
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Calculate percentage change between two values.
 * 
 * @param oldValue - Original value
 * @param newValue - New value
 * @returns Percentage change, or null if oldValue is 0
 * 
 * @example
 * ```typescript
 * const change = percentageChange(100, 120);
 * // Returns: 20 (20% increase)
 * 
 * const change2 = percentageChange(100, 80);
 * // Returns: -20 (20% decrease)
 * ```
 */
export function percentageChange(
  oldValue: number,
  newValue: number
): number | null {
  if (oldValue === 0) {
    return null;
  }

  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Round a number to a specific number of decimal places.
 * 
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 * 
 * @example
 * ```typescript
 * const rounded = roundToDecimals(3.14159, 2);
 * // Returns: 3.14
 * 
 * const rounded2 = roundToDecimals(10.5555, 3);
 * // Returns: 10.556
 * ```
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage of a value relative to a total.
 * 
 * @param value - The value
 * @param total - The total
 * @returns Percentage, or 0 if total is 0
 * 
 * @example
 * ```typescript
 * const pct = calculatePercentage(25, 100);
 * // Returns: 25
 * 
 * const pct2 = calculatePercentage(1, 3);
 * // Returns: 33.333...
 * ```
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return (value / total) * 100;
}

/**
 * Clamp a value between a minimum and maximum.
 * 
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 * 
 * @example
 * ```typescript
 * const clamped = clamp(150, 0, 100);
 * // Returns: 100
 * 
 * const clamped2 = clamp(-10, 0, 100);
 * // Returns: 0
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
