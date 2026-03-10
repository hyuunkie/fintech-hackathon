'use client';

import { useState, useEffect } from 'react';
import { C } from '@/lib/constants';
import { Plus, Edit2, Trash2, TrendingUp, Briefcase } from 'lucide-react';
import { getInvestmentAccounts, createInvestmentAccount, updateInvestmentAccount, deleteInvestmentAccount } from '@/app/actions/users';
import type { Database } from '@/lib/database.types';

type InvestmentAccount = Database["public"]["Tables"]["investment_accounts"]["Row"];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

const providerColor = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'webull':       return C.blue;
    case 'moomoo':       return C.green;
    case 'tiger':        return C.goldDim;
    case 'snaptrade':    return C.purple;
    default:             return C.textMid;
  }
};

export default function InvestmentAccountsCRUD({ userId }: { userId: string | null }) {
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    provider: 'webull',
    snaptrade_account_id: '',
    brokerage_name: '',
    account_name: '',
    account_type: 'individual' as 'individual' | 'joint' | 'retirement',
    total_value: 0,
    cash_balance: 0,
  });

  useEffect(() => {
    if (!userId) return;
    loadAccounts();
  }, [userId]);

  const loadAccounts = async () => {
    if (!userId) return;
    try {
      const data = await getInvestmentAccounts(userId);
      setAccounts(data || []);
    } catch (err) {
      console.error('Error loading investment accounts:', err);
      setMessage('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      provider: 'webull',
      snaptrade_account_id: '',
      brokerage_name: '',
      account_name: '',
      account_type: 'individual',
      total_value: 0,
      cash_balance: 0,
    });
    setEditingId(null);
  };

  const handleEdit = (account: InvestmentAccount) => {
    setForm({
      provider: account.provider || 'webull',
      snaptrade_account_id: account.snaptrade_account_id || '',
      brokerage_name: account.brokerage_name || '',
      account_name: account.account_name || '',
      account_type: (account.account_type || 'individual') as 'individual' | 'joint' | 'retirement',
      total_value: account.total_value ? Number(account.total_value) : 0,
      cash_balance: account.cash_balance ? Number(account.cash_balance) : 0,
    });
    setEditingId(account.id);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!userId || !form.account_name) {
      setMessage('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateInvestmentAccount(editingId, {
          provider: form.provider,
          snaptrade_account_id: form.snaptrade_account_id,
          brokerage_name: form.brokerage_name,
          account_name: form.account_name,
          account_type: form.account_type,
          total_value: form.total_value,
          cash_balance: form.cash_balance,
        });
        setMessage('Account updated');
      } else {
        await createInvestmentAccount(userId, {
          provider: form.provider,
          snaptrade_account_id: form.snaptrade_account_id,
          brokerage_name: form.brokerage_name,
          account_name: form.account_name,
          account_type: form.account_type,
          total_value: form.total_value,
          cash_balance: form.cash_balance,
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
      await deleteInvestmentAccount(id);
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

  if (loading) return <div style={{ color: C.textMid }}>Loading investment accounts...</div>;

  return (
    <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Briefcase size={24} style={{ color: C.purple }} />
          Investment Accounts
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
          <h3 className="font-semibold mb-4">{editingId ? 'Edit Account' : 'New Investment Account'}</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
              >
                <option value="webull">Webull</option>
                <option value="moomoo">Moomoo</option>
                <option value="tiger">Tiger Brokers</option>
                <option value="snaptrade">SnapTrade</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Brokerage Name</label>
              <input
                type="text"
                placeholder="Webull, Moomoo..."
                value={form.brokerage_name}
                onChange={(e) => setForm({ ...form, brokerage_name: e.target.value })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
              />
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Account Name</label>
              <input
                type="text"
                placeholder="My Trading Account..."
                value={form.account_name}
                onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
                required
              />
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Account Type</label>
              <select
                value={form.account_type}
                onChange={(e) => setForm({ ...form, account_type: e.target.value as any })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
              >
                <option value="individual">Individual</option>
                <option value="joint">Joint</option>
                <option value="retirement">Retirement</option>
              </select>
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Total Portfolio Value (USD)</label>
              <input
                type="number"
                step="0.01"
                value={form.total_value}
                onChange={(e) => setForm({ ...form, total_value: parseFloat(e.target.value) || 0 })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full px-3 py-2 rounded border text-sm"
              />
            </div>
            <div>
              <label style={{ color: C.textMid }} className="block text-sm mb-1">Cash Balance (USD)</label>
              <input
                type="number"
                step="0.01"
                value={form.cash_balance}
                onChange={(e) => setForm({ ...form, cash_balance: parseFloat(e.target.value) || 0 })}
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
          <p style={{ color: C.textMid }}>No investment accounts yet. Add one to get started.</p>
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
                    style={{ backgroundColor: providerColor(account.provider || '') }}
                    className="w-10 h-10 rounded flex items-center justify-center text-white text-xs font-bold"
                  >
                    {(account.provider || 'broker')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{account.account_name}</h3>
                    <p style={{ color: C.textMid }} className="text-sm">
                      {account.brokerage_name} • {account.account_type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right mr-4">
                <p className="font-semibold">{formatCurrency(Number(account.total_value || 0))}</p>
                <p style={{ color: C.textMid }} className="text-sm flex items-center justify-end gap-1">
                  <TrendingUp size={14} /> Cash: {formatCurrency(Number(account.cash_balance || 0))}
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
