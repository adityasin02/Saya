'use client';

import type { ReactNode } from 'react';
import BottomNav from './bottom-nav';
import { useAuth, useFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="mx-auto max-w-md h-screen flex flex-col shadow-2xl">
        <main className="flex-1 overflow-y-auto pb-16">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
