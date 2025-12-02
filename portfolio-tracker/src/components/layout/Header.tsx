import { Moon, Sun, MoreVertical, RefreshCw, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store';
import { usePrices } from '@/hooks/usePrices';
import { usePriceStore } from '@/store/priceStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { formatRelativeTime } from '@/utils/formatters';

export function Header() {
  const { theme, setTheme } = useUIStore();
  const { refreshPrices, isLoading, lastUpdated } = usePrices();
  const prices = usePriceStore((state) => state.prices);
  const clearAllPrices = usePriceStore((state) => state.clearAllPrices);
  const portfolio = usePortfolioStore((state) => state.portfolio);
  const clearPortfolio = usePortfolioStore((state) => state.clearPortfolio);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleRefreshPrices = async () => {
    await refreshPrices();
  };

  const handleLoadDifferentPortfolio = () => {
    clearPortfolio();
    clearAllPrices();
  };

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
      <div className="container flex h-14 items-center">
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
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
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
