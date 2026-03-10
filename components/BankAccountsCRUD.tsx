'use client';

import { useState, useEffect } from 'react';
import { C } from '@/lib/constants';
import { Plus, Edit2, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } from '@/app/actions/users';
import type { Database } from '@/lib/database.types';

type BankAccount = Database["public"]["Tables"]["bank_accounts"]["Row"];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SGD', minimumFractionDigits: 2 }).format(v);

const accountTypeColor = (type: string) => {
  switch (type) {
    case 'checking':   return C.blue;
    case 'savings':    return C.green;
    case 'credit':     return C.red;
    default:           return C.textMid;
  }
};

export default function BankAccountsCRUD({ userId }: { userId: string | null }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    plaid_item_id: '',
    plaid_account_id: '',
    institution_name: '',
    account_name: '',
    account_type: 'checking' as 'checking' | 'savings' | 'credit',
    account_subtype: '',
    current_balance: 0,
    available_balance: 0,
  });

  useEffect(() => {
    if (!userId) return;
    loadAccounts();
  }, [userId]);

  const loadAccounts = async () => {
    if (!userId) return;
    try {
      const data = await getBankAccounts(userId);
      setAccounts(data || []);
    } catch (err) {
      console.error('Error loading bank accounts:', err);
      setMessage('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      plaid_item_id: '',
      plaid_account_id: '',
      institution_name: '',
      account_name: '',
      account_type: 'checking',
      account_subtype: '',
      current_balance: 0,
      available_balance: 0,
    });
    setEditingId(null);
  };

  const handleEdit = (account: BankAccount) => {
    setForm({
      plaid_item_id: account.plaid_item_id || '',
      plaid_account_id: account.plaid_account_id || '',
      institution_name: account.institution_name || '',
      account_name: account.account_name || '',
      account_type: (account.account_type || 'checking') as 'checking' | 'savings' | 'credit',
      account_subtype: account.account_subtype || '',
      current_balance: account.current_balance ? Number(account.current_balance) : 0,
      available_balance: account.available_balance ? Number(account.available_balance) : 0,
    });
    setEditingId(account.id);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!userId || !form.plaid_account_id || !form.account_name) {
      setMessage('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateBankAccount(editingId, {
          institution_name: form.institution_name,
          account_name: form.account_name,
          account_type: form.account_type,
          account_subtype: form.account_subtype,
          current_balance: form.current_balance,
          available_balance: form.available_balance,
        });
        setMessage('Account updated');
      } else {
        await createBankAccount(userId, {
          plaid_item_id: form.plaid_item_id,
          plaid_account_id: form.plaid_account_id,
          institution_name: form.institution_name,
          account_name: form.account_name,
          account_type: form.account_type,
          account_subtype: form.account_subtype,
          current_balance: form.current_balance,
          available_balance: form.available_balance,
        });
        setMessage('Account created');
      }

      await loadAccounts();
      resetForm();
      setShowAdd(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving account:', err);
      setMessage('Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this account?')) return;
    setDeletingId(id);
    try {
      await deleteBankAccount(id);
      await loadAccounts();
      setMessage('Account deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting account:', err);
      setMessage('Failed to delete account');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div style={{ color: C.textMid }}>Loading bank accounts...</div>;

  return (
    <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <DollarSign size={24} style={{ color: C.blue }} />
          Bank Accounts
        </h2>
        <button
          onClick={() => { resetForm(); setShowAdd(!showAdd); }}
          style={{ backgroundColor: C.gold, color: '#000' }}
          className="px-4 py-2 rounded-lg font-medium hover:opacity-80 flex items-center gap-2"
        >
          <Plus size={18} /> Add Account
        </button>
      </div>

      {message && (
        <div style={{ backgroundColor: C.blue, color: '#fff' }} className="p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {showAdd && (
        <div style={{ backgroundColor: C.bgElevated, borderColor: C.border }} className="border rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4">{editingId ? 'Edit Account' : 'New Bank Account'}</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Institution</label>
              <input
                type="text"
                placeholder="DBS, OCBC, UOB..."
                value={form.institution_name}
                onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
              />
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Account Name</label>
              <input
                type="text"
                placeholder="My Savings..."
                value={form.account_name}
                onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
                required
              />
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Type</label>
              <select
                value={form.account_type}
                onChange={(e) => setForm({ ...form, account_type: e.target.value as any })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Plaid Account ID</label>
              <input
                type="text"
                placeholder="plaid_..."
                value={form.plaid_account_id}
                onChange={(e) => setForm({ ...form, plaid_account_id: e.target.value })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
                required
              />
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Current Balance</label>
              <input
                type="number"
                step="0.01"
                value={form.current_balance}
                onChange={(e) => setForm({ ...form, current_balance: parseFloat(e.target.value) || 0 })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
              />
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Available Balance</label>
              <input
                type="number"
                step="0.01"
                value={form.available_balance}
                onChange={(e) => setForm({ ...form, available_balance: parseFloat(e.target.value) || 0 })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: C.green, color: '#fff' }}
              className="px-4 py-2 rounded font-medium hover:opacity-80 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => { resetForm(); setShowAdd(false); }}
              style={{ backgroundColor: C.textMid, color: C.bg }}
              className="px-4 py-2 rounded font-medium hover:opacity-80"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {accounts.length === 0 ? (
          <p style={{ color: C.textMid }}>No bank accounts yet. Add one to get started.</p>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              style={{ backgroundColor: C.bgElevated, borderColor: C.border }}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: accountTypeColor(account.account_type || '') }}
                    className="w-10 h-10 rounded flex items-center justify-center text-white text-sm font-bold"
                  >
                    {(account.account_type || 'bank')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{account.account_name}</h3>
                    <p style={{ color: C.textMid }} className="text-sm">
                      {account.institution_name} • {account.account_type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right mr-4">
                <p className="font-semibold">{formatCurrency(Number(account.current_balance || 0))}</p>
                <p style={{ color: C.textMid }} className="text-sm flex items-center justify-end gap-1">
                  <TrendingUp size={14} /> Available: {formatCurrency(Number(account.available_balance || 0))}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(account)}
                  style={{ color: C.blue, borderColor: C.blue }}
                  className="p-2 rounded border hover:opacity-75"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  disabled={deletingId === account.id}
                  style={{ color: C.red, borderColor: C.red }}
                  className="p-2 rounded border hover:opacity-75 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
