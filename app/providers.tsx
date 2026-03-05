'use client';

import { SecurityProvider } from '@/context/SecurityContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SecurityProvider>{children}</SecurityProvider>;
}