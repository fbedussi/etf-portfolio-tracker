import { useEffect } from 'react';
import { AppShell, ErrorBoundary } from './components/layout';
import { FileUpload } from '@/components/ui/file-upload';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useTheme } from '@/hooks/useTheme';

function App() {
  const portfolio = usePortfolioStore((state) => state.portfolio);
  const restorePortfolio = usePortfolioStore((state) => state.restorePortfolio);
  
  // Initialize theme (applies to document root)
  useTheme();

  // Restore portfolio from IndexedDB on mount
  useEffect(() => {
    restorePortfolio();
  }, [restorePortfolio]);

  return (
    <ErrorBoundary>
      <AppShell>
        {!portfolio ? (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Portfolio Tracker</h1>
            <p className="text-muted-foreground">Welcome to your personal ETF portfolio tracker</p>

            <section className="pt-4">
              <FileUpload />
            </section>
          </div>
        ) : (
          <Dashboard />
        )}
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
