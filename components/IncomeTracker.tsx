'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { C } from '@/lib/constants';
import { getIncomeEntries, createIncomeEntry, updateIncomeEntry, deleteIncomeEntry } from '@/app/actions/events';
import type { IncomeEntry } from '@/app/actions/events';

const INCOME_TYPES = [
  { value: 'salary', label: 'Salary' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'investment_return', label: 'Investment Return' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'freelance', label: 'Freelance Work' },
  { value: 'other', label: 'Other' }
];

export default function IncomeTracker({ userId }: { userId: string | null }) {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: 0,
    income_type: 'salary',
    source: '',
    income_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (!userId) return;
    loadEntries();
  }, [userId]);

  const loadEntries = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getIncomeEntries(userId);
    setEntries(data);
    setLoading(false);
  };

  const handleReset = () => {
    setForm({
      amount: 0,
      income_type: 'salary',
      source: '',
      income_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!userId || form.amount <= 0 || !form.source) return;

    setSaving(true);
    try {
      const baseData = {
        user_id: userId,
        amount: form.amount,
        income_type: form.income_type,
        source: form.source,
        income_date: form.income_date,
        notes: form.notes || undefined,
      };

      if (editingId) {
        const updated = await updateIncomeEntry(editingId, userId, baseData);
        if (updated) {
          setEntries(prev => prev.map(e => e.id === editingId ? updated : e));
          setShowForm(false);
          handleReset();
        }
      } else {
        const created = await createIncomeEntry(baseData);
        if (created) {
          setEntries(prev => [created, ...prev]);
          setShowForm(false);
          handleReset();
        }
      }
    } catch (err) {
      console.error('Error saving income entry:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: IncomeEntry) => {
    setForm({
      amount: entry.amount,
      income_type: entry.income_type,
      source: entry.source || '',
      income_date: entry.income_date,
      notes: entry.notes || '',
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!userId || !confirm('Delete this income entry?')) return;
    const success = await deleteIncomeEntry(id, userId);
    if (success) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SGD', minimumFractionDigits: 2 }).format(value);

  const totalIncome = entries.reduce((sum, e) => sum + e.amount, 0);
  const incomeByType = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.income_type] = (acc[e.income_type] || 0) + e.amount;
    return acc;
  }, {});

  if (loading && userId) {
    return <div style={{ color: C.textMid }} className="text-center py-10 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold">Income Tracker</h2>
            <p style={{ color: C.textMid }} className="text-sm mt-1">Track all sources of income</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) handleReset(); }}
            style={{
              backgroundColor: showForm ? C.red : C.green,
              color: showForm ? C.text : '#000',
            }}
            className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition hover:opacity-90"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Add Income'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Total Income</p>
            <p className="text-2xl font-bold" style={{ color: C.green }}>{formatCurrency(totalIncome)}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Number of Entries</p>
            <p className="text-2xl font-bold">{entries.length}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Average Per Entry</p>
            <p className="text-2xl font-bold">{formatCurrency(entries.length > 0 ? totalIncome / entries.length : 0)}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Income Entry' : 'Add Income Entry'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Income Type *</label>
              <select
                value={form.income_type}
                onChange={(e) => setForm({ ...form, income_type: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              >
                {INCOME_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Amount (SGD) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
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
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Source *</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="e.g. Company XYZ, Dividends"
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Date *</label>
              <input
                type="date"
                value={form.income_date}
                onChange={(e) => setForm({ ...form, income_date: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            <div className="md:col-span-2">
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add any additional information..."
                rows={2}
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
              disabled={saving || form.amount <= 0 || !form.source}
              style={{
                backgroundColor: C.green,
                color: '#000',
                opacity: saving || form.amount <= 0 || !form.source ? 0.5 : 1,
              }}
              className="px-6 py-2 rounded-lg font-semibold transition disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : editingId ? 'Update Entry' : 'Add Entry'}
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

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 && !showForm ? (
          <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-12 text-center">
            <p style={{ color: C.textMid }} className="text-sm">No income entries yet. Click "Add Income" to get started.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div
              key={entry.id}
              style={{ backgroundColor: C.bgCard, borderColor: C.border }}
              className="border rounded-lg p-4 hover:border-opacity-100 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${C.green}33`,
                      color: C.green,
                    }}
                  >
                    <TrendingUp size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.source}</p>
                    <p style={{ color: C.textMid }} className="text-xs">
                      {INCOME_TYPES.find(t => t.value === entry.income_type)?.label} • {new Date(entry.income_date).toLocaleDateString()}
                    </p>
                    {entry.notes && (
                      <p style={{ color: C.textDim }} className="text-xs mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg" style={{ color: C.green }}>
                    +{formatCurrency(entry.amount)}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(entry)}
                    style={{
                      backgroundColor: C.bgElevated,
                      borderColor: C.border,
                      color: C.gold,
                    }}
                    className="p-2 rounded-lg border transition hover:opacity-75"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    style={{
                      backgroundColor: C.bgElevated,
                      borderColor: C.border,
                      color: C.red,
                    }}
                    className="p-2 rounded-lg border transition hover:opacity-75"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
