'use client';

import { useState, useEffect } from 'react';
import { C } from '@/lib/constants';
import { Plus, X, Trash2 } from 'lucide-react';
import { getTransactions, deleteTransaction } from '@/app/actions/portfolio';
import type { Database } from '@/lib/database.types';

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export default function TransactionsCRUD({ userId }: { userId: string | null }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'category' | 'date'>('all');
  const [filterValue, setFilterValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getTransactions(userId, 100).then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (!userId || !confirm('Delete this transaction?')) return;
    setDeleting(true);
    try {
      const success = await deleteTransaction(id, userId);
      if (success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        setMessage('Transaction deleted successfully!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'category' && filterValue) return t.category === filterValue;
    if (filter === 'date' && filterValue) {
      const txDate = t.transaction_date ? new Date(t.transaction_date).toISOString().split('T')[0] : '';
      return txDate === filterValue;
    }
    return true;
  });

  const categories = [...new Set(transactions.map((t) => t.category).filter((c): c is string => c !== null && c !== undefined))];
  const totalSpent = filteredTransactions.reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(value);

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-SG');
  };

  if (loading) return <div style={{ color: C.textMid }}>Loading transactions...</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div>
        <h2 style={{ margin: 0 }}>💸 Transactions</h2>
        <p style={{ color: C.textMid, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
          Total: {formatCurrency(totalSpent)} ({filteredTransactions.length} transactions)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ color: C.textMid, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Filter Type</label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as 'all' | 'category' | 'date');
              setFilterValue('');
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: `1px solid ${C.border}`,
              backgroundColor: C.bg,
              color: C.text,
            }}
          >
            <option value="all">All Transactions</option>
            <option value="category">By Category</option>
            <option value="date">By Date</option>
          </select>
        </div>

        {filter === 'category' && (
          <div>
            <label style={{ color: C.textMid, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Category</label>
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${C.border}`,
                backgroundColor: C.bg,
                color: C.text,
              }}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {filter === 'date' && (
          <div>
            <label style={{ color: C.textMid, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Date</label>
            <input
              type="date"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${C.border}`,
                backgroundColor: C.bg,
                color: C.text,
              }}
            />
          </div>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(240, 96, 96, 0.1)', border: `1px solid ${C.red}`, borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', color: C.red }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ backgroundColor: 'rgba(79, 206, 138, 0.1)', border: `1px solid ${C.green}`, borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', color: C.green }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 0.8fr 1fr 0.6fr', gap: '1rem', padding: '1rem', backgroundColor: C.bgCard, borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem', color: C.textMid }}>
          <div>Description</div>
          <div style={{ textAlign: 'right' }}>Amount</div>
          <div style={{ textAlign: 'center' }}>Category</div>
          <div style={{ textAlign: 'center' }}>Date</div>
          <div></div>
        </div>

        {filteredTransactions.map((tx) => (
          <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 0.8fr 1fr 0.6fr', gap: '1rem', padding: '1rem', backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '0.5rem', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '500' }}>{tx.description}</p>
              {tx.merchant_name && <p style={{ margin: '0.25rem 0 0 0', color: C.textMid, fontSize: '0.85rem' }}>{tx.merchant_name}</p>}
            </div>
            <div style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(tx.amount ?? 0)}</div>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: C.textMid }}>{tx.category || 'N/A'}</div>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: C.textMid }}>{formatDate(tx.transaction_date)}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDelete(tx.id)}
                disabled={deleting}
                style={{
                  backgroundColor: C.red,
                  color: '#fff',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div style={{ backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: C.textMid }}>
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
