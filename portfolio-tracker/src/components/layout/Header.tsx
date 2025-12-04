import { Moon, Sun, MonitorCog, MoreVertical, RefreshCw, FolderOpen, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store';
import { usePrices } from '@/hooks/usePrices';
import { usePriceStore } from '@/store/priceStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeTime } from '@/utils/formatters';
import { useState } from 'react';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { driftThreshold, setDriftThreshold } = useUIStore();
  const { refreshPrices, isLoading, lastUpdated } = usePrices();
  const prices = usePriceStore((state) => state.prices);
  const clearAllPrices = usePriceStore((state) => state.clearAllPrices);
  const portfolio = usePortfolioStore((state) => state.portfolio);
  const clearPortfolio = usePortfolioStore((state) => state.clearPortfolio);
  const [showThresholdSelector, setShowThresholdSelector] = useState(false);

  const cycleTheme = () => {
    // Cycle through: light -> dark -> auto -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'auto':
        return <MonitorCog className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark theme';
      case 'dark':
        return 'Switch to auto theme';
      case 'auto':
        return 'Switch to light theme';
      default:
        return 'Toggle theme';
    }
  };

  const handleRefreshPrices = async () => {
    await refreshPrices();
  };

  const handleLoadDifferentPortfolio = () => {
    clearPortfolio();
    clearAllPrices();
  };

  const handleThresholdChange = (value: number) => {
    setDriftThreshold(value);
    setShowThresholdSelector(false);
  };

  // Predefined threshold options
  const thresholdOptions = [2, 3, 5, 7, 10];

  // Determine price source - if all prices are from cache, show "Cached", otherwise "Live"
  const getPriceSource = () => {
    const priceValues = Object.values(prices);
    if (priceValues.length === 0) return null;
    
    const allCached = priceValues.every((p) => p.source === 'cache');
    const allApi = priceValues.every((p) => p.source === 'api');
    
    if (allCached) return 'cached';
    if (allApi) return 'live';
    return 'mixed';
  };

  const priceSource = getPriceSource();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Portfolio Tracker</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Placeholder for portfolio dropdown */}
          </div>

          <nav className="flex items-center gap-2">
            {/* Drift Threshold Selector - only show when portfolio has target allocation */}
            {portfolio?.targetAllocation && (
              <div className="relative hidden md:block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowThresholdSelector(!showThresholdSelector)}
                  className="gap-2"
                  aria-label="Configure drift threshold"
                >
                  <Settings2 className="h-4 w-4" />
                  Threshold: {driftThreshold}%
                </Button>
                
                {showThresholdSelector && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-2 shadow-md z-50">
                    <div className="text-sm font-medium mb-2 px-2">Drift Threshold</div>
                    <div className="space-y-1">
                      {thresholdOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleThresholdChange(option)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground ${
                            driftThreshold === option ? 'bg-accent font-medium' : ''
                          }`}
                          aria-label={`Set threshold to ${option}%`}
                        >
                          {option}%
                          {option === driftThreshold && ' ✓'}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 px-2 text-xs text-muted-foreground border-t pt-2">
                      Lower = more sensitive to drift
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Load Different Portfolio button - only show when portfolio is loaded */}
            {portfolio && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadDifferentPortfolio}
                aria-label="Load different portfolio"
                className="hidden sm:flex"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Different Portfolio
              </Button>
            )}

            {/* Price refresh section */}
            <div className="hidden md:flex items-center gap-2 mr-2 text-sm text-muted-foreground">
              {lastUpdated && (
                <>
                  <span className="whitespace-nowrap">
                    Prices updated {formatRelativeTime(lastUpdated)}
                  </span>
                  {priceSource && (
                    <Badge 
                      variant={priceSource === 'live' ? 'default' : 'secondary'}
                      className="ml-1 text-xs"
                    >
                      {priceSource === 'live' && '• Live'}
                      {priceSource === 'cached' && '• Cached'}
                      {priceSource === 'mixed' && '• Mixed'}
                    </Badge>
                  )}
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshPrices}
              disabled={isLoading}
              aria-label="Refresh prices"
              title="Refresh prices"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              aria-label={getThemeLabel()}
              title={`Theme: ${theme}`}
            >
              {getThemeIcon()}
            </Button>

            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
