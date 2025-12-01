import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFileUpload } from '@/hooks/useFileUpload';
import { usePortfolioStore } from '@/store/portfolioStore';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { EmptyState } from '@/components/states/EmptyState';

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFile, isLoading, error, clearError } = useFileUpload();
  const portfolio = usePortfolioStore((s) => s.portfolio);
  const clearPortfolio = usePortfolioStore((s) => s.clearPortfolio);

  const onSelectFile = async (file?: File) => {
    if (!file) return;
    await uploadFile(file);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {isLoading && <LoadingState message="Loading portfolio..." />}

      {error && (
        <ErrorState
          error={error}
          onRetry={() => {
            clearError();
            inputRef.current?.click();
          }}
          onDismiss={() => clearError()}
        />
      )}

      {!portfolio && !isLoading && !error && (
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <EmptyState
              title="Load your portfolio"
              description="Upload a YAML portfolio file to get started."
            />

            <input
              ref={inputRef}
              type="file"
              accept=".yaml,.yml,text/yaml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                onSelectFile(f);
                e.currentTarget.value = '';
              }}
            />

            <div className="flex gap-2">
              <Button onClick={() => inputRef.current?.click()}>
                Choose File
              </Button>
              <Button variant="outline" onClick={() => {
                // show examples folder in docs — trivial action
                window.open('/examples/portfolio-simple.yaml', '_blank');
              }}>
                Example Files
              </Button>
            </div>
          </div>
        </Card>
      )}

      {portfolio && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Portfolio loaded</h3>
              <p className="text-sm text-muted-foreground">
                {portfolio?.name ?? 'Unnamed portfolio'} — {portfolio?.holdings?.length ?? 0} holdings
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => clearPortfolio()} variant="destructive">
                Clear
              </Button>
              <Button onClick={() => window.location.reload()}>
                Reload App
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default FileUpload;
