'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserByAuthId } from '@/app/actions/users';

interface CRUDTest {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  result?: string;
  error?: string;
}

const C = {
  bg: "#080D14",
  bgCard: "#0F1622",
  text: "#E8EDF5",
  textMid: "#7A90B0",
  border: "#1E2D45",
  green: "#4FCE8A",
  red: "#F06060",
  gold: "#C8A84B",
};

export default function TestCRUDPage() {
  const { session } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [tests, setTests] = useState<CRUDTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    const { id } = session.user;
    getUserByAuthId(id)
      .then((user) => {
        if (user) setUserId(user.id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session?.user]);

  const runCRUDTests = async () => {
    if (!userId) {
      alert('User ID not found');
      return;
    }

    const newTests: CRUDTest[] = [
      { endpoint: '/api/bank-accounts', method: 'GET', status: 'pending' },
      { endpoint: '/api/investment-accounts', method: 'GET', status: 'pending' },
      { endpoint: '/api/manual-assets', method: 'GET', status: 'pending' },
      { endpoint: '/api/investment-positions', method: 'GET', status: 'pending' },
      { endpoint: '/api/milestones', method: 'GET', status: 'pending' },
      { endpoint: '/api/transactions', method: 'GET', status: 'pending' },
      { endpoint: '/api/wellness-scores', method: 'GET', status: 'pending' },
      { endpoint: '/api/spending-insights', method: 'GET', status: 'pending' },
      { endpoint: '/api/health-scores', method: 'GET', status: 'pending' },
      { endpoint: '/api/health-scores?calculate=true', method: 'GET', status: 'pending' },
    ];

    setTests(newTests);

    for (let i = 0; i < newTests.length; i++) {
      try {
        const url = `${newTests[i].endpoint}?userId=${userId}`;
        const response = await fetch(url, { method: newTests[i].method });
        const data = await response.json();

        setTests((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: response.ok ? 'success' : 'error',
            result: JSON.stringify(data, null, 2),
            error: response.ok ? undefined : data.error,
          };
          return updated;
        });
      } catch (error) {
        setTests((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          return updated;
        });
      }
    }
  };

  if (loading) return <div style={{ color: C.textMid }}>Loading...</div>;
  if (!userId) return <div style={{ color: C.red }}>User ID not found</div>;

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>CRUD Operations Test Suite</h1>
        <p style={{ color: C.textMid, marginBottom: '2rem' }}>
          User ID: <code style={{ color: C.gold }}>{userId}</code>
        </p>

        <button
          onClick={runCRUDTests}
          style={{
            backgroundColor: C.gold,
            color: '#000',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '2rem',
          }}
        >
          Run All CRUD Tests
        </button>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {tests.map((test, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: '0.5rem',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>{test.method}</span>
                <code style={{ color: C.textMid, flex: 1 }}>{test.endpoint}</code>
                <span
                  style={{
                    color:
                      test.status === 'success'
                        ? C.green
                        : test.status === 'error'
                          ? C.red
                          : C.textMid,
                    fontWeight: 'bold',
                  }}
                >
                  {test.status.toUpperCase()}
                </span>
              </div>

              {test.error && (
                <div
                  style={{
                    backgroundColor: 'rgba(240, 96, 96, 0.1)',
                    border: `1px solid ${C.red}`,
                    borderRadius: '0.25rem',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    color: C.red,
                  }}
                >
                  <strong>Error:</strong> {test.error}
                </div>
              )}

              {test.result && (
                <pre
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${C.border}`,
                    borderRadius: '0.25rem',
                    padding: '1rem',
                    overflow: 'auto',
                    maxHeight: '300px',
                    fontSize: '0.85rem',
                    color: C.textMid,
                  }}
                >
                  {test.result}
                </pre>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '3rem',
            padding: '1.5rem',
            backgroundColor: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '0.5rem',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>Summary</h2>
          {tests.length > 0 && (
            <>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: C.green }}>Successful:</strong>{' '}
                {tests.filter((t) => t.status === 'success').length} / {tests.length}
              </p>
              <p>
                <strong style={{ color: C.red }}>Failed:</strong>{' '}
                {tests.filter((t) => t.status === 'error').length} / {tests.length}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
