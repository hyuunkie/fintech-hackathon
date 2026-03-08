'use client';

import { useEffect, useState } from 'react';
import { C } from '@/lib/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Zap, Lightbulb } from 'lucide-react';
import { getSpendingCategories } from '@/app/actions/portfolio';
import type { SpendingCategoryItem } from '@/app/actions/portfolio';

// Static budget targets per category
const BUDGETS: Record<string, number> = {
  'Food & Dining': 1500, Shopping: 1000, Transport: 500,
  Subscriptions: 200, Utilities: 400, Entertainment: 600,
};

const monthlySpending = [
  { month: 'Nov', actual: 2800, budget: 3500 },
  { month: 'Dec', actual: 2650, budget: 3500 },
  { month: 'Jan', actual: 3100, budget: 3500 },
  { month: 'Feb', actual: 2900, budget: 3500 },
  { month: 'Mar', actual: 0, budget: 3500 }, // will be filled from DB
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

export default function SpendingInsights({ userId }: { userId: string | null }) {
  const [categories, setCategories] = useState<SpendingCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getSpendingCategories(userId).then(data => { setCategories(data); setLoading(false); });
  }, [userId]);

  // Enrich with budget info
  const spendingData = categories.map(c => ({
    ...c, budget: BUDGETS[c.category] ?? Math.round(c.amount * 1.2),
  }));

  // Update current month actual in chart
  const currentMonthActual = spendingData.reduce((s, c) => s + c.amount, 0);
  const chartData = monthlySpending.map((m, i) =>
    i === monthlySpending.length - 1 ? { ...m, actual: currentMonthActual } : m
  );

  const totalSpent = spendingData.reduce((s, c) => s + c.amount, 0);
  const totalBudget = spendingData.reduce((s, c) => s + c.budget, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const overspent = spendingData.filter(c => c.amount > c.budget);
  const underBudget = spendingData.filter(c => c.amount <= c.budget);

  const categoryInsights = spendingData.slice(0, 3).map(c => ({
    category: c.category,
    trend: c.amount > c.budget ? 'up' : 'down',
    change: c.amount > c.budget ? `+${(((c.amount - c.budget) / c.budget) * 100).toFixed(0)}%` : `-${(((c.budget - c.amount) / c.budget) * 100).toFixed(0)}%`,
    insight: c.amount > c.budget ? 'Spending exceeded budget this month' : 'Spending within budget',
    recommendation: c.amount > c.budget ? `Consider reducing ${c.category.toLowerCase()} spend` : 'Maintain current spending habits',
  }));

  if (loading && userId) {
    return <div style={{ color: C.textMid }} className="text-center py-20 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">Spending Insights</h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">Behavioral analysis and recommendations to optimize your spending</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Spending', value: formatCurrency(totalSpent), sub: 'All transactions' },
            { label: 'Budget Remaining', value: formatCurrency(Math.max(totalBudget - totalSpent, 0)), sub: `${budgetUtilization.toFixed(1)}% utilized`, color: C.green },
            { label: 'On Budget', value: underBudget.length.toString(), sub: 'Categories under budget', color: C.green },
            { label: 'Over Budget', value: overspent.length.toString(), sub: 'Categories exceeding budget', color: C.red },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
              <p style={{ color: C.textMid }} className="text-xs mb-2">{label}</p>
              <p className="text-3xl font-bold" style={color ? { color } : {}}>{value}</p>
              <p style={{ color: C.textDim }} className="text-xs mt-2">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: C.textMid }} interval={0} />
              <YAxis tick={{ fontSize: 12, fill: C.textMid }} tickFormatter={v => `$${v / 1000}K`} />
              <Tooltip cursor={{ fill: 'rgba(78,158,245,0.12)' }}
                contentStyle={{ backgroundColor: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: '8px', color: C.text }}
                itemStyle={{ color: C.text }} labelStyle={{ color: C.textMid }}
                formatter={(v: any) => formatCurrency(v)} />
              <Legend wrapperStyle={{ color: C.text }} />
              <Bar dataKey="amount" fill={C.gold} name="Actual Spending" />
              <Bar dataKey="budget" fill={C.teal} name="Budget" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Budget Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={spendingData} cx="50%" cy="50%" outerRadius={100} dataKey="budget" nameKey="category"
                labelLine={{ stroke: C.borderLight }}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, payload }: any) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const pct = totalBudget > 0 ? ((payload.budget / totalBudget) * 100).toFixed(0) : 0;
                  return <text x={x} y={y} fill={C.text} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>{payload.category}: {pct}%</text>;
                }}>
                {spendingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [formatCurrency(v), n]}
                contentStyle={{ backgroundColor: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: '8px', color: C.text }}
                itemStyle={{ color: C.text }} labelStyle={{ color: C.textMid }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Monthly Spending Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" stroke={C.textDim} />
            <YAxis tickFormatter={v => `$${v / 1000}K`} stroke={C.textDim} />
            <Tooltip contentStyle={{ backgroundColor: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text }}
              formatter={(v: any) => formatCurrency(v)} />
            <Legend wrapperStyle={{ color: C.text }} />
            <Line type="monotone" dataKey="actual" stroke={C.gold} strokeWidth={2} name="Actual Spending" />
            <Line type="monotone" dataKey="budget" stroke={C.teal} strokeWidth={2} strokeDasharray="5 5" name="Budget" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Category Performance</h3>
        <div className="space-y-4">
          {spendingData.map((item, idx) => {
            const utilization = (item.amount / item.budget) * 100;
            const isOver = item.amount > item.budget;
            return (
              <div key={idx} style={{ backgroundColor: C.bgElevated, borderColor: isOver ? `${C.red}60` : C.borderLight, borderLeftColor: item.color, borderLeftWidth: '4px' }} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{item.category}</h4>
                    <p style={{ color: C.textMid }} className="text-sm">{formatCurrency(item.amount)} / {formatCurrency(item.budget)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: isOver ? C.red : C.green }}>{utilization.toFixed(0)}%</p>
                    <p style={{ color: C.textDim }} className="text-xs">
                      {isOver ? `+${formatCurrency(item.amount - item.budget)}` : `-${formatCurrency(item.budget - item.amount)}`}
                    </p>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.bg }}>
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${Math.min(utilization, 100)}%`, backgroundColor: isOver ? C.red : item.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Behavioral Insights */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Behavioral Insights</h3>
        <div className="space-y-4">
          {categoryInsights.map((insight, idx) => (
            <div key={idx} style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                {insight.trend === 'up'
                  ? <AlertCircle size={20} style={{ color: C.red, flexShrink: 0, marginTop: '2px' }} />
                  : insight.trend === 'down'
                  ? <CheckCircle size={20} style={{ color: C.green, flexShrink: 0, marginTop: '2px' }} />
                  : <Zap size={20} style={{ color: C.gold, flexShrink: 0, marginTop: '2px' }} />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{insight.category}</h4>
                    <span className="text-xs font-bold" style={{ color: insight.trend === 'up' ? C.red : C.green }}>{insight.change}</span>
                  </div>
                  <p style={{ color: C.textMid }} className="text-sm mb-2">{insight.insight}</p>
                  <p style={{ color: C.textDim }} className="text-xs flex items-center gap-1">
                    <Lightbulb size={12} style={{ color: C.gold, flexShrink: 0 }} />
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
