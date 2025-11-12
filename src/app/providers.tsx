'use client';

import type { ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase';
import { MusicPlayerProvider } from '@/context/music-player-context';
import AppLayout from '@/components/layout/app-layout';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <MusicPlayerProvider>
        <AppLayout>
          {children}
        </AppLayout>
      </MusicPlayerProvider>
    </FirebaseClientProvider>
  );
}
