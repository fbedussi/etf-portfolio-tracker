import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PriceError } from '@/store/priceStore';

interface PriceErrorBannerProps {
  errors: Record<string, PriceError>;
  onRetry?: () => void;
  onDismiss?: (ticker: string) => void;
  onDismissAll?: () => void;
}

export function PriceErrorBanner({
  errors,
  onRetry,
  onDismiss,
  onDismissAll,
}: PriceErrorBannerProps) {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  const hasMultipleErrors = errorEntries.length > 1;
  const isCacheError = errorEntries.some(
    ([, error]) => error.code === 'FALLBACK_CACHE'
  );

  return (
    <Card
      className={`border-l-4 ${
        isCacheError
          ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
          : 'border-l-destructive bg-destructive/10'
      }`}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          <AlertCircle
            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
              isCacheError ? 'text-yellow-600 dark:text-yellow-500' : 'text-destructive'
            }`}
            aria-hidden="true"
          />
          
          <div className="flex-1 space-y-2">
            {hasMultipleErrors ? (
              <>
                <div className="font-medium text-sm">
                  {errorEntries.length} price fetch {errorEntries.length === 1 ? 'error' : 'errors'}
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {errorEntries.map(([ticker, error]) => (
                    <li key={ticker} className="flex items-start gap-2">
                      <span className="flex-1">
                        <span className="font-medium">{ticker}:</span> {error.message}
                      </span>
                      {onDismiss && (
                        <button
                          onClick={() => onDismiss(ticker)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`Dismiss error for ${ticker}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <div className="font-medium text-sm">
                  {errorEntries[0][1].message}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
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
            {onDismissAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismissAll}
                className="h-8"
                aria-label="Dismiss all errors"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
