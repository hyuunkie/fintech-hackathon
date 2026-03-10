'use client';

import { useState, useEffect } from 'react';
import { C } from '@/lib/constants';
import { Link, RefreshCw, Trash2, ExternalLink, Loader } from 'lucide-react';
import { getSnaptradeOAuthUrl, getSnaptradeAccounts, disconnectSnaptradeAccount } from '@/app/actions/snaptrade';
import type { Database } from '@/lib/database.types';

type InvestmentAccount = Database["public"]["Tables"]["investment_accounts"]["Row"];

export default function SnaptradeLinker({ userId }: { userId: string | null }) {
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    loadAccounts();
  }, [userId]);

  const loadAccounts = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      const data = await getSnaptradeAccounts(userId);
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    try {
      if (!userId) {
        setError('User ID not found');
        return;
      }
      setError(null);
      const oAuthUrl = await getSnaptradeOAuthUrl(userId);
      window.location.href = oAuthUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get OAuth URL');
    }
  };

  const handleSync = async (accountId: string) => {
    try {
      if (!userId) return;
      setSyncing(accountId);
      setError(null);

      // In a real implementation, you'd get the access token from secure storage
      // For now, we'll show how to trigger the sync endpoint
      const response = await fetch('/api/snaptrade/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          userId,
          accessToken: process.env.NEXT_PUBLIC_SNAPTRADE_ACCESS_TOKEN || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Sync failed');
        return;
      }

      setMessage(`✓ ${result.message}`);
      setTimeout(() => setMessage(null), 3000);
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account? All associated investments will be removed.')) {
      return;
    }

    try {
      if (!userId) return;
      setDisconnecting(accountId);
      setError(null);

      const success = await disconnectSnaptradeAccount(accountId, userId);
      if (success) {
        setMessage('Account disconnected successfully');
        setTimeout(() => setMessage(null), 3000);
        await loadAccounts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setDisconnecting(null);
    }
  };

  const formatCurrency = (value: number | null) =>
    value ? new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'USD' }).format(value) : 'N/A';

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString('en-SG') : 'Never';

  if (loading) {
    return (
      <div style={{ color: C.textMid, padding: '2rem', textAlign: 'center' }}>
        Loading Snaptrade accounts...
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>🔗 Snaptrade Integration</h2>
        <button
          onClick={handleLinkAccount}
          style={{
            backgroundColor: C.teal,
            color: C.bg,
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Link size={18} />
          Link Account
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(240, 96, 96, 0.1)',
          border: `1px solid ${C.red}`,
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          color: C.red,
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          backgroundColor: 'rgba(79, 206, 138, 0.1)',
          border: `1px solid ${C.green}`,
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          color: C.green,
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {accounts.length === 0 ? (
          <div style={{
            backgroundColor: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center',
            color: C.textMid,
          }}>
            <p style={{ margin: 0 }}>No Snaptrade accounts linked yet.</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Click "Link Account" to connect your Snaptrade investment account.
            </p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              style={{
                backgroundColor: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: '0.5rem',
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1rem',
                alignItems: 'start',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>
                  {account.brokerage_name || 'Investment Account'}
                </h3>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem', color: C.textMid }}>
                  <p style={{ margin: 0 }}>
                    <strong>Type:</strong> {account.account_type || 'Individual'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Balance:</strong> {formatCurrency(account.total_value)}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Currency:</strong> {account.currency}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Last Synced:</strong> {formatDate(account.last_synced_at)}
                  </p>
                  {account.snaptrade_account_id && (
                    <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', color: C.textDim }}>
                      ID: {account.snaptrade_account_id.substring(0, 20)}...
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSync(account.id)}
                  disabled={syncing === account.id}
                  style={{
                    backgroundColor: C.blue,
                    color: C.bg,
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '0.25rem',
                    cursor: syncing === account.id ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    minWidth: '130px',
                    opacity: syncing === account.id ? 0.6 : 1,
                  }}
                >
                  {syncing === account.id ? (
                    <>
                      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Sync Now
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDisconnect(account.id)}
                  disabled={disconnecting === account.id}
                  style={{
                    backgroundColor: C.red,
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '0.25rem',
                    cursor: disconnecting === account.id ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    opacity: disconnecting === account.id ? 0.6 : 1,
                  }}
                >
                  <Trash2 size={16} />
                  Disconnect
                </button>

                <a
                  href="https://snaptrade.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: 'transparent',
                    color: C.blue,
                    border: `1px solid ${C.blue}`,
                    padding: '0.6rem 1rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                  }}
                >
                  <ExternalLink size={14} />
                  View
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
