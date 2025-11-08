import type { ReactNode } from 'react';
import BottomNav from './bottom-nav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}
