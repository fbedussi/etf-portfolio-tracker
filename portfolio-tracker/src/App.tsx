import { AppShell } from './components/layout';
import { FileUpload } from '@/components/ui/file-upload';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { usePortfolioStore } from '@/store/portfolioStore';

function App() {
  const portfolio = usePortfolioStore((state) => state.portfolio);

  return (
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
  );
}

export default App;
