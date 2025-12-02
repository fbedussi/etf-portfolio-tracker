import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * PortfolioValueCard Component
 * 
 * Displays the total portfolio value and profit/loss prominently.
 * This is the hero component on the dashboard.
 */
export function PortfolioValueCard() {
  const { metrics, isCalculating } = usePortfolio();

  if (isCalculating || !metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg text-muted-foreground">
            Total Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 w-48 animate-pulse rounded bg-muted" />
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalValue, totalProfitLoss, totalProfitLossPercent } = metrics;

  // Determine P&L color and icon
  const isProfit = totalProfitLoss > 0;
  const isLoss = totalProfitLoss < 0;
  const isNeutral = totalProfitLoss === 0;

  const pnlColor = isProfit
    ? 'text-green-600 dark:text-green-400'
    : isLoss
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-600 dark:text-gray-400';

  const bgColor = isProfit
    ? 'bg-green-50 dark:bg-green-950/20'
    : isLoss
    ? 'bg-red-50 dark:bg-red-950/20'
    : 'bg-gray-50 dark:bg-gray-900/20';

  const Icon = isProfit
    ? TrendingUp
    : isLoss
    ? TrendingDown
    : Minus;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg text-muted-foreground">
          Total Portfolio Value
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Value */}
        <div className="text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(totalValue)}
        </div>

        {/* Profit/Loss */}
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 ${bgColor}`}
        >
          <Icon className={`h-5 w-5 ${pnlColor}`} aria-hidden="true" />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <span className={`text-2xl font-semibold ${pnlColor}`}>
              {formatCurrency(Math.abs(totalProfitLoss))}
            </span>
            <span className={`text-lg font-medium ${pnlColor}`}>
              ({formatPercentage(totalProfitLossPercent)})
            </span>
          </div>
        </div>

        {/* Cost Basis (subtle) */}
        <div className="text-sm text-muted-foreground">
          Cost Basis: {formatCurrency(metrics.totalCost)}
        </div>
      </CardContent>
    </Card>
  );
}
