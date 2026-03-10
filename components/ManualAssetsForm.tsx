'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { C } from '@/lib/constants';
import { getManualAssets, createManualAsset, updateManualAsset, deleteManualAsset } from '@/app/actions/portfolio';
import type { Database } from '@/lib/database.types';

type ManualAsset = Database["public"]["Tables"]["manual_assets"]["Row"];

const ASSET_TYPES = [
  { value: 'property', label: 'Property' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'gold', label: 'Gold/Precious Metals' },
  { value: 'other', label: 'Other' }
];

export default function ManualAssetsForm({ userId }: { userId: string | null }) {
  const [assets, setAssets] = useState<ManualAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    asset_type: 'property',
    asset_name: '',
    estimated_value: 0,
    currency: 'SGD',
    notes: '',
    property_address: '',
    outstanding_loan: 0,
    last_valued_at: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!userId) return;
    loadAssets();
  }, [userId]);

  const loadAssets = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getManualAssets(userId);
    setAssets(data);
    setLoading(false);
  };

  const handleReset = () => {
    setForm({
      asset_type: 'property',
      asset_name: '',
      estimated_value: 0,
      currency: 'SGD',
      notes: '',
      property_address: '',
      outstanding_loan: 0,
      last_valued_at: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!userId || !form.asset_name || form.estimated_value <= 0) return;

    setSaving(true);
    try {
      const baseData = {
        user_id: userId,
        asset_type: form.asset_type,
        asset_name: form.asset_name,
        estimated_value: form.estimated_value,
        currency: form.currency,
        notes: form.notes || null,
        property_address: form.property_address || null,
        outstanding_loan: form.outstanding_loan || null,
        last_valued_at: form.last_valued_at || null,
      };

      if (editingId) {
        const updated = await updateManualAsset(editingId, userId, baseData);
        if (updated) {
          setAssets(prev => prev.map(a => a.id === editingId ? updated : a));
          setShowForm(false);
          handleReset();
        }
      } else {
        const created = await createManualAsset(baseData);
        if (created) {
          setAssets(prev => [...prev, created]);
          setShowForm(false);
          handleReset();
        }
      }
    } catch (err) {
      console.error('Error saving asset:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (asset: ManualAsset) => {
    setForm({
      asset_type: asset.asset_type,
      asset_name: asset.asset_name,
      estimated_value: asset.estimated_value,
      currency: asset.currency,
      notes: asset.notes || '',
      property_address: asset.property_address || '',
      outstanding_loan: asset.outstanding_loan || 0,
      last_valued_at: asset.last_valued_at || new Date().toISOString().split('T')[0],
    });
    setEditingId(asset.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!userId || !confirm('Delete this asset?')) return;
    const success = await deleteManualAsset(id, userId);
    if (success) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SGD', minimumFractionDigits: 2 }).format(value);

  const totalAssets = assets.reduce((sum, a) => sum + a.estimated_value, 0);

  if (loading && userId) {
    return <div style={{ color: C.textMid }} className="text-center py-10 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold">Manual Assets</h2>
            <p style={{ color: C.textMid }} className="text-sm mt-1">Track property, cryptocurrency, vehicles, and other assets</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) handleReset(); }}
            style={{
              backgroundColor: showForm ? C.red : C.teal,
              color: showForm ? C.text : '#000',
            }}
            className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition hover:opacity-90"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Add Asset'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Total Assets</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAssets)}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Number of Assets</p>
            <p className="text-2xl font-bold">{assets.length}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Average Value</p>
            <p className="text-2xl font-bold">{formatCurrency(assets.length > 0 ? totalAssets / assets.length : 0)}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Asset' : 'Add Manual Asset'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Asset Type *</label>
              <select
                value={form.asset_type}
                onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-0"
              >
                {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Asset Name *</label>
              <input
                type="text"
                value={form.asset_name}
                onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
                placeholder="e.g. HDB Flat, Bitcoin Wallet"
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Estimated Value (SGD) *</label>
              <input
                type="number"
                value={form.estimated_value}
                onChange={(e) => setForm({ ...form, estimated_value: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Last Valued</label>
              <input
                type="date"
                value={form.last_valued_at}
                onChange={(e) => setForm({ ...form, last_valued_at: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            {form.asset_type === 'property' && (
              <>
                <div className="md:col-span-2">
                  <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Property Address</label>
                  <input
                    type="text"
                    value={form.property_address}
                    onChange={(e) => setForm({ ...form, property_address: e.target.value })}
                    placeholder="123 Tampines Ave, Singapore"
                    style={{
                      backgroundColor: C.bgElevated,
                      borderColor: C.border,
                      color: C.text,
                    }}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Outstanding Loan (SGD)</label>
                  <input
                    type="number"
                    value={form.outstanding_loan}
                    onChange={(e) => setForm({ ...form, outstanding_loan: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{
                      backgroundColor: C.bgElevated,
                      borderColor: C.border,
                      color: C.text,
                    }}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add any additional information..."
                rows={3}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving || !form.asset_name || form.estimated_value <= 0}
              style={{
                backgroundColor: C.teal,
                color: '#000',
                opacity: saving || !form.asset_name || form.estimated_value <= 0 ? 0.5 : 1,
              }}
              className="px-6 py-2 rounded-lg font-semibold transition disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : editingId ? 'Update Asset' : 'Add Asset'}
            </button>
            <button
              onClick={() => { setShowForm(false); handleReset(); }}
              style={{ backgroundColor: C.bgElevated, borderColor: C.border, color: C.text }}
              className="px-6 py-2 rounded-lg font-semibold border transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Assets List */}
      <div className="space-y-4">
        {assets.length === 0 && !showForm ? (
          <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-12 text-center">
            <p style={{ color: C.textMid }} className="text-sm">No manual assets added yet. Click "Add Asset" to get started.</p>
          </div>
        ) : (
          assets.map(asset => (
            <div
              key={asset.id}
              style={{ backgroundColor: C.bgCard, borderColor: C.border }}
              className="border rounded-2xl p-6 hover:border-opacity-100 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
                      style={{
                        backgroundColor: C.bgElevated,
                        color: C.teal,
                      }}
                    >
                      {asset.asset_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{asset.asset_name}</h3>
                      <p style={{ color: C.textMid }} className="text-sm">
                        {ASSET_TYPES.find(t => t.value === asset.asset_type)?.label}
                      </p>
                    </div>
                  </div>

                  {asset.property_address && (
                    <p style={{ color: C.textMid }} className="text-sm mt-2">
                      📍 {asset.property_address}
                    </p>
                  )}
                  {asset.notes && (
                    <p style={{ color: C.textDim }} className="text-sm mt-2">
                      {asset.notes}
                    </p>
                  )}

                  {asset.outstanding_loan ? (
                    <div className="mt-3 flex gap-4 text-sm">
                      <div>
                        <p style={{ color: C.textMid }} className="text-xs mb-1">Value</p>
                        <p className="font-bold">{formatCurrency(asset.estimated_value)}</p>
                      </div>
                      <div>
                        <p style={{ color: C.textMid }} className="text-xs mb-1">Outstanding Loan</p>
                        <p className="font-bold">{formatCurrency(asset.outstanding_loan)}</p>
                      </div>
                      <div>
                        <p style={{ color: C.textMid }} className="text-xs mb-1">Equity</p>
                        <p className="font-bold">{formatCurrency(asset.estimated_value - (asset.outstanding_loan || 0))}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="font-bold mt-3 text-lg">{formatCurrency(asset.estimated_value)}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(asset)}
                    style={{
                      backgroundColor: C.bgElevated,
                      borderColor: C.border,
                      color: C.gold,
                    }}
                    className="p-2 rounded-lg border transition hover:opacity-75"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    style={{
                      backgroundColor: C.bgElevated,
                      borderColor: C.border,
                      color: C.red,
                    }}
                    className="p-2 rounded-lg border transition hover:opacity-75"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {asset.last_valued_at && (
                <p style={{ color: C.textDim, borderColor: C.border }} className="text-xs mt-4 pt-4 border-t">
                  Last valued: {new Date(asset.last_valued_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
