import { AppShell } from './components/layout';

function App() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Portfolio Tracker</h1>
        <p className="text-muted-foreground">
          Welcome to your personal ETF portfolio tracker
        </p>
      </div>
    </AppShell>
  );
}

export default App;
