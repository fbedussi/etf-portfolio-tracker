/**
 * Portfolio Service
 * 
 * Provides calculation functions for portfolio metrics including holdings,
 * cost basis, value, profit/loss, and asset allocation.
 */

import type { ETF, Holdings } from '../types/portfolio.types';
import type { PriceData } from '../types/api.types';

/**
 * Represents the current allocation of the portfolio by category.
 * Keys are category names (e.g., "Stocks", "Bonds"), values are percentages.
 */
export type AllocationByCategory = Record<string, number>;

/**
 * Calculate holdings and cost basis for each ETF from transaction history.
 * 
 * Sums all transactions (buy/sell) to get current quantity and computes
 * weighted average cost basis for each ETF.
 * 
 * @param etfs - Record of ETFs with their transaction history
 * @returns Holdings object with quantity, costBasis, and totalCost per ETF
 * 
 * @example
 * ```typescript
 * const holdings = calculateHoldings({
 *   VTI: {
 *     ticker: 'VTI',
 *     name: 'Vanguard Total Stock Market',
 *     transactions: [
 *       { date: '2024-01-15', quantity: 10, price: 220.50 },
 *       { date: '2024-06-15', quantity: 5, price: 235.20 }
 *     ],
 *     assetClasses: []
 *   }
 * });
 * // Returns: { VTI: { quantity: 15, costBasis: 225.40, totalCost: 3381 } }
 * ```
 */
export function calculateHoldings(
  etfs: Record<string, ETF>
): Holdings {
  const holdings: Holdings = {};

  for (const [ticker, etf] of Object.entries(etfs)) {
    // Sum all quantities (buy = positive, sell = negative)
    let totalQuantity = 0;
    let totalCost = 0;

    for (const transaction of etf.transactions) {
      const transactionCost = transaction.quantity * transaction.price;
      totalQuantity += transaction.quantity;
      totalCost += transactionCost;
    }

    // Calculate weighted average cost basis
    // Only calculate if we have positive quantity
    let costBasis = 0;
    if (totalQuantity > 0) {
      costBasis = totalCost / totalQuantity;
    }

    holdings[ticker] = {
      quantity: totalQuantity,
      costBasis,
      totalCost,
    };
  }

  return holdings;
}

/**
 * Calculate total current portfolio value using holdings and current prices.
 * 
 * Multiplies quantity × current price for each ETF and sums across all holdings.
 * Missing prices are excluded from the calculation.
 * 
 * @param holdings - Holdings object with quantity and cost basis per ETF
 * @param prices - Record of current prices by ticker
 * @returns Total portfolio value in currency units
 * 
 * @example
 * ```typescript
 * const value = calculatePortfolioValue(
 *   { VTI: { quantity: 15, costBasis: 225.40, totalCost: 3381 } },
 *   { VTI: { price: 235.50, timestamp: '2024-12-01' } }
 * );
 * // Returns: 3532.50 (15 × 235.50)
 * ```
 */
export function calculatePortfolioValue(
  holdings: Holdings,
  prices: Record<string, PriceData>
): number {
  let totalValue = 0;

  for (const [ticker, holding] of Object.entries(holdings)) {
    const priceData = prices[ticker];
    
    // Skip if price is not available
    if (!priceData || typeof priceData.price !== 'number') {
      continue;
    }

    const currentValue = holding.quantity * priceData.price;
    totalValue += currentValue;
  }

  return totalValue;
}

/**
 * Calculate profit/loss for the entire portfolio.
 * 
 * P&L is calculated as: (current value - total cost)
 * P&L percentage is: (P&L / total cost) × 100
 * 
 * @param holdings - Holdings object with quantity and cost basis per ETF
 * @param prices - Record of current prices by ticker
 * @returns Object with absolute P&L and percentage, or null for invalid scenarios
 * 
 * @example
 * ```typescript
 * const pl = calculateProfitLoss(
 *   { VTI: { quantity: 15, costBasis: 225.40, totalCost: 3381 } },
 *   { VTI: { price: 235.50, timestamp: '2024-12-01' } }
 * );
 * // Returns: { profitLoss: 151.50, profitLossPercent: 4.48 }
 * ```
 */
export function calculateProfitLoss(
  holdings: Holdings,
  prices: Record<string, PriceData>
): { profitLoss: number; profitLossPercent: number } | null {
  const currentValue = calculatePortfolioValue(holdings, prices);
  
  // Calculate total cost from all holdings
  let totalCost = 0;
  for (const holding of Object.values(holdings)) {
    totalCost += holding.totalCost;
  }

  // Cannot calculate P&L percentage with zero or negative cost basis
  if (totalCost <= 0) {
    return null;
  }

  const profitLoss = currentValue - totalCost;
  const profitLossPercent = (profitLoss / totalCost) * 100;

  return {
    profitLoss,
    profitLossPercent,
  };
}

/**
 * Calculate profit/loss for a specific ETF.
 * 
 * P&L is calculated as: (quantity × current price) - total cost
 * P&L percentage is: (P&L / total cost) × 100
 * 
 * @param ticker - ETF ticker symbol
 * @param holding - Holding data with quantity and cost basis
 * @param price - Current price data for the ETF
 * @returns Object with absolute P&L and percentage, or null for invalid scenarios
 * 
 * @example
 * ```typescript
 * const pl = calculateETFProfitLoss(
 *   'VTI',
 *   { quantity: 15, costBasis: 225.40, totalCost: 3381 },
 *   { price: 235.50, timestamp: '2024-12-01' }
 * );
 * // Returns: { profitLoss: 151.50, profitLossPercent: 4.48 }
 * ```
 */
export function calculateETFProfitLoss(
  ticker: string,
  holding: Holdings[string],
  price: PriceData | undefined
): { profitLoss: number; profitLossPercent: number } | null {
  // Cannot calculate without price
  if (!price || typeof price.price !== 'number') {
    return null;
  }

  const currentValue = holding.quantity * price.price;
  
  // Cannot calculate P&L percentage with zero or negative cost basis
  if (holding.totalCost <= 0) {
    return null;
  }

  const profitLoss = currentValue - holding.totalCost;
  const profitLossPercent = (profitLoss / holding.totalCost) * 100;

  return {
    profitLoss,
    profitLossPercent,
  };
}

/**
 * Calculate current asset class allocation across all ETFs with weighted distribution.
 * 
 * Distributes each ETF's current value proportionally across its asset classes,
 * then groups by category to calculate the portfolio's current allocation.
 * 
 * @param etfs - Record of ETFs with their asset class definitions
 * @param holdings - Holdings object with quantity per ETF
 * @param prices - Record of current prices by ticker
 * @returns Object mapping category names to their percentage allocation
 * 
 * @example
 * ```typescript
 * const allocation = calculateAllocation(
 *   {
 *     VTI: {
 *       ticker: 'VTI',
 *       name: 'Vanguard Total Stock Market',
 *       assetClasses: [{ name: 'US Stocks', category: 'Stocks', percentage: 100 }],
 *       transactions: []
 *     }
 *   },
 *   { VTI: { quantity: 15, costBasis: 225.40, totalCost: 3381 } },
 *   { VTI: { ticker: 'VTI', price: 235.50, timestamp: '2024-12-01' } }
 * );
 * // Returns: { 'Stocks': 100 }
 * ```
 */
export function calculateAllocation(
  etfs: Record<string, ETF>,
  holdings: Holdings,
  prices: Record<string, PriceData>
): AllocationByCategory {
  // Track total value contributed to each category
  const categoryValues: Record<string, number> = {};
  let totalPortfolioValue = 0;

  // Process each ETF
  for (const [ticker, etf] of Object.entries(etfs)) {
    const holding = holdings[ticker];
    const priceData = prices[ticker];

    // Skip if no holding or price data
    if (!holding || !priceData || typeof priceData.price !== 'number') {
      continue;
    }

    // Calculate ETF's current value
    const etfValue = holding.quantity * priceData.price;
    
    // Skip ETFs with zero or negative value
    if (etfValue <= 0) {
      continue;
    }

    totalPortfolioValue += etfValue;

    // Distribute ETF value across its asset classes
    for (const assetClass of etf.assetClasses) {
      const categoryValue = etfValue * (assetClass.percentage / 100);
      
      if (!categoryValues[assetClass.category]) {
        categoryValues[assetClass.category] = 0;
      }
      
      categoryValues[assetClass.category] += categoryValue;
    }
  }

  // Convert category values to percentages
  const allocation: AllocationByCategory = {};

  if (totalPortfolioValue === 0) {
    return allocation; // Return empty allocation for zero-value portfolio
  }

  for (const [category, value] of Object.entries(categoryValues)) {
    allocation[category] = (value / totalPortfolioValue) * 100;
  }

  return allocation;
}
