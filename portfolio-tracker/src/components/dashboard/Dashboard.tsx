import { PortfolioValueCard, AssetAllocationChart, HoldingsTable, RebalancingStatusCard, AllocationComparison } from '@/components/portfolio';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePrices } from '@/hooks/usePrices';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useEffect } from 'react';

/**
 * Dashboard Component
 * 
 * Main dashboard view that composes all portfolio components.
 * Shows portfolio value, allocation chart, and holdings table.
 */
export function Dashboard() {
  const { metrics } = usePortfolio();
  const portfolio = usePortfolioStore((state) => state.portfolio);
  const { fetchPrices } = usePrices();

  // Automatically fetch prices when portfolio is loaded
  useEffect(() => {
    if (portfolio?.etfs) {
      const tickers = Object.keys(portfolio.etfs);
      if (tickers.length > 0) {
        console.log('Fetching prices for tickers:', tickers);
        fetchPrices(tickers);
      }
    }
  }, [portfolio, fetchPrices]);

  return (
    <div className="container mx-auto space-y-6 py-6" data-testid="dashboard">
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
