import { useMemo, useState } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

type SortField = 'category' | 'target' | 'current' | 'drift';
type SortDirection = 'asc' | 'desc';

interface AllocationRow {
  category: string;
  target: number;
  current: number;
  drift: number;
  absDrift: number;
}

/**
 * AllocationComparison Component
 * 
 * Displays a detailed comparison table of target vs current allocation.
 * Features sortable columns, color-coded drift indicators, and visual bars.
 */
export function AllocationComparison() {
  const portfolio = usePortfolioStore((state) => state.portfolio);
  const { metrics, rebalancingStatus } = usePortfolio();
  const [sortField, setSortField] = useState<SortField>('drift');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Build comparison rows
  const rows = useMemo<AllocationRow[]>(() => {
    if (!portfolio?.targetAllocation || !metrics?.currentAllocation) {
      return [];
    }

    const allCategories = new Set([
      ...Object.keys(portfolio.targetAllocation),
      ...Object.keys(metrics.currentAllocation),
    ]);

    return Array.from(allCategories).map(category => {
      const target = portfolio.targetAllocation[category] || 0;
      const current = metrics.currentAllocation[category] || 0;
      const drift = current - target;
      const absDrift = Math.abs(drift);

      return { category, target, current, drift, absDrift };
    });
  }, [portfolio, metrics]);

  // Sort rows
  const sortedRows = useMemo(() => {
    const sorted = [...rows];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'target':
          comparison = a.target - b.target;
          break;
        case 'current':
          comparison = a.current - b.current;
          break;
        case 'drift':
          comparison = a.absDrift - b.absDrift;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [rows, sortField, sortDirection]);

  // Get drift threshold
  const threshold = rebalancingStatus?.driftThreshold || 5;

  // Handle column header click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'drift' ? 'desc' : 'asc');
    }
  };

  // Get drift cell color classes
  const getDriftColor = (absDrift: number) => {
    if (absDrift >= threshold) {
      return 'text-red-600 dark:text-red-400 font-semibold';
    } else if (absDrift >= threshold / 2) {
      return 'text-yellow-600 dark:text-yellow-400 font-medium';
    }
    return 'text-green-600 dark:text-green-400';
  };

  // Get status icon
  const getStatusIcon = (absDrift: number) => {
    if (absDrift >= threshold) {
      return '🔴';
    } else if (absDrift >= threshold / 2) {
      return '🟡';
    }
    return '🟢';
  };

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  if (!portfolio || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Target vs Current Allocation</CardTitle>
          <CardDescription>Detailed comparison of your portfolio allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Load a portfolio to view allocation comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Target vs Current Allocation</CardTitle>
          <CardDescription>Detailed comparison of your portfolio allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No allocation data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target vs Current Allocation</CardTitle>
        <CardDescription>
          Click column headers to sort • Threshold: {formatPercentage(threshold)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    <SortIcon field="category" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('target')}
                >
                  <div className="flex items-center justify-end">
                    Target
                    <SortIcon field="target" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('current')}
                >
                  <div className="flex items-center justify-end">
                    Current
                    <SortIcon field="current" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('drift')}
                >
                  <div className="flex items-center justify-end">
                    Drift
                    <SortIcon field="drift" />
                  </div>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.map((row) => (
                <TableRow key={row.category}>
                  <TableCell className="font-medium capitalize">
                    {row.category}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="text-sm font-mono">
                        {formatPercentage(row.target)}
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${row.target}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="text-sm font-mono">
                        {formatPercentage(row.current)}
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full"
                          style={{ width: `${row.current}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn('text-sm font-mono', getDriftColor(row.absDrift))}>
                      {row.drift > 0 ? '+' : ''}{formatPercentage(row.drift)}
                      {row.drift !== 0 && (
                        <span className="ml-1 text-xs">
                          {row.drift > 0 ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span role="img" aria-label={`Status: ${row.absDrift >= threshold ? 'out of balance' : 'in balance'}`}>
                      {getStatusIcon(row.absDrift)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>🔴</span>
            <span>Out of balance (≥{formatPercentage(threshold)})</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🟡</span>
            <span>Watch closely (≥{formatPercentage(threshold / 2)})</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🟢</span>
            <span>Within target (&lt;{formatPercentage(threshold / 2)})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
