'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { C } from '@/lib/constants';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/app/actions/portfolio';
import type { Database } from '@/lib/database.types';

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

const CATEGORIES = [
  'Food and Drink',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Housing',
  'Subscriptions',
  'Insurance',
  'Savings',
  'Salary',
  'Investment',
  'Other',
];

export default function ManualTransactionsForm({ userId }: { userId: string | null }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: 0, // negative for expenses, positive for income
    currency: 'SGD',
    merchant_name: '',
    category: 'Food and Drink',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    is_pending: false,
  });

  useEffect(() => {
    if (!userId) return;
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getTransactions(userId);
    setTransactions(data);
    setLoading(false);
  };

  const handleReset = () => {
    setForm({
      amount: 0,
      currency: 'SGD',
      merchant_name: '',
      category: 'Food and Drink',
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
      is_pending: false,
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!userId || form.amount === 0 || !form.merchant_name) return;

    setSaving(true);
    try {
      const baseData = {
        user_id: userId,
        amount: form.amount,
        currency: form.currency,
        merchant_name: form.merchant_name,
        category: form.category,
        category_detail: null,
        transaction_date: form.transaction_date,
        description: form.description || null,
        is_pending: form.is_pending,
        bank_account_id: null,
        plaid_transaction_id: null,
      };

      if (editingId) {
        const updated = await updateTransaction(editingId, userId, baseData);
        if (updated) {
          setTransactions(prev => prev.map(t => t.id === editingId ? updated : t));
          setShowForm(false);
          handleReset();
        }
      } else {
        const created = await createTransaction(baseData);
        if (created) {
          setTransactions(prev => [created, ...prev]);
          setShowForm(false);
          handleReset();
        }
      }
    } catch (err) {
      console.error('Error saving transaction:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setForm({
      amount: transaction.amount,
      currency: transaction.currency,
      merchant_name: transaction.merchant_name || '',
      category: transaction.category || 'Other',
      transaction_date: transaction.transaction_date,
      description: transaction.description || '',
      is_pending: transaction.is_pending,
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!userId || !confirm('Delete this transaction?')) return;
    const success = await deleteTransaction(id, userId);
    if (success) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SGD', minimumFractionDigits: 2 }).format(Math.abs(value));

  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - expenses;

  if (loading && userId) {
    return <div style={{ color: C.textMid }} className="text-center py-10 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold">Transaction Log</h2>
            <p style={{ color: C.textMid }} className="text-sm mt-1">Track and manage your manual income and expenses</p>
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
            {showForm ? 'Cancel' : 'Add Transaction'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Total Income</p>
            <p className="text-2xl font-bold" style={{ color: C.green }}>{formatCurrency(income)}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Total Expenses</p>
            <p className="text-2xl font-bold" style={{ color: C.red }}>{formatCurrency(expenses)}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Net</p>
            <p className="text-2xl font-bold" style={{ color: net >= 0 ? C.green : C.red }}>{formatCurrency(net)}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Total Transactions</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Type</label>
              <select
                value={form.amount >= 0 ? 'income' : 'expense'}
                onChange={(e) => {
                  const isIncome = e.target.value === 'income';
                  setForm({ ...form, amount: isIncome ? Math.abs(form.amount) : -Math.abs(form.amount) });
                }}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Amount (SGD) *</label>
              <input
                type="number"
                value={Math.abs(form.amount)}
                onChange={(e) => {
                  const abs = Math.abs(parseFloat(e.target.value) || 0);
                  setForm({ ...form, amount: form.amount < 0 ? -abs : abs });
                }}
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
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Merchant/Source *</label>
              <input
                type="text"
                value={form.merchant_name}
                onChange={(e) => setForm({ ...form, merchant_name: e.target.value })}
                placeholder={form.amount >= 0 ? 'e.g. Company XYZ' : 'e.g. Burger King'}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Transaction Date *</label>
              <input
                type="date"
                value={form.transaction_date}
                onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Status</label>
              <select
                value={form.is_pending ? 'pending' : 'completed'}
                onChange={(e) => setForm({ ...form, is_pending: e.target.value === 'pending' })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add any additional details..."
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
              disabled={saving || form.amount === 0 || !form.merchant_name}
              style={{
                backgroundColor: C.teal,
                color: '#000',
                opacity: saving || form.amount === 0 || !form.merchant_name ? 0.5 : 1,
              }}
              className="px-6 py-2 rounded-lg font-semibold transition disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : editingId ? 'Update Transaction' : 'Add Transaction'}
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

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.length === 0 && !showForm ? (
          <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-12 text-center">
            <p style={{ color: C.textMid }} className="text-sm">No transactions yet. Click "Add Transaction" to get started.</p>
          </div>
        ) : (
          transactions.map(txn => {
            const isIncome = txn.amount > 0;
            return (
              <div
                key={txn.id}
                style={{ backgroundColor: C.bgCard, borderColor: C.border }}
                className="border rounded-lg p-4 hover:border-opacity-100 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isIncome ? `${C.green}33` : `${C.red}33`,
                        color: isIncome ? C.green : C.red,
                      }}
                    >
                      {isIncome ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{txn.merchant_name}</p>
                      <p style={{ color: C.textMid }} className="text-xs">
                        {txn.category} • {new Date(txn.transaction_date).toLocaleDateString()}
                        {txn.is_pending && <span style={{ color: C.gold }} className="ml-2 font-semibold">Pending</span>}
                      </p>
                      {txn.description && (
                        <p style={{ color: C.textDim }} className="text-xs mt-1">{txn.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-bold text-lg"
                      style={{ color: isIncome ? C.green : C.red }}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(txn)}
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
                      onClick={() => handleDelete(txn.id)}
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
            );
          })
        )}
      </div>
    </div>
  );
}
