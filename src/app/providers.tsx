'use client';

import type { ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase';
import { MusicPlayerProvider } from '@/context/music-player-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <MusicPlayerProvider>
        {children}
      </MusicPlayerProvider>
    </FirebaseClientProvider>
  );
}
