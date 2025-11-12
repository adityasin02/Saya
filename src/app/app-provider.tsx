'use client';

import type { ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase';
import AppLayout from '@/components/layout/app-layout';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </FirebaseClientProvider>
  );
}
