'use client';

import { useEffect, useState } from 'react';
import { C, OVER_TIME } from '@/lib/constants';
import { TrendingUp, ArrowUp, ArrowDown, BarChart2, Target } from 'lucide-react';
import { getPortfolioBreakdown, getTotalPortfolioValue, getLatestWellnessScore } from '@/app/actions/portfolio';
import type { PortfolioBreakdownItem } from '@/app/actions/portfolio';

const ASSET_COLORS: Record<string, string> = {
  cash: C.blue, equities: C.teal, unit_trust: C.green,
  crypto: C.gold, digital: C.gold, property: C.purple, other: C.textMid,
};

const previousTotal = OVER_TIME[OVER_TIME.length - 2];
const prevSum = previousTotal.Cash + previousTotal.Equities + previousTotal.Trust + previousTotal.Digital + previousTotal.Property;

export default function FinancialSummary({ userId }: { userId: string | null }) {
  const [breakdown, setBreakdown] = useState<PortfolioBreakdownItem[]>([]);
  const [total, setTotal] = useState(0);
  const [savingsRate, setSavingsRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getPortfolioBreakdown(userId),
      getTotalPortfolioValue(userId),
      getLatestWellnessScore(userId),
    ]).then(([bd, tot, wellness]) => {
      setBreakdown(bd);
      setTotal(tot);
      setSavingsRate(wellness?.savings_rate_pct ?? null);
      setLoading(false);
    });
  }, [userId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  const change = total - prevSum;
  const changePercent = prevSum > 0 ? ((change / prevSum) * 100).toFixed(2) : '0';
  const largest = breakdown[0];
  const liquidTotal = breakdown.filter(a => a.type !== 'property').reduce((s, a) => s + a.value, 0);

  if (!userId || loading) {
    return (
      <div style={{ color: C.textMid }} className="text-center py-20 text-sm">
        {!userId ? 'Connecting to database…' : 'Loading…'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Net Worth Overview */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">Net Worth Summary</h2>
        <p style={{ color: C.textMid }} className="text-sm mb-6">Complete overview of your financial health</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-xl p-6">
            <p style={{ color: C.textMid }} className="text-sm mb-2">Total Net Worth</p>
            <div className="text-3xl font-bold mb-2">{formatCurrency(total)}</div>
            <div className="flex items-center gap-2">
              {change >= 0 ? (
                <ArrowUp size={16} style={{ color: C.green }} />
              ) : (
                <ArrowDown size={16} style={{ color: C.red }} />
              )}
              <span style={{ color: change >= 0 ? C.green : C.red }} className="text-sm font-semibold">
                {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent}%)
              </span>
            </div>
            <p style={{ color: C.textDim }} className="text-xs mt-3">vs. last month</p>
          </div>

          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-xl p-6">
            <p style={{ color: C.textMid }} className="text-sm mb-2">Largest Asset Class</p>
            <div className="text-3xl font-bold mb-2">{largest?.label ?? '—'}</div>
            <div style={{ color: C.gold }} className="font-semibold">{formatCurrency(largest?.value ?? 0)}</div>
            <p style={{ color: C.textDim }} className="text-xs mt-3">
              {total > 0 ? (((largest?.value ?? 0) / total) * 100).toFixed(1) : 0}% of portfolio
            </p>
          </div>

          <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-xl p-6">
            <p style={{ color: C.textMid }} className="text-sm mb-2">Liquid Assets</p>
            <div className="text-3xl font-bold mb-2">{formatCurrency(liquidTotal)}</div>
            <div style={{ color: C.teal }} className="font-semibold">
              {total > 0 ? ((liquidTotal / total) * 100).toFixed(1) : 0}% accessible
            </div>
            <p style={{ color: C.textDim }} className="text-xs mt-3">Readily available funds</p>
          </div>
        </div>
      </div>

      {/* Asset Breakdown Table */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8 overflow-x-auto">
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Asset Breakdown</h3>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottomColor: C.border }} className="border-b">
              <th className="text-left py-3 px-4" style={{ color: C.textMid }}>Asset Class</th>
              <th className="text-right py-3 px-4" style={{ color: C.textMid }}>Value</th>
              <th className="text-right py-3 px-4" style={{ color: C.textMid }}>% of Portfolio</th>
              <th className="text-left py-3 px-4" style={{ color: C.textMid }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((asset, idx) => (
              <tr key={idx} style={{ borderBottomColor: C.borderLight }} className="border-b hover:opacity-75 transition">
                <td className="py-4 px-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[asset.type] ?? C.textMid }} />
                  <span className="font-medium">{asset.label}</span>
                </td>
                <td className="text-right py-4 px-4 font-semibold">{formatCurrency(asset.value)}</td>
                <td className="text-right py-4 px-4" style={{ color: C.textMid }}>
                  {total > 0 ? ((asset.value / total) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-4 px-4 text-sm" style={{ color: C.textMid }}>{asset.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Metrics */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Financial Health Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl" style={{ backgroundColor: C.bgElevated }}>
            <TrendingUp style={{ color: change >= 0 ? C.green : C.red }} size={24} className="mb-3" />
            <p style={{ color: C.textMid }} className="text-sm mb-2">Growth (vs last month)</p>
            <p className="text-2xl font-bold" style={{ color: change >= 0 ? C.green : C.red }}>{change >= 0 ? '+' : ''}{changePercent}%</p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">Net worth change</p>
          </div>
          <div className="p-6 rounded-xl" style={{ backgroundColor: C.bgElevated }}>
            <BarChart2 style={{ color: C.blue }} size={24} className="mb-3" />
            <p style={{ color: C.textMid }} className="text-sm mb-2">Savings Rate</p>
            <p className="text-2xl font-bold">{savingsRate !== null ? `${savingsRate}%` : '—'}</p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">Of monthly income</p>
          </div>
          <div className="p-6 rounded-xl" style={{ backgroundColor: C.bgElevated }}>
            <Target style={{ color: C.gold }} size={24} className="mb-3" />
            <p style={{ color: C.textMid }} className="text-sm mb-2">Diversification</p>
            <p className="text-2xl font-bold">{breakdown.length} Classes</p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">Active asset types</p>
          </div>
        </div>
      </div>
    </div>
  );
}
