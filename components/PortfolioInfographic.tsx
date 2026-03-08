'use client';

import { useEffect, useState } from 'react';
import { C } from '@/lib/constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getPortfolioBreakdown, getTotalPortfolioValue } from '@/app/actions/portfolio';
import type { PortfolioBreakdownItem } from '@/app/actions/portfolio';

const ASSET_COLORS: Record<string, string> = {
  cash: C.blue, equities: C.teal, unit_trust: C.green,
  crypto: C.gold, digital: C.gold, property: C.purple, other: C.textMid,
};

const RISK_MAP: Record<string, 'Low Risk' | 'Medium Risk' | 'High Risk'> = {
  cash: 'Low Risk', unit_trust: 'Low Risk',
  property: 'Medium Risk',
  equities: 'High Risk', crypto: 'High Risk', digital: 'High Risk', other: 'High Risk',
};

export default function PortfolioInfographic({ userId }: { userId: string | null }) {
  const [breakdown, setBreakdown] = useState<PortfolioBreakdownItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([getPortfolioBreakdown(userId), getTotalPortfolioValue(userId)]).then(
      ([bd, tot]) => { setBreakdown(bd); setTotal(tot); setLoading(false); }
    );
  }, [userId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  const pieData = breakdown.map(item => ({
    name: item.label, value: item.value, color: ASSET_COLORS[item.type] ?? C.textMid,
  }));

  const riskBuckets = breakdown.reduce<Record<string, { value: number; assets: string[] }>>(
    (acc, item) => {
      const risk = RISK_MAP[item.type] ?? 'High Risk';
      if (!acc[risk]) acc[risk] = { value: 0, assets: [] };
      acc[risk].value += item.value;
      acc[risk].assets.push(item.label);
      return acc;
    }, {}
  );
  const riskAnalysis = ['Low Risk', 'Medium Risk', 'High Risk']
    .filter(r => riskBuckets[r])
    .map(r => ({ category: r, ...riskBuckets[r] }));

  if (loading && userId) {
    return <div style={{ color: C.textMid }} className="text-center py-20 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Portfolio Composition Pie */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">Portfolio Composition</h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">Asset allocation across your investment portfolio</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="50%" outerRadius={120} dataKey="value"
                  labelLine={{ stroke: C.borderLight }}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.55;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill={C.text} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
                        {name}: {total > 0 ? ((value / total) * 100).toFixed(0) : 0}%
                      </text>
                    );
                  }}
                >
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: '8px', color: C.text }}
                  itemStyle={{ color: C.text }} labelStyle={{ color: C.textMid }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {breakdown.map((asset, idx) => (
              <div key={idx} style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4 hover:opacity-75 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: ASSET_COLORS[asset.type] ?? C.textMid }} />
                    <div className="flex-1">
                      <p className="font-semibold">{asset.label}</p>
                      <p style={{ color: C.textMid }} className="text-xs">{asset.source}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{total > 0 ? ((asset.value / total) * 100).toFixed(1) : 0}%</p>
                    <p style={{ color: C.textMid }} className="text-xs">{formatCurrency(asset.value)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">Risk Distribution</h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">How your portfolio is distributed across risk levels</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {riskAnalysis.map((risk, idx) => {
            const riskColors = [C.green, C.gold, C.red];
            return (
              <div key={idx} style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: riskColors[idx] }} />
                  <h3 className="font-semibold">{risk.category}</h3>
                </div>
                <p className="text-3xl font-bold mb-2">{total > 0 ? ((risk.value / total) * 100).toFixed(1) : 0}%</p>
                <p style={{ color: C.textMid }} className="text-sm">{formatCurrency(risk.value)}</p>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                  <p style={{ color: C.textMid }} className="text-xs">{risk.assets.join(', ')}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full h-12 rounded-lg overflow-hidden flex" style={{ backgroundColor: C.bgElevated }}>
          {riskAnalysis.map((risk, idx) => {
            const colors = [C.green, C.gold, C.red];
            return (
              <div key={idx} className="h-full transition-opacity hover:opacity-75"
                style={{ width: `${total > 0 ? (risk.value / total) * 100 : 0}%`, backgroundColor: colors[idx] }}
                title={`${risk.category}: ${total > 0 ? ((risk.value / total) * 100).toFixed(1) : 0}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Top Holdings */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">Top Holdings</h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">Your largest asset positions</p>
        <div>
          {breakdown.slice(0, 5).map((asset, idx) => {
            const pct = total > 0 ? (asset.value / total) * 100 : 0;
            return (
              <div key={idx} style={{ borderBottomColor: C.border }} className="py-4 border-b last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[asset.type] ?? C.textMid }} />
                    <span className="font-semibold">{asset.label}</span>
                  </div>
                  <span style={{ color: C.gold }} className="font-bold">{pct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                  <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: ASSET_COLORS[asset.type] ?? C.textMid }} />
                </div>
                <p style={{ color: C.textMid }} className="text-xs mt-2">{formatCurrency(asset.value)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
