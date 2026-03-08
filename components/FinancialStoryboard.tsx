'use client';

import { useState, useMemo, useEffect } from 'react';
import { C, OVER_TIME } from '@/lib/constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, X } from 'lucide-react';
import { getTotalPortfolioValue } from '@/app/actions/portfolio';

interface FinancialEvent {
  id: string;
  month: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  estimatedImpact: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

export default function FinancialStoryboard({ userId }: { userId: string | null }) {
  const [currentNetWorth, setCurrentNetWorth] = useState<number | null>(null);
  const [events, setEvents] = useState<FinancialEvent[]>([
    { id: '1', month: 'Sep', title: 'Bonus Received', description: 'Year-end performance bonus', type: 'positive', estimatedImpact: 15000 },
    { id: '2', month: 'Dec', title: 'Property Investment', description: 'Purchased additional investment property', type: 'positive', estimatedImpact: 25000 },
    { id: '3', month: 'Feb', title: 'Crypto Volatility', description: 'Digital assets experienced market correction', type: 'negative', estimatedImpact: -8000 },
  ]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<FinancialEvent, 'id'>>({
    month: '', title: '', description: '', type: 'neutral', estimatedImpact: 0,
  });

  useEffect(() => {
    if (!userId) return;
    getTotalPortfolioValue(userId).then(setCurrentNetWorth);
  }, [userId]);

  const lastHistorical = OVER_TIME[OVER_TIME.length - 1];
  const historicalTotal = lastHistorical.Cash + lastHistorical.Equities + lastHistorical.Trust + lastHistorical.Digital + lastHistorical.Property;
  const displayedTotal = currentNetWorth ?? historicalTotal;

  const projectedData = useMemo(() => {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    let last = displayedTotal;
    return months.map(month => { last += 25000; return { month, projected: last, isProjection: true }; });
  }, [displayedTotal]);

  const combinedData = useMemo(() => {
    const historical = OVER_TIME.map(item => ({
      month: item.month,
      actual: item.Cash + item.Equities + item.Trust + item.Digital + item.Property,
      isProjection: false,
    }));
    return [...historical, ...projectedData];
  }, [projectedData]);

  const handleAddEvent = () => {
    if (!newEvent.month || !newEvent.title) return;
    setEvents(prev => [...prev, { ...newEvent, id: Date.now().toString() }]);
    setNewEvent({ month: '', title: '', description: '', type: 'neutral', estimatedImpact: 0 });
    setShowAddEvent(false);
  };

  const getEventColor = (type: string) =>
    type === 'positive' ? C.green : type === 'negative' ? C.red : C.gold;

  return (
    <div className="space-y-8">
      {/* Net Worth Projection */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">Financial Storyboard</h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">Your projected net worth journey and financial milestones</p>

        <div className="mb-8 -mx-8 px-8 py-4 overflow-x-auto" style={{ backgroundColor: C.bgElevated }}>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.gold} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" stroke={C.textDim} style={{ fontSize: '12px' }} />
              <YAxis stroke={C.textDim} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text }}
                formatter={v => formatCurrency(v as number)} />
              <Area type="monotone" dataKey="actual" stroke={C.teal} fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" dataKey="projected" stroke={C.gold} fillOpacity={1} fill="url(#colorProjected)" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-6 justify-center text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: C.teal }} /><span>Historical Data</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: C.gold }} /><span>Projected Growth</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t" style={{ borderColor: C.border }}>
          <div>
            <p style={{ color: C.textMid }} className="text-sm mb-2">Current Net Worth</p>
            <p className="text-2xl font-bold">{formatCurrency(displayedTotal)}</p>
          </div>
          <div>
            <p style={{ color: C.textMid }} className="text-sm mb-2">Projected (12 months)</p>
            <p className="text-2xl font-bold" style={{ color: C.gold }}>
              {formatCurrency(projectedData[projectedData.length - 1]?.projected ?? 0)}
            </p>
          </div>
          <div>
            <p style={{ color: C.textMid }} className="text-sm mb-2">Expected Growth</p>
            <p className="text-2xl font-bold" style={{ color: C.green }}>+$300K (12%)</p>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold">Financial Events & Milestones</h3>
          <button onClick={() => setShowAddEvent(!showAddEvent)}
            style={{ backgroundColor: C.gold, color: '#000' }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition text-sm">
            <Plus size={18} /> Add Event
          </button>
        </div>

        {showAddEvent && (
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {([['Month', 'month', 'e.g., Apr'], ['Title', 'title', 'Event title']] as const).map(([label, key, placeholder]) => (
                <div key={key}>
                  <label style={{ color: C.textMid }} className="text-xs block mb-2">{label}</label>
                  <input type="text" placeholder={placeholder} value={(newEvent as any)[key]}
                    onChange={e => setNewEvent({ ...newEvent, [key]: e.target.value })}
                    style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label style={{ color: C.textMid }} className="text-xs block mb-2">Description</label>
              <input type="text" placeholder="Describe the event" value={newEvent.description}
                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ color: C.textMid }} className="text-xs block mb-2">Type</label>
                <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <div>
                <label style={{ color: C.textMid }} className="text-xs block mb-2">Estimated Impact</label>
                <input type="number" placeholder="Amount" value={newEvent.estimatedImpact}
                  onChange={e => setNewEvent({ ...newEvent, estimatedImpact: parseInt(e.target.value) })}
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddEvent} style={{ backgroundColor: C.green, color: '#000' }}
                className="px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition text-sm">Add Event</button>
              <button onClick={() => setShowAddEvent(false)} style={{ borderColor: C.border }}
                className="px-4 py-2 border rounded-lg font-semibold hover:opacity-80 transition text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {events.length === 0 ? (
            <p style={{ color: C.textDim }} className="text-center py-8 text-sm">No financial events recorded yet.</p>
          ) : events.map(event => (
            <div key={event.id}
              style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight, borderLeftColor: getEventColor(event.type), borderLeftWidth: '4px' }}
              className="border rounded-lg p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2 py-1 rounded text-xs font-semibold"
                    style={{ backgroundColor: `${getEventColor(event.type)}40`, color: getEventColor(event.type) }}>
                    {event.month}
                  </span>
                  <p className="font-semibold">{event.title}</p>
                </div>
                <p style={{ color: C.textMid }} className="text-sm">{event.description}</p>
                <p className="text-xs mt-2 font-semibold" style={{ color: getEventColor(event.type) }}>
                  {event.type === 'positive' && '+'}{formatCurrency(event.estimatedImpact)}
                </p>
              </div>
              <button onClick={() => setEvents(prev => prev.filter(e => e.id !== event.id))}
                className="p-2 hover:opacity-50 transition" style={{ color: C.textDim }}>
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['positive', 'negative'] as const).map(type => (
          <div key={type} style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-6">
            <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold mb-4">
              {type === 'positive' ? 'Positive' : 'Negative'} Events
            </h4>
            <div className="space-y-2">
              {events.filter(e => e.type === type).map(e => (
                <div key={e.id} className="flex justify-between text-sm">
                  <span>{e.title}</span>
                  <span style={{ color: type === 'positive' ? C.green : C.red }} className="font-semibold">
                    {type === 'positive' ? '+' : ''}{formatCurrency(e.estimatedImpact)}
                  </span>
                </div>
              ))}
              {events.filter(e => e.type === type).length === 0 && (
                <p style={{ color: C.textDim }} className="text-sm">No {type} events recorded</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
