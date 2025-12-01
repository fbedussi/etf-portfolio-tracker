import React from 'react';
import { Card } from '@/components/ui/card';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full animate-pulse bg-muted" />
          <div>
            <p className="font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoadingState;
