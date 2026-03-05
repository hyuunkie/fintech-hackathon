'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

type MFAMethod = 'auth_app' | 'sms' | 'passkey' | null;

export type SecuritySettings = {
  mfaEnabled: boolean;
  mfaMethod: MFAMethod;
  backupCodesGenerated: boolean;
  newDeviceAlerts: boolean;
  lastLogin: { ts: string; device: string; location: string };
};

export type Session = {
  id: string;
  device: string;
  location: string;
  lastSeen: string;
  status: 'current' | 'active' | 'revoked';
  trusted: boolean;
};

export type Connection = {
  id: string;
  name: string;
  status: 'connected' | 'expired' | 'disconnected';
  lastSync: string;
  syncEnabled: boolean;
  scopes: { balances: boolean; holdings: boolean; transactions: boolean };
};

export type SecEvent = {
  id: string;
  ts: string;
  title: string;
  detail: string;
  severity: 'info' | 'warn' | 'danger';
};

type SecurityStore = {
  security: SecuritySettings;
  sessions: Session[];
  connections: Connection[];
  secLog: SecEvent[];

  // derived
  securityScore: number;

  // actions
  toggleMFA: () => void;
  setMFAMethod: (m: MFAMethod) => void;
  generateBackupCodes: () => void;
  toggleNewDeviceAlerts: () => void;

  trustSession: (id: string) => void;
  revokeSession: (id: string) => void;
  signOutAll: () => void;

  toggleSync: (id: string) => void;
  toggleScope: (id: string, key: keyof Connection['scopes']) => void;
  revokeConnection: (id: string) => void;
};

const SecurityContext = createContext<SecurityStore | null>(null);

const nowLabel = () =>
  'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const initialSecurity: SecuritySettings = {
  mfaEnabled: false,
  mfaMethod: null,
  backupCodesGenerated: false,
  newDeviceAlerts: true,
  lastLogin: { ts: 'Today 14:20', device: 'Chrome on Mac', location: 'Singapore' },
};

const initialSessions: Session[] = [
  { id: 's1', device: 'Chrome on Mac', location: 'Singapore', lastSeen: 'Now', status: 'current', trusted: true },
  { id: 's2', device: 'iPhone App', location: 'Singapore', lastSeen: 'Yesterday 22:10', status: 'active', trusted: false },
];

const initialConnections: Connection[] = [
  { id: 'c1', name: 'DBS Bank', status: 'connected', lastSync: '2 min ago', syncEnabled: true, scopes: { balances: true, holdings: false, transactions: true } },
  { id: 'c2', name: 'Interactive Brokers', status: 'connected', lastSync: '5 min ago', syncEnabled: true, scopes: { balances: true, holdings: true, transactions: false } },
  { id: 'c3', name: 'Syfe', status: 'expired', lastSync: '3 days ago', syncEnabled: false, scopes: { balances: false, holdings: false, transactions: false } },
];

const initialSecLog: SecEvent[] = [
  { id: 'e1', ts: 'Mar 04, 16:00', title: 'New connection', detail: 'DBS Bank linked (read-only).', severity: 'info' },
  { id: 'e2', ts: 'Yesterday 22:00', title: 'Connection expired', detail: 'Syfe needs re-authentication.', severity: 'warn' },
];

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [security, setSecurity] = useState<SecuritySettings>(initialSecurity);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [secLog, setSecLog] = useState<SecEvent[]>(initialSecLog);

  const addEvent = (title: string, detail: string, severity: SecEvent['severity'] = 'info') => {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2);
    setSecLog((prev) => [{ id, ts: nowLabel(), title, detail, severity }, ...prev].slice(0, 20));
  };

  const securityScore = useMemo(() => {
    let score = 0;
    score += security.mfaEnabled ? 40 : 0;
    score += security.newDeviceAlerts ? 20 : 0;

    const hasUntrustedActive = sessions.some(
      (s) => (s.status === 'active' || s.status === 'current') && !s.trusted
    );
    score += hasUntrustedActive ? 0 : 20;

    const riskyScopes = connections.some((c) => c.status === 'connected' && c.scopes.transactions);
    score += riskyScopes ? 10 : 20;

    return Math.max(0, Math.min(100, score));
  }, [security.mfaEnabled, security.newDeviceAlerts, sessions, connections]);

  // actions
  const toggleMFA = () => {
    setSecurity((prev) => {
      const nextEnabled = !prev.mfaEnabled;
      addEvent(
        'MFA updated',
        nextEnabled ? 'Multi-factor authentication enabled.' : 'Multi-factor authentication disabled.',
        nextEnabled ? 'info' : 'warn'
      );
      return { ...prev, mfaEnabled: nextEnabled, mfaMethod: nextEnabled ? (prev.mfaMethod ?? 'auth_app') : null };
    });
  };

  const setMFAMethod = (m: MFAMethod) => {
    setSecurity((prev) => ({ ...prev, mfaMethod: m }));
    addEvent('MFA method updated', `MFA method set to ${m ?? 'none'}.`, 'info');
  };

  const generateBackupCodes = () => {
    setSecurity((prev) => ({ ...prev, backupCodesGenerated: true }));
    addEvent('Backup codes generated', 'New backup codes were generated.', 'info');
  };

  const toggleNewDeviceAlerts = () => {
    setSecurity((prev) => {
      const next = !prev.newDeviceAlerts;
      addEvent('Alert preference updated', `New-device alerts ${next ? 'enabled' : 'disabled'}.`, 'info');
      return { ...prev, newDeviceAlerts: next };
    });
  };

  const trustSession = (id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, trusted: true } : s)));
    addEvent('Device trusted', 'A device is now marked as trusted.', 'info');
  };

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'revoked' } : s)));
    addEvent('Session revoked', 'A device session was revoked.', 'warn');
  };

  const signOutAll = () => {
    setSessions((prev) => prev.map((s) => (s.status === 'current' ? s : { ...s, status: 'revoked' })));
    addEvent('Signed out all devices', 'All sessions except current were revoked.', 'danger');
  };

  const toggleSync = (id: string) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, syncEnabled: !c.syncEnabled } : c)));
    addEvent('Sync setting changed', 'A provider sync setting was updated.', 'info');
  };

  const toggleScope = (id: string, key: keyof Connection['scopes']) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, scopes: { ...c.scopes, [key]: !c.scopes[key] } } : c))
    );
    addEvent('Permissions changed', `Connection scope "${key}" was updated.`, 'warn');
  };

  const revokeConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'disconnected', syncEnabled: false, scopes: { balances: false, holdings: false, transactions: false } }
          : c
      )
    );
    addEvent('Connection revoked', 'A provider connection was revoked.', 'danger');
  };

  const value: SecurityStore = {
    security,
    sessions,
    connections,
    secLog,
    securityScore,
    toggleMFA,
    setMFAMethod,
    generateBackupCodes,
    toggleNewDeviceAlerts,
    trustSession,
    revokeSession,
    signOutAll,
    toggleSync,
    toggleScope,
    revokeConnection,
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used inside <SecurityProvider>');
  return ctx;
}