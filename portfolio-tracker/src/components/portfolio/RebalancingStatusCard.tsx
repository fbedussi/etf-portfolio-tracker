import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePortfolioStore } from '@/store/portfolioStore';
import { formatPercentage } from '@/utils/formatters';

/**
 * RebalancingStatusCard Component
 * 
 * Displays the current rebalancing status of the portfolio with color-coded indicator.
 * Shows maximum drift and lists categories that are out of balance.
 */
export function RebalancingStatusCard() {
  const rebalancingStatus = usePortfolioStore((state) => state.rebalancingStatus);

  // Loading state
  if (!rebalancingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rebalancing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status, maxDrift, driftThreshold, categoryDrifts } = rebalancingStatus;

  // Get status-specific styling and content
  const statusConfig = {
    'in-balance': {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
      badgeVariant: 'default' as const,
      message: 'Your portfolio is balanced',
    },
    'monitor': {
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      badgeVariant: 'secondary' as const,
      message: 'Minor drift detected, keep monitoring',
    },
    'rebalance': {
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800',
      badgeVariant: 'destructive' as const,
      message: 'Rebalancing recommended',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Filter categories that exceed the threshold
  const outOfBalanceCategories = categoryDrifts.filter(
    (drift) => drift.absDrift >= driftThreshold
  );

  return (
    <Card className={`${config.borderColor} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${config.color}`} />
          <span>Rebalancing Status</span>
          <Badge variant={config.badgeVariant} className="ml-auto">
            {formatPercentage(maxDrift)} max drift
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-4 p-4 rounded-lg ${config.bgColor}`}>
          {/* Status Message */}
          <p className={`text-sm font-medium ${config.color}`}>
            {config.message}
          </p>

          {/* Maximum Drift */}
          <div className="text-sm">
            <span className="text-muted-foreground">Maximum drift: </span>
            <span className="font-semibold">{formatPercentage(maxDrift)}</span>
            <span className="text-muted-foreground text-xs ml-2">
              (threshold: {formatPercentage(driftThreshold)})
            </span>
          </div>

          {/* Out of Balance Categories */}
          {outOfBalanceCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Categories out of balance:
              </p>
              <ul className="space-y-1.5">
                {outOfBalanceCategories.map((drift) => {
                  const isOver = drift.drift > 0;
                  const driftText = isOver ? 'over target' : 'under target';
                  const driftIcon = isOver ? '↑' : '↓';
                  
                  return (
                    <li
                      key={drift.category}
                      className="text-sm flex items-center gap-2"
                    >
                      <span className={`font-mono ${config.color}`}>
                        {driftIcon}
                      </span>
                      <span className="font-medium capitalize">
                        {drift.category}:
                      </span>
                      <span className={config.color}>
                        {formatPercentage(Math.abs(drift.drift))} {driftText}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* In Balance Message */}
          {outOfBalanceCategories.length === 0 && status === 'in-balance' && (
            <p className="text-sm text-muted-foreground">
              All categories are within the {formatPercentage(driftThreshold)} threshold.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
