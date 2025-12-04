import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OfflineBannerProps {
  lastUpdated?: number | null;
  onRetry?: () => void;
}

export function OfflineBanner({ lastUpdated, onRetry }: OfflineBannerProps) {
  const formatLastUpdated = (timestamp: number | null): string => {
    if (!timestamp) {
      return 'unknown';
    }

    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);

    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes === 1) {
      return '1 minute ago';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours === 1) {
        return '1 hour ago';
      } else {
        return `${diffHours} hours ago`;
      }
    }
  };

  return (
    <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          <WifiOff
            className="h-5 w-5 mt-0.5 flex-shrink-0 text-yellow-600 dark:text-yellow-500"
            aria-hidden="true"
          />
          
          <div className="flex-1">
            <div className="font-medium text-sm">
              You're offline
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Showing cached prices from {formatLastUpdated(lastUpdated)}.
              Portfolio calculations will continue to work with cached data.
            </p>
          </div>

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
