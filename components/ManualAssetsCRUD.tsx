'use client';

import { useState, useEffect } from 'react';
import { C } from '@/lib/constants';
import { Plus, X, Edit2, Trash2, Save } from 'lucide-react';
import { getManualAssets, createManualAsset, updateManualAsset, deleteManualAsset } from '@/app/actions/connected-apps';
import type { Database } from '@/lib/database.types';

type ManualAsset = Database["public"]["Tables"]["manual_assets"]["Row"];

export default function ManualAssetsCRUD({ userId }: { userId: string | null }) {
  const [assets, setAssets] = useState<ManualAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    asset_type: 'property',
    asset_name: '',
    estimated_value: 0,
    currency: 'SGD',
    property_address: '',
    outstanding_loan: 0,
    notes: '',
  });

  useEffect(() => {
    if (!userId) return;
    getManualAssets(userId).then((data) => {
      setAssets(data);
      setLoading(false);
    });
  }, [userId]);

  const handleAdd = async () => {
    if (!userId || !form.asset_name || form.estimated_value <= 0) {
      setError('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const created = await createManualAsset({
        user_id: userId,
        asset_type: form.asset_type,
        asset_name: form.asset_name,
        estimated_value: form.estimated_value,
        currency: form.currency,
        property_address: form.property_address || null,
        outstanding_loan: form.outstanding_loan || null,
        notes: form.notes || null,
      } as never);
      setAssets((prev) => [...prev, created]);
      setForm({ asset_type: 'property', asset_name: '', estimated_value: 0, currency: 'SGD', property_address: '', outstanding_loan: 0, notes: '' });
      setShowAdd(false);
      setMessage('Asset added successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add asset');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!userId) return;
    setSaving(true);
    try {
      const updated = await updateManualAsset(id, userId, {
        estimated_value: form.estimated_value,
        property_address: form.property_address || null,
        outstanding_loan: form.outstanding_loan || null,
        notes: form.notes || null,
      });
      if (updated) {
        setAssets((prev) => prev.map((a) => (a.id === id ? updated : a)));
        setEditingId(null);
        setMessage('Asset updated successfully!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId || !confirm('Delete this asset?')) return;
    setSaving(true);
    try {
      const success = await deleteManualAsset(id, userId);
      if (success) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        setMessage('Asset deleted successfully!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (asset: ManualAsset) => {
    setForm({
      asset_type: asset.asset_type || 'property',
      asset_name: asset.asset_name || '',
      estimated_value: asset.estimated_value || 0,
      currency: asset.currency || 'SGD',
      property_address: asset.property_address || '',
      outstanding_loan: asset.outstanding_loan || 0,
      notes: asset.notes || '',
    });
    setEditingId(asset.id);
  };

  const formatCurrency = (value: number, currency: string = 'SGD') =>
    new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format(value);

  const totalValue = assets.reduce((sum, a) => sum + (a.estimated_value ?? 0), 0);

  if (loading) return <div style={{ color: C.textMid }}>Loading assets...</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>🏠 Manual Assets</h2>
          <p style={{ color: C.textMid, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Total Value: {formatCurrency(totalValue)}
          </p>
        </div>
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
          {showAdd ? 'Cancel' : 'Add Asset'}
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
          <h3>Add New Asset</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <select
              value={form.asset_type}
              onChange={(e) => setForm({...form, asset_type: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            >
              <option>property</option>
              <option>crypto</option>
              <option>vehicle</option>
              <option>private_equity</option>
              <option>other</option>
            </select>
            <input
              type="text"
              placeholder="Asset Name"
              value={form.asset_name}
              onChange={(e) => setForm({...form, asset_name: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            />
            <input
              type="number"
              placeholder="Estimated Value"
              value={form.estimated_value}
              onChange={(e) => setForm({...form, estimated_value: parseFloat(e.target.value) || 0})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            />
            <select
              value={form.currency}
              onChange={(e) => setForm({...form, currency: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            >
              <option>SGD</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
            <input
              type="text"
              placeholder="Property Address (if applicable)"
              value={form.property_address}
              onChange={(e) => setForm({...form, property_address: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, gridColumn: 'span 2' }}
            />
            <input
              type="number"
              placeholder="Outstanding Loan (if any)"
              value={form.outstanding_loan}
              onChange={(e) => setForm({...form, outstanding_loan: parseFloat(e.target.value) || 0})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, gridColumn: 'span 1', minHeight: '60px' }}
            />
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
            {saving ? 'Saving...' : 'Save Asset'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {assets.map((asset) => (
          <div key={asset.id} style={{ backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '1.5rem' }}>
            {editingId === asset.id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ color: C.textMid, fontSize: '0.85rem' }}>Value</label>
                    <input
                      type="number"
                      value={form.estimated_value}
                      onChange={(e) => setForm({...form, estimated_value: parseFloat(e.target.value) || 0})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
                    />
                  </div>
                  <div>
                    <label style={{ color: C.textMid, fontSize: '0.85rem' }}>Loan</label>
                    <input
                      type="number"
                      value={form.outstanding_loan}
                      onChange={(e) => setForm({...form, outstanding_loan: parseFloat(e.target.value) || 0})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text }}
                    />
                  </div>
                </div>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Notes"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, marginBottom: '1rem', minHeight: '60px' }}
                />
                <button
                  onClick={() => handleUpdate(asset.id)}
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
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{asset.asset_name}</h4>
                  <p style={{ margin: '0.25rem 0', color: C.textMid, fontSize: '0.9rem' }}>
                    Value: {formatCurrency(asset.estimated_value ?? 0, asset.currency || 'SGD')}
                  </p>
                  {asset.outstanding_loan ? (
                    <p style={{ margin: '0.25rem 0', color: C.red, fontSize: '0.9rem' }}>
                      Loan: {formatCurrency(asset.outstanding_loan, asset.currency || 'SGD')}
                    </p>
                  ) : null}
                  <p style={{ margin: '0.25rem 0', color: C.textMid, fontSize: '0.85rem' }}>
                    Type: {asset.asset_type} | {asset.property_address && `Address: ${asset.property_address}`}
                  </p>
                  {asset.notes && <p style={{ margin: '0.5rem 0 0 0', color: C.textMid, fontSize: '0.85rem', fontStyle: 'italic' }}>{asset.notes}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(asset)}
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
                    onClick={() => handleDelete(asset.id)}
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

        {assets.length === 0 && !showAdd && (
          <div style={{ backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: C.textMid }}>
            No manual assets yet. Click "Add Asset" to get started!
          </div>
        )}
      </div>
    </div>
  );
}
