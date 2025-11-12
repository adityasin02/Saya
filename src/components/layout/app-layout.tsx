'use client';

import type { ReactNode } from 'react';
import BottomNav from './bottom-nav';
import { useAuth, useFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect, useState } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const firebase = useFirebase();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Guard clause to handle server-side rendering where context is null
  if (!firebase) {
    return null; // or a loading spinner
  }

  const { user, isUserLoading, auth } = firebase;

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
