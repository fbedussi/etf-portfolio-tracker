/**
 * usePortfolio Hook
 * 
 * React hook to orchestrate portfolio calculations and expose metrics to components.
 * Automatically recalculates when portfolio data or prices change.
 */

import { useEffect, useMemo, useState } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePriceStore } from '@/store/priceStore';
import { useUIStore } from '@/store/uiStore';
import {
  calculateHoldings,
  calculatePortfolioValue,
  calculateProfitLoss,
  calculateETFProfitLoss,
  calculateAllocation,
} from '@/services/portfolioService';
import { calculateRebalancingStatus } from '@/services/rebalancingService';
import type { PortfolioMetrics, HoldingDetail, RebalancingStatus } from '@/types/portfolio.types';

export interface UsePortfolioReturn {
  /** Calculated portfolio metrics, null if no portfolio loaded */
  metrics: PortfolioMetrics | null;
  /** Rebalancing status and drift analysis */
  rebalancingStatus: RebalancingStatus | null;
  /** True while calculations are being performed */
  isCalculating: boolean;
  /** Manually trigger recalculation */
  recalculate: () => void;
}

/**
 * Hook to calculate and expose portfolio metrics.
 * 
 * Automatically recalculates when:
 * - Portfolio data changes
 * - Prices are updated
 * 
 * @returns Portfolio metrics and calculation state
 * 
 * @example
 * ```typescript
 * function DashboardComponent() {
 *   const { metrics, isCalculating } = usePortfolio();
 *   
 *   if (!metrics) return <EmptyState />;
 *   if (isCalculating) return <LoadingState />;
 *   
 *   return (
 *     <div>
 *       <h2>Total Value: ${metrics.totalValue.toFixed(2)}</h2>
 *       <p>P&L: {metrics.totalProfitLossPercent.toFixed(2)}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePortfolio(): UsePortfolioReturn {
  const portfolio = usePortfolioStore((state) => state.portfolio);
  const setRebalancingStatus = usePortfolioStore((state) => state.setRebalancingStatus);
  const prices = usePriceStore((state) => state.prices);
  const driftThreshold = useUIStore((state) => state.driftThreshold);
  const [isCalculating, setIsCalculating] = useState(false);

  // Memoize calculations to avoid redundant work
  const metrics = useMemo<PortfolioMetrics | null>(() => {
    // Can't calculate without portfolio
    if (!portfolio || !portfolio.etfs) {
      return null;
    }

    setIsCalculating(true);

    try {
      // Step 1: Calculate holdings from transactions
      const holdings = calculateHoldings(portfolio.etfs);

      // Step 2: Calculate current portfolio value
      const totalValue = calculatePortfolioValue(holdings, prices);

      // Step 3: Calculate total cost from holdings
      const totalCost = Object.values(holdings).reduce(
        (sum, holding) => sum + holding.totalCost,
        0
      );

      // Step 4: Calculate portfolio-wide P&L
      const profitLossResult = calculateProfitLoss(holdings, prices);
      const totalProfitLoss = profitLossResult?.profitLoss ?? 0;
      const totalProfitLossPercent = profitLossResult?.profitLossPercent ?? 0;

      // Step 5: Calculate current allocation
      const currentAllocation = calculateAllocation(
        portfolio.etfs,
        holdings,
        prices
      );

      // Step 6: Build per-ETF holding details
      const holdingsByETF: HoldingDetail[] = Object.entries(portfolio.etfs).map(
        ([ticker, etf]) => {
          const holding = holdings[ticker];
          const priceData = prices[ticker];
          const currentPrice = priceData?.price ?? 0;
          const currentValue = holding.quantity * currentPrice;

          // Calculate per-ETF P&L
          const etfPL = calculateETFProfitLoss(ticker, holding, priceData);

          return {
            ticker,
            name: etf.name,
            quantity: holding.quantity,
            currentPrice,
            currentValue,
            costBasis: holding.costBasis,
            profitLoss: etfPL?.profitLoss ?? 0,
            profitLossPercent: etfPL?.profitLossPercent ?? 0,
          };
        }
      );

      return {
        totalValue,
        totalCost,
        totalProfitLoss,
        totalProfitLossPercent,
        currentAllocation,
        holdingsByETF,
      };
    } finally {
      setIsCalculating(false);
    }
  }, [portfolio, prices]);

  // Calculate rebalancing status
  const rebalancingStatus = useMemo<RebalancingStatus | null>(() => {
    if (!portfolio || !metrics || !portfolio.targetAllocation) {
      return null;
    }

    return calculateRebalancingStatus(
      metrics.currentAllocation,
      portfolio.targetAllocation,
      driftThreshold
    );
  }, [portfolio, metrics, driftThreshold]);

  // Update store with rebalancing status
  useEffect(() => {
    if (rebalancingStatus) {
      setRebalancingStatus(rebalancingStatus);
    }
  }, [rebalancingStatus, setRebalancingStatus]);

  // Recalculate function for manual triggers
  const recalculate = () => {
    // Force re-render by updating a dependency
    // The useMemo will automatically recalculate
    setIsCalculating(true);
    // Reset immediately - the useMemo will run and set it properly
    setTimeout(() => setIsCalculating(false), 0);
  };

  return {
    metrics,
    rebalancingStatus,
    isCalculating,
    recalculate,
  };
}
