'use client';

import type { ReactNode } from 'react';
import AppLayout from "@/components/layout/app-layout";
import { FirebaseClientProvider } from '@/firebase';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </FirebaseClientProvider>
  );
}
