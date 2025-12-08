import { PortfolioValueCard, AssetAllocationChart, HoldingsTable, RebalancingStatusCard, AllocationComparison } from '@/components/portfolio';
import { PriceErrorBanner } from '@/components/states/PriceErrorBanner';
import { OfflineBanner } from '@/components/states/OfflineBanner';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePrices } from '@/hooks/usePrices';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePriceStore } from '@/store/priceStore';
import { useEffect } from 'react';

/**
 * Dashboard Component
 * 
 * Main dashboard view that composes all portfolio components.
 * Shows portfolio value, allocation chart, and holdings table.
 */
export function Dashboard() {
  const portfolio = usePortfolioStore((state) => state.portfolio);
  const { fetchPrices, refreshPrices, clearError, clearErrors, lastUpdated } = usePrices();
  const priceErrors = usePriceStore((state) => state.errors);
  const isOnline = useOnlineStatus();

  // Automatically fetch prices when portfolio is loaded
  // TODO: this is to prevent useEffect loop, fix it in a more elegant way
  const tickers = Object.keys(portfolio?.etfs || {}).join(',');
  useEffect(() => {
    fetchPrices(tickers.split(','));
  }, [tickers, fetchPrices]);

  // Automatically refresh prices when coming back online
  // useEffect(() => {
  //   if (isOnline && portfolio?.etfs) {
  //     const tickers = Object.keys(portfolio.etfs);
  //     if (tickers.length > 0 && lastUpdated) {
  //       // Only refresh if we've fetched before
  //       console.log('Back online - refreshing prices');
  //       refreshPrices();
  //     }
  //   }
  // }, [isOnline, portfolio, lastUpdated, refreshPrices]);

  return (
    <div className="container mx-auto space-y-6 py-6" data-testid="dashboard">
      {/* Offline Banner */}
      {!isOnline && (
        <OfflineBanner
          lastUpdated={lastUpdated}
          onRetry={refreshPrices}
        />
      )}

      {/* Price Error Banner */}
      {Object.keys(priceErrors).length > 0 && (
        <PriceErrorBanner
          errors={priceErrors}
          onRetry={refreshPrices}
          onDismiss={clearError}
          onDismissAll={clearErrors}
        />
      )}

      {/* Hero Section - Portfolio Value */}
      <PortfolioValueCard />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Allocation Chart */}
        <AssetAllocationChart />

        {/* Rebalancing Status Card */}
        <RebalancingStatusCard />
      </div>

      {/* Holdings Table - Full Width */}
      <HoldingsTable />

      {/* Allocation Comparison - Full Width */}
      <AllocationComparison />
    </div>
  );
}
