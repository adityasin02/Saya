'use client';

import type { ReactNode } from 'react';
import BottomNav from './bottom-nav';
import { useAuth, useFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  return (
    <div className="relative min-h-screen w-full bg-background flex items-center justify-center p-4">
      {/* Aspect ratio container */}
      <div 
        className="w-full max-w-[400px] bg-background shadow-2xl rounded-3xl overflow-hidden relative"
        style={{ aspectRatio: '20 / 9' }}
      >
        <div className="h-full w-full flex flex-col">
            <main className="flex-1 overflow-y-auto pb-16">
              <ScrollArea className="h-full w-full">
                {children}
              </ScrollArea>
            </main>
            <BottomNav />
        </div>
      </div>
    </div>
  );
}
