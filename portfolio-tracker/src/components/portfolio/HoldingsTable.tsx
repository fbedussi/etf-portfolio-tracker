import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SortField = 'ticker' | 'name' | 'quantity' | 'currentPrice' | 'currentValue' | 'profitLoss';
type SortDirection = 'asc' | 'desc';

/**
 * HoldingsTable Component
 * 
 * Displays all ETF holdings in a sortable table with detailed metrics.
 */
export function HoldingsTable() {
  const { metrics, isCalculating } = usePortfolio();
  const [sortField, setSortField] = useState<SortField>('ticker');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedHoldings = useMemo(() => {
    if (!metrics?.holdingsByETF) return [];

    const holdings = [...metrics.holdingsByETF];

    holdings.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'ticker':
          compareValue = a.ticker.localeCompare(b.ticker);
          break;
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          compareValue = a.quantity - b.quantity;
          break;
        case 'currentPrice':
          compareValue = a.currentPrice - b.currentPrice;
          break;
        case 'currentValue':
          compareValue = a.currentValue - b.currentValue;
          break;
        case 'profitLoss':
          compareValue = a.profitLoss - b.profitLoss;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return holdings;
  }, [metrics, sortField, sortDirection]);

  if (isCalculating || !metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your ETF positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sortedHoldings.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your ETF positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <p>No holdings to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
        <CardDescription>
          {sortedHoldings.length} ETF{sortedHoldings.length !== 1 ? 's' : ''} in portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="ticker">Ticker</SortButton>
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortButton field="name">Name</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="quantity">Qty</SortButton>
                </TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  <SortButton field="currentPrice">Price</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="currentValue">Value</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="profitLoss">P&L</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => {
                const isProfit = holding.profitLoss > 0;
                const isLoss = holding.profitLoss < 0;
                const pnlColor = isProfit
                  ? 'text-green-600 dark:text-green-400'
                  : isLoss
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-muted-foreground';

                return (
                  <TableRow key={holding.ticker}>
                    <TableCell className="font-medium">{holding.ticker}</TableCell>
                    <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                      {holding.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(holding.quantity, 0)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      {holding.currentPrice > 0
                        ? formatCurrency(holding.currentPrice)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(holding.currentValue)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${pnlColor}`}>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          {isProfit && <TrendingUp className="h-3 w-3" />}
                          {isLoss && <TrendingDown className="h-3 w-3" />}
                          <span>{formatCurrency(Math.abs(holding.profitLoss))}</span>
                        </div>
                        <span className="text-xs">
                          ({formatPercentage(holding.profitLossPercent)})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
