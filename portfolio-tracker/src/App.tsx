import { AppShell } from './components/layout';
import { FileUpload } from '@/components/ui/file-upload';

function App() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Portfolio Tracker</h1>
        <p className="text-muted-foreground">Welcome to your personal ETF portfolio tracker</p>

        <section className="pt-4">
          <FileUpload />
        </section>
      </div>
    </AppShell>
  );
}

export default App;
