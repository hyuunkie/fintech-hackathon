'use client';

import { useState, useEffect } from 'react';
import { C } from '@/lib/constants';
import { Plus, X, Target, Car, Plane, Home, BookOpen, Umbrella } from 'lucide-react';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '@/app/actions/goals';
import type { Database } from '@/lib/database.types';

type Milestone = Database["public"]["Tables"]["milestones"]["Row"];

const getCategoryIcon = (type: string) => {
  const s = { size: 22 };
  switch (type) {
    case 'vehicle':    return <Car      {...s} style={{ color: C.blue }}   />;
    case 'travel':     return <Plane    {...s} style={{ color: C.teal }}   />;
    case 'home':       return <Home     {...s} style={{ color: C.green }}  />;
    case 'education':  return <BookOpen {...s} style={{ color: C.purple }} />;
    case 'retirement': return <Umbrella {...s} style={{ color: C.gold }}   />;
    default:           return <Target   {...s} style={{ color: C.blue }}   />;
  }
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

const calcDaysLeft = (date: string | null) => {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function MilestonePlanner({ userId }: { userId: string | null }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', milestone_type: 'other', target_amount: 0,
    current_amount: 0, target_date: '', notes: '',
  });

  useEffect(() => {
    if (!userId) return;
    getMilestones(userId).then(data => { setMilestones(data); setLoading(false); });
  }, [userId]);

  const handleAdd = async () => {
    if (!userId || !form.title || form.target_amount <= 0) return;
    setSaving(true);
    const created = await createMilestone({
      user_id: userId,
      title: form.title,
      milestone_type: form.milestone_type,
      target_amount: form.target_amount,
      current_amount: form.current_amount,
      target_date: form.target_date || null,
      notes: form.notes || null,
      monthly_savings: null, projected_date: null, on_track: null, is_complete: false,
    });
    setMilestones(prev => [...prev, created]);
    setForm({ title: '', milestone_type: 'other', target_amount: 0, current_amount: 0, target_date: '', notes: '' });
    setShowAdd(false);
    setSaving(false);
  };

  const handleUpdateAmount = async (id: string, current_amount: number) => {
    if (!userId) return;
    const updated = await updateMilestone(id, userId, { current_amount });
    if (updated) setMilestones(prev => prev.map(m => m.id === id ? updated : m));
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    await deleteMilestone(id, userId);
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const active = milestones.filter(m => !m.is_complete);
  const totalTarget = active.reduce((s, m) => s + (m.target_amount ?? 0), 0);
  const totalCurrent = active.reduce((s, m) => s + m.current_amount, 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  if (loading && userId) {
    return <div style={{ color: C.textMid }} className="text-center py-20 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">Milestone Planner</h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">Plan and track your financial goals and milestones</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Active Milestones', value: active.length.toString() },
            { label: 'Total Target', value: formatCurrency(totalTarget) },
            { label: 'Saved', value: formatCurrency(totalCurrent), color: C.green },
            { label: 'Remaining', value: formatCurrency(totalTarget - totalCurrent), color: C.gold },
            { label: 'Progress', value: `${overallProgress.toFixed(0)}%` },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
              <p style={{ color: C.textMid }} className="text-xs mb-2">{label}</p>
              <p className="text-2xl font-bold" style={color ? { color } : {}}>{value}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-end justify-between mb-2">
            <p className="font-semibold">Overall Progress</p>
            <p style={{ color: C.textMid }} className="text-sm">{formatCurrency(totalCurrent)} / {formatCurrency(totalTarget)}</p>
          </div>
          <div className="h-4 rounded-lg overflow-hidden" style={{ backgroundColor: C.bgElevated }}>
            <div className="h-full transition-all duration-500"
              style={{ width: `${overallProgress}%`, backgroundColor: overallProgress >= 75 ? C.green : C.gold }} />
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ backgroundColor: C.blue, color: '#000' }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition">
          <Plus size={20} /> Add Milestone
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Create New Milestone</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[
              { label: 'Milestone Name', key: 'title', type: 'text', placeholder: 'e.g., Dream Vacation' },
              { label: 'Target Amount', key: 'target_amount', type: 'number', placeholder: '0' },
              { label: 'Current Amount', key: 'current_amount', type: 'number', placeholder: '0' },
              { label: 'Target Date', key: 'target_date', type: 'date', placeholder: '' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">{label}</label>
                <input type={type} placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.border, color: C.text }}
                  className="w-full border rounded-lg px-4 py-2" />
              </div>
            ))}
            <div>
              <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">Category</label>
              <select value={form.milestone_type} onChange={e => setForm({ ...form, milestone_type: e.target.value })}
                style={{ backgroundColor: C.bgElevated, borderColor: C.border, color: C.text }}
                className="w-full border rounded-lg px-4 py-2">
                {['other', 'vehicle', 'travel', 'home', 'education', 'retirement', 'emergency_fund'].map(v => (
                  <option key={v} value={v}>{v.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">Notes</label>
              <input type="text" placeholder="Optional notes" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                style={{ backgroundColor: C.bgElevated, borderColor: C.border, color: C.text }}
                className="w-full border rounded-lg px-4 py-2" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving}
              style={{ backgroundColor: C.green, color: '#000' }}
              className="px-6 py-2 rounded-lg font-semibold hover:opacity-80 transition disabled:opacity-50">
              {saving ? 'Saving…' : 'Create Milestone'}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ borderColor: C.border }}
              className="px-6 py-2 border rounded-lg font-semibold hover:opacity-80 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-12 text-center">
            <Target size={48} style={{ color: C.textDim, margin: '0 auto 1rem' }} />
            <p style={{ color: C.textMid }} className="text-lg">No milestones yet. Create your first goal!</p>
          </div>
        ) : (
          milestones.map(m => {
            const progress = m.target_amount ? (m.current_amount / m.target_amount) * 100 : 0;
            const daysLeft = calcDaysLeft(m.target_date);
            const monthlyNeeded = m.target_date && m.target_amount
              ? Math.max(m.target_amount - m.current_amount, 0) / Math.max(calcDaysLeft(m.target_date)! / 30, 0.1)
              : null;

            return (
              <div key={m.id} style={{ backgroundColor: C.bgCard, borderColor: m.is_complete ? C.green : C.border }}
                className="border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg" style={{ backgroundColor: C.bgElevated }}>
                      {getCategoryIcon(m.milestone_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold">{m.title}</h4>
                        {m.is_complete && (
                          <span className="px-2 py-1 rounded text-xs font-semibold"
                            style={{ backgroundColor: `${C.green}30`, color: C.green }}>Complete</span>
                        )}
                        {m.on_track === false && !m.is_complete && (
                          <span className="px-2 py-1 rounded text-xs font-semibold"
                            style={{ backgroundColor: `${C.red}30`, color: C.red }}>Behind</span>
                        )}
                      </div>
                      <p style={{ color: C.textMid }} className="text-sm">
                        {formatCurrency(m.current_amount)} / {formatCurrency(m.target_amount ?? 0)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(m.id)} className="p-2 hover:opacity-50 transition" style={{ color: C.textDim }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: C.bgElevated }}>
                    <div className="h-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: m.is_complete ? C.green : C.gold }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p style={{ color: C.textDim }} className="text-xs mb-1">Progress</p>
                    <p className="font-bold">{progress.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p style={{ color: C.textDim }} className="text-xs mb-1">Days Left</p>
                    <p className="font-bold" style={{ color: daysLeft === null ? C.textMid : daysLeft < 60 ? C.red : daysLeft < 180 ? C.gold : C.green }}>
                      {daysLeft === null ? '—' : daysLeft > 0 ? daysLeft : 'Overdue'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: C.textDim }} className="text-xs mb-1">Monthly Needed</p>
                    <p className="font-bold">{monthlyNeeded !== null ? formatCurrency(monthlyNeeded) : '—'}</p>
                  </div>
                  <div>
                    <p style={{ color: C.textDim }} className="text-xs mb-1">Still Need</p>
                    <p className="font-bold" style={{ color: C.gold }}>
                      {formatCurrency(Math.max((m.target_amount ?? 0) - m.current_amount, 0))}
                    </p>
                  </div>
                </div>

                {!m.is_complete && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                    <label style={{ color: C.textMid }} className="text-xs block mb-2">Update Progress</label>
                    <div className="flex gap-2">
                      <input type="range" min="0" max={m.target_amount ?? 100} step="100" value={m.current_amount}
                        onChange={e => handleUpdateAmount(m.id, parseFloat(e.target.value))}
                        className="flex-1"
                        style={{ accentColor: progress >= 75 ? C.green : progress >= 40 ? C.gold : C.red }} />
                      <input type="number" value={m.current_amount}
                        onChange={e => handleUpdateAmount(m.id, parseFloat(e.target.value))}
                        style={{ backgroundColor: C.bgElevated, borderColor: C.border, color: C.text }}
                        className="w-24 border rounded px-2 py-1 text-sm" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Tips */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-4">Smart Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p className="font-semibold mb-2">Break Down Large Goals</p>
            <p style={{ color: C.textMid }} className="text-sm">Divide big financial goals into smaller monthly targets to make them more achievable.</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p className="font-semibold mb-2">Automate Your Savings</p>
            <p style={{ color: C.textMid }} className="text-sm">Set up automatic transfers to a dedicated savings account for each milestone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
