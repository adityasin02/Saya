import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AppProvider } from '@/app/app-provider';

export const metadata: Metadata = {
  title: 'Saya',
  description: 'A modern, AI-powered music player with a reel-style interface.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overscroll-none">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("font-body antialiased bg-black text-foreground", "overscroll-none")}>
        <div className="relative mx-auto flex h-screen max-h-screen w-full max-w-[min(100vw,calc(100vh*9/16))] flex-col overflow-hidden bg-background shadow-2xl">
          <AppProvider>
            {children}
          </AppProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
