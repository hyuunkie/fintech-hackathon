'use client';

import { useState, useEffect } from 'react';
import { C } from '@/lib/constants';
import { Plus, X, Edit2, Trash2, Save } from 'lucide-react';
import { getInvestmentPositions, createInvestmentPosition, updateInvestmentPosition, deleteInvestmentPosition } from '@/app/actions/portfolio';
import { getInvestmentAccounts } from '@/app/actions/connected-apps';
import type { Database } from '@/lib/database.types';

type InvestmentPosition = Database["public"]["Tables"]["investment_positions"]["Row"];
type InvestmentAccount = Database["public"]["Tables"]["investment_accounts"]["Row"];

export default function PortfolioCRUD({ userId }: { userId: string | null }) {
  const [positions, setPositions] = useState<InvestmentPosition[]>([]);
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    investment_account_id: '',
    ticker_symbol: '',
    asset_name: '',
    asset_type: 'stock',
    quantity: 0,
    current_price: 0,
    currency: 'USD',
  });

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getInvestmentPositions(userId),
      getInvestmentAccounts(userId),
    ]).then(([pos, acc]) => {
      setPositions(pos);
      setAccounts(acc);
      setLoading(false);
    });
  }, [userId]);

  const handleAdd = async () => {
    if (!userId || !form.ticker_symbol || !form.asset_name || form.quantity <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const current_value = form.quantity * form.current_price;
      const created = await createInvestmentPosition({
        user_id: userId,
        investment_account_id: form.investment_account_id || null,
        ticker_symbol: form.ticker_symbol,
        asset_name: form.asset_name,
        asset_type: form.asset_type,
        quantity: form.quantity,
        current_price: form.current_price,
        current_value,
        currency: form.currency,
      } as never);
      setPositions(prev => [...prev, created]);
      setForm({ investment_account_id: '', ticker_symbol: '', asset_name: '', asset_type: 'stock', quantity: 0, current_price: 0, currency: 'USD' });
      setShowAdd(false);
      setMessage('Position added successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add position');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!userId) return;
    setSaving(true);
    try {
      const current_value = form.quantity * form.current_price;
      const updated = await updateInvestmentPosition(id, userId, {
        quantity: form.quantity,
        current_price: form.current_price,
        current_value,
      });
      if (updated) {
        setPositions(prev => prev.map(p => p.id === id ? updated : p));
        setEditingId(null);
        setMessage('Position updated successfully!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update position');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId || !confirm('Delete this position?')) return;
    setSaving(true);
    try {
      const success = await deleteInvestmentPosition(id, userId);
      if (success) {
        setPositions(prev => prev.filter(p => p.id !== id));
        setMessage('Position deleted successfully!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete position');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (position: InvestmentPosition) => {
    setForm({
      investment_account_id: position.investment_account_id || '',
      ticker_symbol: position.ticker_symbol || '',
      asset_name: position.asset_name || '',
      asset_type: position.asset_type || 'stock',
      quantity: position.quantity || 0,
      current_price: position.current_price || 0,
      currency: position.currency || 'USD',
    });
    setEditingId(position.id);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(value);

  if (loading) return <div style={{ color: C.textMid }}>Loading positions...</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>📈 Investment Positions</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            backgroundColor: showAdd ? C.red : C.gold,
            color: '#000',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          {showAdd ? 'Cancel' : 'Add Position'}
        </button>
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

      {showAdd && (
        <div style={{ backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3>Add New Position</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Ticker (e.g., AAPL)"
              value={form.ticker_symbol}
              onChange={(e) => setForm({...form, ticker_symbol: e.target.value.toUpperCase()})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            />
            <input
              type="text"
              placeholder="Asset Name"
              value={form.asset_name}
              onChange={(e) => setForm({...form, asset_name: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({...form, quantity: parseFloat(e.target.value) || 0})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            />
            <input
              type="number"
              placeholder="Price per Unit"
              value={form.current_price}
              onChange={(e) => setForm({...form, current_price: parseFloat(e.target.value) || 0})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            />
            <select
              value={form.asset_type}
              onChange={(e) => setForm({...form, asset_type: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            >
              <option>stock</option>
              <option>etf</option>
              <option>crypto</option>
              <option>bond</option>
              <option>other</option>
            </select>
            <select
              value={form.currency}
              onChange={(e) => setForm({...form, currency: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            >
              <option>USD</option>
              <option>SGD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            style={{
              marginTop: '1rem',
              backgroundColor: C.teal,
              color: C.bg,
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Position'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {positions.map((pos) => (
          <div key={pos.id} style={{ backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '1.5rem' }}>
            {editingId === pos.id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ color: C.textMid, fontSize: '0.85rem' }}>Quantity</label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setForm({...form, quantity: parseFloat(e.target.value) || 0})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
                    />
                  </div>
                  <div>
                    <label style={{ color: C.textMid, fontSize: '0.85rem' }}>Price</label>
                    <input
                      type="number"
                      value={form.current_price}
                      onChange={(e) => setForm({...form, current_price: parseFloat(e.target.value) || 0})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleUpdate(pos.id)}
                  disabled={saving}
                  style={{
                    backgroundColor: C.green,
                    color: C.bg,
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    marginRight: '0.5rem',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  <Save size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{ backgroundColor: C.textMid, color: C.bg, border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{pos.ticker_symbol} - {pos.asset_name}</h4>
                  <p style={{ margin: '0.25rem 0', color: C.textMid, fontSize: '0.9rem' }}>
                    {pos.quantity} units @ ${pos.current_price?.toFixed(2)} = {formatCurrency(pos.current_value ?? 0)}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: C.textMid, fontSize: '0.85rem' }}>
                    Type: {pos.asset_type} | Currency: {pos.currency}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(pos)}
                    style={{
                      backgroundColor: C.blue,
                      color: C.bg,
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pos.id)}
                    style={{
                      backgroundColor: C.red,
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {positions.length === 0 && !showAdd && (
          <div style={{ backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: C.textMid }}>
            No investment positions yet. Click "Add Position" to get started!
          </div>
        )}
      </div>
    </div>
  );
}
