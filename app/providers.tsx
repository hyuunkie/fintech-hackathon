'use client';

import { AuthProvider } from '@/lib/auth-context';
import { SecurityProvider } from '@/context/SecurityContext';

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SecurityProvider>{children}</SecurityProvider>
    </AuthProvider>
  );
}