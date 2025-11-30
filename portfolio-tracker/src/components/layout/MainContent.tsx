import type { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </main>
  );
}
