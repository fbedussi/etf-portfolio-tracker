import type { CategoryDrift, RebalancingStatus } from '@/types/portfolio.types';

/**
 * Rebalancing Service
 * 
 * Provides functions to calculate portfolio drift and determine rebalancing needs.
 */

/**
 * Calculate drift between current and target allocation
 * 
 * @param currentAllocation - Current allocation by category (percentage as decimal 0-100)
 * @param targetAllocation - Target allocation by category (percentage as decimal 0-100)
 * @returns Array of CategoryDrift objects sorted by absolute drift (descending)
 * 
 * @example
 * ```typescript
 * const current = { stocks: 78.5, bonds: 13.8, 'real-estate': 7.7 };
 * const target = { stocks: 70, bonds: 20, 'real-estate': 10 };
 * const drifts = calculateDrift(current, target);
 * // [
 * //   { category: 'stocks', currentPercent: 78.5, targetPercent: 70, drift: 8.5, absDrift: 8.5 },
 * //   { category: 'bonds', currentPercent: 13.8, targetPercent: 20, drift: -6.2, absDrift: 6.2 },
 * //   { category: 'real-estate', currentPercent: 7.7, targetPercent: 10, drift: -2.3, absDrift: 2.3 }
 * // ]
 * ```
 */
export function calculateDrift(
  currentAllocation: Record<string, number>,
  targetAllocation: Record<string, number>
): CategoryDrift[] {
  // Get all unique categories from both allocations
  const categories = new Set([
    ...Object.keys(currentAllocation),
    ...Object.keys(targetAllocation),
  ]);

  const drifts: CategoryDrift[] = [];

  for (const category of categories) {
    const currentPercent = currentAllocation[category] ?? 0;
    const targetPercent = targetAllocation[category] ?? 0;
    const drift = currentPercent - targetPercent;
    const absDrift = Math.abs(drift);

    drifts.push({
      category,
      currentPercent,
      targetPercent,
      drift,
      absDrift,
    });
  }

  // Sort by absolute drift descending (highest drift first)
  return drifts.sort((a, b) => b.absDrift - a.absDrift);
}

/**
 * Determine rebalancing status based on drift threshold
 * 
 * @param maxDrift - Maximum absolute drift across all categories (percentage)
 * @param threshold - Drift threshold for rebalancing (default: 5%)
 * @returns Rebalancing status: 'in-balance', 'monitor', or 'rebalance'
 * 
 * Status Rules:
 * - in-balance: maxDrift < threshold
 * - monitor: threshold ≤ maxDrift < 2×threshold
 * - rebalance: maxDrift ≥ 2×threshold
 * 
 * @example
 * ```typescript
 * determineRebalancingStatus(3.2, 5) // 'in-balance'
 * determineRebalancingStatus(6.5, 5) // 'monitor'
 * determineRebalancingStatus(11.0, 5) // 'rebalance'
 * ```
 */
export function determineRebalancingStatus(
  maxDrift: number,
  threshold: number = 5
): 'in-balance' | 'monitor' | 'rebalance' {
  if (maxDrift < threshold) {
    return 'in-balance';
  }
  if (maxDrift < threshold * 2) {
    return 'monitor';
  }
  return 'rebalance';
}

/**
 * Get status message for display
 * 
 * @param status - Rebalancing status
 * @returns User-friendly status message
 */
export function getStatusMessage(status: 'in-balance' | 'monitor' | 'rebalance'): string {
  switch (status) {
    case 'in-balance':
      return 'Your portfolio is balanced';
    case 'monitor':
      return 'Minor drift detected, keep monitoring';
    case 'rebalance':
      return 'Rebalancing recommended';
  }
}

/**
 * Get status icon for display
 * 
 * @param status - Rebalancing status
 * @returns Icon name from lucide-react
 */
export function getStatusIcon(status: 'in-balance' | 'monitor' | 'rebalance'): string {
  switch (status) {
    case 'in-balance':
      return 'CheckCircle';
    case 'monitor':
      return 'AlertTriangle';
    case 'rebalance':
      return 'AlertCircle';
  }
}

/**
 * Calculate complete rebalancing status
 * 
 * @param currentAllocation - Current allocation by category
 * @param targetAllocation - Target allocation by category
 * @param threshold - Drift threshold (default: 5%)
 * @returns Complete RebalancingStatus object
 */
export function calculateRebalancingStatus(
  currentAllocation: Record<string, number>,
  targetAllocation: Record<string, number>,
  threshold: number = 5
): RebalancingStatus {
  const categoryDrifts = calculateDrift(currentAllocation, targetAllocation);
  const maxDrift = categoryDrifts.length > 0 ? categoryDrifts[0].absDrift : 0;
  const status = determineRebalancingStatus(maxDrift, threshold);

  return {
    status,
    maxDrift,
    driftThreshold: threshold,
    categoryDrifts,
  };
}
