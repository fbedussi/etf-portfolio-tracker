import { PortfolioValueCard, AssetAllocationChart, HoldingsTable } from '@/components/portfolio';
import { usePortfolio } from '@/hooks/usePortfolio';

/**
 * Dashboard Component
 * 
 * Main dashboard view that composes all portfolio components.
 * Shows portfolio value, allocation chart, and holdings table.
 */
export function Dashboard() {
  const { metrics } = usePortfolio();

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Hero Section - Portfolio Value */}
      <PortfolioValueCard />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Allocation Chart */}
        <AssetAllocationChart />

        {/* Future: Additional metrics or rebalancing card */}
        <div className="hidden md:block">
          {/* Placeholder for future content (e.g., rebalancing status) */}
        </div>
      </div>

      {/* Holdings Table - Full Width */}
      <HoldingsTable />
    </div>
  );
}
