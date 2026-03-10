'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Zap, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { C } from '@/lib/constants';
import { getFinancialEvents, createFinancialEvent, updateFinancialEvent, deleteFinancialEvent } from '@/app/actions/events';
import type { FinancialEvent } from '@/app/actions/events';

const EVENT_TYPES = [
  { value: 'job_change', label: 'Job Change', icon: '💼' },
  { value: 'promotion', label: 'Promotion', icon: '📈' },
  { value: 'bonus', label: 'Bonus Received', icon: '💰' },
  { value: 'investment_purchase', label: 'Investment Purchase', icon: '📊' },
  { value: 'debt_payoff', label: 'Debt Payoff', icon: '✅' },
  { value: 'expense_event', label: 'Major Expense', icon: '💸' },
  { value: 'life_event', label: 'Life Event', icon: '🎉' },
  { value: 'other', label: 'Other', icon: '📝' }
];

export default function FinancialEventsTracker({ userId }: { userId: string | null }) {
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    event_type: 'other',
    title: '',
    description: '',
    impact_amount: 0,
    event_date: new Date().toISOString().split('T')[0],
    tags: [] as string[],
  });

  useEffect(() => {
    if (!userId) return;
    loadEvents();
  }, [userId]);

  const loadEvents = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getFinancialEvents(userId);
    setEvents(data);
    setLoading(false);
  };

  const handleReset = () => {
    setForm({
      event_type: 'other',
      title: '',
      description: '',
      impact_amount: 0,
      event_date: new Date().toISOString().split('T')[0],
      tags: [],
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!userId || !form.title) return;

    setSaving(true);
    try {
      const baseData = {
        user_id: userId,
        event_type: form.event_type,
        title: form.title,
        description: form.description || undefined,
        impact_amount: form.impact_amount || undefined,
        event_date: form.event_date,
        tags: form.tags,
      };

      if (editingId) {
        const updated = await updateFinancialEvent(editingId, userId, baseData);
        if (updated) {
          setEvents(prev => prev.map(e => e.id === editingId ? updated : e));
          setShowForm(false);
          handleReset();
        }
      } else {
        const created = await createFinancialEvent(baseData);
        if (created) {
          setEvents(prev => [created, ...prev]);
          setShowForm(false);
          handleReset();
        }
      }
    } catch (err) {
      console.error('Error saving event:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: FinancialEvent) => {
    setForm({
      event_type: event.event_type,
      title: event.title,
      description: event.description || '',
      impact_amount: event.impact_amount || 0,
      event_date: event.event_date,
      tags: event.tags || [],
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!userId || !confirm('Delete this event?')) return;
    const success = await deleteFinancialEvent(id, userId);
    if (success) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleToggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SGD', minimumFractionDigits: 2 }).format(Math.abs(value));

  const positiveImpact = events.filter(e => (e.impact_amount || 0) > 0).reduce((sum, e) => sum + (e.impact_amount || 0), 0);
  const negativeImpact = Math.abs(events.filter(e => (e.impact_amount || 0) < 0).reduce((sum, e) => sum + (e.impact_amount || 0), 0));

  if (loading && userId) {
    return <div style={{ color: C.textMid }} className="text-center py-10 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold">Financial Events</h2>
            <p style={{ color: C.textMid }} className="text-sm mt-1">Track major financial milestones and events</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) handleReset(); }}
            style={{
              backgroundColor: showForm ? C.red : C.purple,
              color: showForm ? C.text : '#000',
            }}
            className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition hover:opacity-90"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Add Event'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Total Events</p>
            <p className="text-2xl font-bold">{events.length}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Positive Impact</p>
            <p className="text-2xl font-bold" style={{ color: C.green }}>{formatCurrency(positiveImpact)}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Negative Impact</p>
            <p className="text-2xl font-bold" style={{ color: C.red }}>{formatCurrency(negativeImpact)}</p>
          </div>
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
            <p style={{ color: C.textMid }} className="text-xs mb-1">Net Impact</p>
            <p className="text-2xl font-bold" style={{ color: positiveImpact - negativeImpact >= 0 ? C.green : C.red }}>
              {formatCurrency(positiveImpact - negativeImpact)}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Event' : 'Add Financial Event'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Event Type *</label>
              <select
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              >
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event title"
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Financial Impact (SGD)</label>
              <input
                type="number"
                value={form.impact_amount}
                onChange={(e) => setForm({ ...form, impact_amount: parseFloat(e.target.value) || 0 })}
                placeholder="Positive or negative amount"
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
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Date *</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              />
            </div>

            <div className="md:col-span-2">
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add details about this event..."
                rows={2}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label style={{ color: C.textMid }} className="text-sm font-semibold block mb-3">Tags</label>
              <div className="flex flex-wrap gap-2">
                {['important', 'completed', 'planned'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    style={{
                      backgroundColor: form.tags.includes(tag) ? C.teal : C.bgElevated,
                      borderColor: C.border,
                      color: form.tags.includes(tag) ? '#000' : C.text,
                    }}
                    className="px-3 py-1.5 rounded-lg border font-semibold text-sm transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving || !form.title}
              style={{
                backgroundColor: C.purple,
                color: '#000',
                opacity: saving || !form.title ? 0.5 : 1,
              }}
              className="px-6 py-2 rounded-lg font-semibold transition disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : editingId ? 'Update Event' : 'Add Event'}
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

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 && !showForm ? (
          <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-12 text-center">
            <p style={{ color: C.textMid }} className="text-sm">No financial events yet. Click "Add Event" to get started.</p>
          </div>
        ) : (
          events.map(event => {
            const eventType = EVENT_TYPES.find(t => t.value === event.event_type);
            return (
              <div
                key={event.id}
                style={{ backgroundColor: C.bgCard, borderColor: C.border }}
                className="border rounded-lg p-4 hover:border-opacity-100 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl flex-shrink-0 mt-1">
                      {eventType?.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{event.title}</p>
                      <p style={{ color: C.textMid }} className="text-sm">
                        {eventType?.label} • {new Date(event.event_date).toLocaleDateString()}
                      </p>
                      {event.description && (
                        <p style={{ color: C.textDim }} className="text-sm mt-2">{event.description}</p>
                      )}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {event.tags.map(tag => (
                            <span
                              key={tag}
                              style={{
                                backgroundColor: C.bgElevated,
                                borderColor: C.border,
                                color: C.teal,
                              }}
                              className="px-2 py-1 rounded text-xs border font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {event.impact_amount !== undefined && event.impact_amount !== null && event.impact_amount !== 0 && (
                      <p
                        className="font-bold text-lg"
                        style={{ color: event.impact_amount > 0 ? C.green : C.red }}
                      >
                        {event.impact_amount > 0 ? '+' : '-'}{formatCurrency(event.impact_amount)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(event)}
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
                      onClick={() => handleDelete(event.id)}
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
