"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Music, Heart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/library', icon: Music, label: 'Library' },
  { href: '/favorites', icon: Heart, label: 'Favorites' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/80 backdrop-blur-md">
      <nav className="flex h-16 items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors duration-200',
                isActive ? 'text-primary' : 'hover:text-foreground'
              )}
            >
              <item.icon
                className="h-6 w-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
