'use client';

import { C, SPENDING_DATA } from '@/lib/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Zap, Lightbulb } from 'lucide-react';

export default function SpendingInsights() {
  const totalSpent = SPENDING_DATA.reduce((sum, item) => sum + item.amount, 0);
  const totalBudget = SPENDING_DATA.reduce((sum, item) => sum + item.budget, 0);

  const categoryInsights = [
    {
      category: 'Food & Dining',
      trend: 'up',
      change: '+8%',
      insight: 'Spending increased from last month',
      recommendation: 'Consider meal planning to optimize food costs',
    },
    {
      category: 'Shopping',
      trend: 'stable',
      change: '0%',
      insight: 'Spending remained consistent',
      recommendation: 'Maintain current spending habits',
    },
    {
      category: 'Subscriptions',
      trend: 'down',
      change: '-5%',
      insight: 'Great job reducing subscriptions',
      recommendation: 'Consider reviewing remaining subscriptions quarterly',
    },
  ];

  const monthlySpending = [
    { month: 'Jan', actual: 2800, budget: 3500 },
    { month: 'Feb', actual: 2650, budget: 3500 },
    { month: 'Mar', actual: 3100, budget: 3500 },
    { month: 'Apr', actual: 2900, budget: 3500 },
    { month: 'May', actual: 3200, budget: 3500 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const budgetUtilization = (totalSpent / totalBudget) * 100;
  const overspent = SPENDING_DATA.filter((item) => item.amount > item.budget);
  const undebuget = SPENDING_DATA.filter((item) => item.amount < item.budget);

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">
          Spending Insights
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">
          Behavioral analysis and recommendations to optimize your spending
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              Total Spending
            </p>
            <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">
              This month so far
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              Budget Remaining
            </p>
            <p className="text-3xl font-bold" style={{ color: C.green }}>
              {formatCurrency(Math.max(totalBudget - totalSpent, 0))}
            </p>
            <p style={{ color: C.textDim }} className="text-xs mt-2">
              {budgetUtilization.toFixed(1)}% utilized
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              On Budget
            </p>
            <p className="text-3xl font-bold" style={{ color: C.green }}>
              {undebuget.length}
            </p>
            <p style={{ color: C.textDim }} className="text-xs mt-2">
              Categories under budget
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              Over Budget
            </p>
            <p className="text-3xl font-bold" style={{ color: C.red }}>
              {overspent.length}
            </p>
            <p style={{ color: C.textDim }} className="text-xs mt-2">
              Categories exceeding budget
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div
          style={{ backgroundColor: C.bgCard, borderColor: C.border }}
          className="border rounded-2xl p-8"
        >
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
            Spending by Category
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={SPENDING_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="category"
                angle={0}
                textAnchor="middle"
                height={60}
                tick={{ fontSize: 11, fill: C.textMid }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: C.textMid }}
                tickFormatter={(value) => `$${value / 1000}K`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(78, 158, 245, 0.12)' }}
                contentStyle={{
                  backgroundColor: C.bg,
                  border: `1px solid ${C.borderLight}`,
                  borderRadius: '8px',
                  color: C.text,
                }}
                itemStyle={{ color: C.text }}
                labelStyle={{ color: C.textMid }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ color: C.text }} />
              <Bar dataKey="amount" fill={C.gold} name="Actual Spending" />
              <Bar dataKey="budget" fill={C.teal} name="Budget" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div
          style={{ backgroundColor: C.bgCard, borderColor: C.border }}
          className="border rounded-2xl p-8"
        >
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
            Budget Distribution
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={SPENDING_DATA}
                cx="50%"
                cy="50%"
                nameKey="category"
                labelLine={{ stroke: C.borderLight }}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, payload }: any) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const pct = ((payload.budget / totalBudget) * 100).toFixed(0);
                  return (
                    <text x={x} y={y} fill={C.text} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
                      {payload.category}: {pct}%
                    </text>
                  );
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="budget"
              >
                {SPENDING_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [formatCurrency(value), name]}
                contentStyle={{
                  backgroundColor: C.bg,
                  border: `1px solid ${C.borderLight}`,
                  borderRadius: '8px',
                  color: C.text,
                }}
                itemStyle={{ color: C.text }}
                labelStyle={{ color: C.textMid }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
          Monthly Spending Trend
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={monthlySpending}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" stroke={C.textDim} />
            <YAxis
              tickFormatter={(value) => `$${value / 1000}K`}
              stroke={C.textDim}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: C.bgElevated,
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                color: C.text,
              }}
              formatter={(value: any) => formatCurrency(value)}
            />
            <Legend wrapperStyle={{ color: C.text }} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={C.gold}
              strokeWidth={2}
              name="Actual Spending"
            />
            <Line
              type="monotone"
              dataKey="budget"
              stroke={C.teal}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Budget"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Details */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
          Category Performance
        </h3>

        <div className="space-y-4">
          {SPENDING_DATA.map((item, idx) => {
            const utilization = (item.amount / item.budget) * 100;
            const isOver = item.amount > item.budget;

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: isOver ? `${C.red}60` : C.borderLight,
                  borderLeftColor: item.color,
                  borderLeftWidth: '4px',
                }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{item.category}</h4>
                    <p style={{ color: C.textMid }} className="text-sm">
                      {formatCurrency(item.amount)} / {formatCurrency(item.budget)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: isOver ? C.red : C.green,
                      }}
                    >
                      {utilization.toFixed(0)}%
                    </p>
                    <p style={{ color: C.textDim }} className="text-xs">
                      {isOver
                        ? `+${formatCurrency(item.amount - item.budget)}`
                        : `-${formatCurrency(item.budget - item.amount)}`}
                    </p>
                  </div>
                </div>

                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: C.bg }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(utilization, 100)}%`,
                      backgroundColor: isOver ? C.red : item.color,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Behavioral Insights */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
          Behavioral Insights
        </h3>

        <div className="space-y-4">
          {categoryInsights.map((insight, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: C.bgElevated,
                borderColor: C.borderLight,
              }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                {insight.trend === 'up' ? (
                  <AlertCircle
                    size={20}
                    style={{ color: C.red, flexShrink: 0, marginTop: '2px' }}
                  />
                ) : insight.trend === 'down' ? (
                  <CheckCircle
                    size={20}
                    style={{ color: C.green, flexShrink: 0, marginTop: '2px' }}
                  />
                ) : (
                  <Zap
                    size={20}
                    style={{ color: C.gold, flexShrink: 0, marginTop: '2px' }}
                  />
                )}

                <div className="flex-1">
                  <div className="flex items-center gap -2 mb-2">
                    <h4 className="font-semibold">{insight.category}</h4>
                    <span
                      className="ml-2 text-xs font-bold"
                      style={{
                        color:
                          insight.trend === 'up'
                            ? C.red
                            : insight.trend === 'down'
                              ? C.green
                              : C.gold,
                      }}
                    >
                      {insight.change}
                    </span>
                  </div>
                  <p style={{ color: C.textMid }} className="text-sm mb-2">
                    {insight.insight}
                  </p>
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

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          style={{ backgroundColor: C.bgCard, borderColor: C.border }}
          className="border rounded-2xl p-6"
        >
          <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold mb-4">
            Ways to Save More
          </h4>
          <ul style={{ color: C.textMid }} className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span style={{ color: C.green }}>✓</span>
              <span>Reduce daily dining out frequency</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: C.green }}>✓</span>
              <span>Review unused subscriptions</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: C.green }}>✓</span>
              <span>Use cashback for shopping</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: C.green }}>✓</span>
              <span>Set shopping budget alerts</span>
            </li>
          </ul>
        </div>

        <div
          style={{ backgroundColor: C.bgCard, borderColor: C.border }}
          className="border rounded-2xl p-6"
        >
          <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold mb-4">
            Potential Monthly Savings
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span style={{ color: C.textMid }}>Food & Dining</span>
              <span style={{ color: C.green }} className="font-bold">
                +$150
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: C.textMid }}>Shopping</span>
              <span style={{ color: C.green }} className="font-bold">
                +$80
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: C.textMid }}>Subscriptions</span>
              <span style={{ color: C.green }} className="font-bold">
                +$25
              </span>
            </div>
            <div
              style={{ borderTopColor: C.border }}
              className="pt-3 border-t flex justify-between items-center"
            >
              <span className="font-semibold">Total Potential Savings</span>
              <span style={{ color: C.gold }} className="text-xl font-bold">
                ~$255/month
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
