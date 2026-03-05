'use client';

import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  KeyRound,
  Bell,
  LogOut,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

import { useSecurity } from '@/context/SecurityContext';

/**
 * TIP (future-proof):
 * Move this into a shared file like `lib/theme.ts` and import it across pages/components.
 */
const C = {
  bg: '#080D14',
  bgCard: '#0F1622',
  bgElevated: '#162032',
  border: '#1E2D45',
  gold: '#C8A84B',
  teal: '#00C2A3',
  red: '#F06060',
  green: '#4FCE8A',
  text: '#E8EDF5',
  textMid: '#7A90B0',
  textDim: '#3D5070',
};

type Severity = 'info' | 'warn' | 'danger';

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function formatMFAMethod(m: string | null) {
  if (!m) return 'None';
  if (m === 'auth_app') return 'Authenticator app';
  if (m === 'sms') return 'SMS';
  if (m === 'passkey') return 'Passkey';
  return m;
}

function severityColor(s: Severity) {
  if (s === 'danger') return C.red;
  if (s === 'warn') return C.gold;
  return C.teal;
}

function gradeFromScore(score: number) {
  if (score >= 80) return { label: 'Strong', color: C.green, icon: ShieldCheck };
  if (score >= 55) return { label: 'Moderate', color: C.gold, icon: ShieldAlert };
  return { label: 'Weak', color: C.red, icon: ShieldAlert };
}

function Card({
  title,
  subtitle,
  children,
  right,
  fullWidth = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <section
      style={{ backgroundColor: C.bgCard, borderColor: C.border }}
      className={`rounded-2xl border p-5 md:p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold" style={{ color: C.text }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: C.textMid }}>
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{ borderColor: `${color}55`, backgroundColor: `${color}12`, color }}
      className="text-xs px-2 py-1 rounded-full border whitespace-nowrap"
    >
      {label}
    </span>
  );
}

function Button({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  className = '',
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const base =
    'px-3 py-2 rounded-lg border text-sm transition hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

  let style: React.CSSProperties = { borderColor: C.border, color: C.textMid, backgroundColor: 'transparent' };

  if (variant === 'primary') {
    style = { borderColor: `${C.teal}55`, color: C.teal, backgroundColor: `${C.teal}12` };
  }
  if (variant === 'danger') {
    style = { borderColor: `${C.red}55`, color: C.red, backgroundColor: `${C.red}12` };
  }
  if (variant === 'ghost') {
    style = { borderColor: C.border, color: C.textMid, backgroundColor: 'transparent' };
  }

  return (
    <button title={title} className={`${base} ${className}`} style={style} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function ConfirmModal({
  open,
  title,
  body,
  confirmText = 'Confirm',
  onConfirm,
  onClose,
  danger = false,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="relative w-full max-w-lg rounded-2xl border p-5 md:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold" style={{ color: C.text }}>
              {title}
            </div>
            <div className="text-sm mt-1" style={{ color: C.textMid }}>
              {body}
            </div>
          </div>
          <button onClick={onClose} className="text-sm" style={{ color: C.textMid }}>
            ✕
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SecurityCenter() {
  const store = useSecurity();
  const {
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
  } = store;

  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false);
  const [confirmRevokeConn, setConfirmRevokeConn] = useState<{ open: boolean; id?: string; name?: string }>({
    open: false,
  });

  const derived = useMemo(() => {
    const { label, color, icon } = gradeFromScore(securityScore);
    const activeSessions = sessions.filter((s) => s.status !== 'revoked');
    const untrustedActive = activeSessions.filter((s) => !s.trusted);
    const expiredConnections = connections.filter((c) => c.status === 'expired');

    const riskyTxnRead = connections.some((c) => c.status === 'connected' && c.scopes.transactions);
    const connectedCount = connections.filter((c) => c.status === 'connected').length;

    return {
      gradeLabel: label,
      gradeColor: color,
      GradeIcon: icon,
      activeSessionsCount: activeSessions.length,
      untrustedActiveCount: untrustedActive.length,
      expiredConnectionsCount: expiredConnections.length,
      riskyTxnRead,
      connectedCount,
    };
  }, [securityScore, sessions, connections]);

  const SecurityIcon = derived.GradeIcon;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Top status */}
      <Card
        title="Security Center"
        subtitle="Control what’s connected, who’s signed in, and what data is shared. Every action is logged."
        right={
          <div
            style={{
              borderColor: `${derived.gradeColor}55`,
              backgroundColor: `${derived.gradeColor}12`,
              color: derived.gradeColor,
            }}
            className="px-3 py-2 rounded-xl border flex items-center gap-2"
          >
            <SecurityIcon size={18} />
            <span className="font-semibold">{derived.gradeLabel}</span>
            <span className="opacity-80">({clamp(securityScore)}/100)</span>
          </div>
        }
        fullWidth
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.border }} className="rounded-xl border p-4">
            <div className="text-xs uppercase tracking-wider" style={{ color: C.textMid }}>
              MFA
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="font-semibold" style={{ color: C.text }}>
                {security.mfaEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <Pill label={security.mfaEnabled ? 'On' : 'Turn on'} color={security.mfaEnabled ? C.green : C.red} />
            </div>
            <div className="text-xs mt-2" style={{ color: C.textDim }}>
              Method: {formatMFAMethod(security.mfaMethod)}
            </div>
          </div>

          <div style={{ backgroundColor: C.bgElevated, borderColor: C.border }} className="rounded-xl border p-4">
            <div className="text-xs uppercase tracking-wider" style={{ color: C.textMid }}>
              Sessions
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="font-semibold" style={{ color: C.text }}>
                {derived.activeSessionsCount} active
              </div>
              <Pill
                label={derived.untrustedActiveCount > 0 ? `${derived.untrustedActiveCount} untrusted` : 'All trusted'}
                color={derived.untrustedActiveCount > 0 ? C.red : C.green}
              />
            </div>
            <div className="text-xs mt-2" style={{ color: C.textDim }}>
              Last login: {security.lastLogin.ts} · {security.lastLogin.device}
            </div>
          </div>

          <div style={{ backgroundColor: C.bgElevated, borderColor: C.border }} className="rounded-xl border p-4">
            <div className="text-xs uppercase tracking-wider" style={{ color: C.textMid }}>
              Connections
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="font-semibold" style={{ color: C.text }}>
                {derived.connectedCount} connected
              </div>
              <Pill
                label={derived.expiredConnectionsCount > 0 ? `${derived.expiredConnectionsCount} expired` : 'Healthy'}
                color={derived.expiredConnectionsCount > 0 ? C.gold : C.green}
              />
            </div>
            <div className="text-xs mt-2" style={{ color: C.textDim }}>
              {derived.riskyTxnRead ? 'Transactions access enabled on at least one provider' : 'Transactions access disabled'}
            </div>
          </div>
        </div>
      </Card>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Account protection */}
        <Card title="Account Protection" subtitle="Protect sign-in and recovery. Strong defaults, easy control.">
          <div className="space-y-3">
            <div
              style={{ backgroundColor: C.bgElevated, borderColor: C.border }}
              className="rounded-xl border p-4 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <Smartphone size={18} color={C.teal} className="mt-0.5" />
                <div>
                  <div className="font-semibold" style={{ color: C.text }}>
                    Multi-factor authentication
                  </div>
                  <div className="text-sm" style={{ color: C.textMid }}>
                    {security.mfaEnabled ? `Enabled · ${formatMFAMethod(security.mfaMethod)}` : 'Disabled · strongly recommended'}
                  </div>

                  {/* Method selector (safe even if MFA off) */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { id: 'auth_app', label: 'Authenticator' },
                      { id: 'sms', label: 'SMS' },
                      { id: 'passkey', label: 'Passkey' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMFAMethod(m.id as any)}
                        style={{
                          borderColor:
                            security.mfaMethod === m.id ? `${C.teal}55` : C.border,
                          backgroundColor:
                            security.mfaMethod === m.id ? `${C.teal}12` : 'transparent',
                          color: security.mfaMethod === m.id ? C.teal : C.textMid,
                        }}
                        className="text-xs px-3 py-1.5 rounded-full border hover:opacity-80 transition"
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button variant={security.mfaEnabled ? 'ghost' : 'primary'} onClick={toggleMFA}>
                {security.mfaEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div
              style={{ backgroundColor: C.bgElevated, borderColor: C.border }}
              className="rounded-xl border p-4 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <KeyRound size={18} color={C.gold} className="mt-0.5" />
                <div>
                  <div className="font-semibold" style={{ color: C.text }}>
                    Backup codes
                  </div>
                  <div className="text-sm" style={{ color: C.textMid }}>
                    {security.backupCodesGenerated ? 'Generated · store them safely' : 'Generate recovery codes for emergencies'}
                  </div>
                </div>
              </div>

              <Button variant="primary" onClick={generateBackupCodes}>
                {security.backupCodesGenerated ? 'Regenerate' : 'Generate'}
              </Button>
            </div>

            <div
              style={{ backgroundColor: C.bgElevated, borderColor: C.border }}
              className="rounded-xl border p-4 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <Bell size={18} color={C.teal} className="mt-0.5" />
                <div>
                  <div className="font-semibold" style={{ color: C.text }}>
                    New-device alerts
                  </div>
                  <div className="text-sm" style={{ color: C.textMid }}>
                    Get notified when a new device signs in.
                  </div>
                </div>
              </div>

              <Button variant={security.newDeviceAlerts ? 'ghost' : 'primary'} onClick={toggleNewDeviceAlerts}>
                {security.newDeviceAlerts ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div className="pt-2">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => setConfirmSignOutAll(true)}
                title="Revokes all sessions except your current device"
              >
                <LogOut size={16} />
                Sign out all devices
              </Button>
            </div>
          </div>
        </Card>

        {/* Sessions */}
        <Card title="Devices & Sessions" subtitle="Trust devices you own. Revoke anything you don’t recognize.">
          <div className="space-y-3">
            {sessions.map((s) => {
              const statusColor =
                s.status === 'revoked' ? C.red : s.status === 'current' ? C.green : C.gold;

              return (
                <div
                  key={s.id}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.border }}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold" style={{ color: C.text }}>
                        {s.device}
                      </div>
                      <div className="text-sm" style={{ color: C.textMid }}>
                        {s.location} · last seen {s.lastSeen}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Pill label={s.status} color={statusColor} />
                        <Pill label={s.trusted ? 'trusted' : 'untrusted'} color={s.trusted ? C.green : C.red} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!s.trusted && s.status !== 'revoked' && (
                        <Button variant="primary" onClick={() => trustSession(s.id)}>
                          <CheckCircle2 size={16} />
                          Trust
                        </Button>
                      )}
                      {s.status !== 'current' && s.status !== 'revoked' && (
                        <Button variant="danger" onClick={() => revokeSession(s.id)}>
                          <XCircle size={16} />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Connections */}
        <Card
          title="Connected Data Access"
          subtitle="Pause sync, reduce scopes, or revoke access provider-by-provider."
          fullWidth
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connections.map((c) => {
              const statusCol =
                c.status === 'connected' ? C.green : c.status === 'expired' ? C.gold : C.red;

              const txnOn = c.status === 'connected' && c.scopes.transactions;

              return (
                <div
                  key={c.id}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.border }}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold" style={{ color: C.text }}>
                        {c.name}
                      </div>
                      <div className="text-sm" style={{ color: C.textMid }}>
                        Status:{' '}
                        <span style={{ color: statusCol }} className="font-semibold">
                          {c.status}
                        </span>{' '}
                        · Last sync: {c.lastSync}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Pill label={c.syncEnabled ? 'sync on' : 'sync off'} color={c.syncEnabled ? C.green : C.textMid} />
                        {txnOn && <Pill label="transactions scope on" color={C.gold} />}
                      </div>
                    </div>

                    <Button variant={c.syncEnabled ? 'ghost' : 'primary'} onClick={() => toggleSync(c.id)}>
                      {c.syncEnabled ? 'Pause' : 'Resume'}
                    </Button>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>
                      Scopes
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(['balances', 'holdings', 'transactions'] as const).map((k) => {
                        const on = c.scopes[k];
                        return (
                          <button
                            key={k}
                            onClick={() => toggleScope(c.id, k)}
                            style={{
                              borderColor: on ? `${C.teal}55` : C.border,
                              backgroundColor: on ? `${C.teal}12` : 'transparent',
                              color: on ? C.teal : C.textMid,
                            }}
                            className="text-xs px-3 py-1.5 rounded-full border hover:opacity-80 transition"
                            title={k === 'transactions' ? 'Read transactions (not money movement)' : undefined}
                          >
                            {k}
                          </button>
                        );
                      })}
                    </div>

                    {c.status === 'expired' && (
                      <div className="mt-3 flex items-start gap-2 text-sm" style={{ color: C.gold }}>
                        <AlertTriangle size={16} className="mt-0.5" />
                        <span>Connection expired. Re-authentication recommended.</span>
                      </div>
                    )}

                    <div className="mt-3">
                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={() => setConfirmRevokeConn({ open: true, id: c.id, name: c.name })}
                      >
                        <Trash2 size={16} />
                        Revoke connection
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-xs" style={{ color: C.textDim }}>
            Note: For demo trust, emphasize <span style={{ color: C.textMid }}>read-only access</span>, granular scopes,
            and <span style={{ color: C.textMid }}>revoke anytime</span>.
          </div>
        </Card>

        {/* Activity */}
        <Card title="Security Activity" subtitle="An audit trail of security-relevant actions." fullWidth>
          <div className="space-y-2">
            {secLog.map((e) => {
              const col = severityColor(e.severity);
              return (
                <div
                  key={e.id}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.border }}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold" style={{ color: C.text }}>
                        {e.title}
                      </div>
                      <div className="text-sm" style={{ color: C.textMid }}>
                        {e.detail}
                      </div>
                    </div>
                    <div className="text-xs whitespace-nowrap" style={{ color: col }}>
                      {e.ts}
                    </div>
                  </div>
                </div>
              );
            })}
            {secLog.length === 0 && (
              <div className="text-sm" style={{ color: C.textMid }}>
                No security events yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Confirm modals */}
      <ConfirmModal
        open={confirmSignOutAll}
        title="Sign out all devices?"
        body="This revokes all sessions except your current device. You can sign back in anytime."
        confirmText="Sign out all"
        danger
        onConfirm={signOutAll}
        onClose={() => setConfirmSignOutAll(false)}
      />

      <ConfirmModal
        open={confirmRevokeConn.open}
        title={`Revoke ${confirmRevokeConn.name ?? 'connection'}?`}
        body="This removes access for this provider. You can reconnect later."
        confirmText="Revoke"
        danger
        onConfirm={() => {
          if (confirmRevokeConn.id) revokeConnection(confirmRevokeConn.id);
        }}
        onClose={() => setConfirmRevokeConn({ open: false })}
      />
    </div>
  );
}