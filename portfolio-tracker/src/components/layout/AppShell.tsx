import type { ReactNode } from 'react';
import { Header } from './Header';
import { MainContent } from './MainContent';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <MainContent>{children}</MainContent>
    </div>
  );
}
