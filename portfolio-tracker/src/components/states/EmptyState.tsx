import React from 'react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'No data', description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl mb-2">📂</div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
