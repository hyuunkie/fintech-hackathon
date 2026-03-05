'use client';

import { C, WEALTH_COMP, TOTAL } from '@/lib/constants';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function PortfolioInfographic() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Prepare data for Pie Chart
  const pieData = WEALTH_COMP.map((item) => ({
    name: item.label,
    value: item.value,
    color: item.color,
  }));

  // Risk-based grouping
  const riskAnalysis = [
    {
      category: 'Low Risk',
      value: WEALTH_COMP[0].value + WEALTH_COMP[1].value,
      assets: ['Cash & Deposits', 'Unit Trusts'],
    },
    {
      category: 'Medium Risk',
      value: WEALTH_COMP[4].value,
      assets: ['Property'],
    },
    {
      category: 'High Risk',
      value: WEALTH_COMP[1].value + WEALTH_COMP[3].value,
      assets: ['Equities & ETFs', 'Digital Assets'],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Portfolio Composition Pie */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">
          Portfolio Composition
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">
          Asset allocation across your investment portfolio
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={{ stroke: C.borderLight }}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.55;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill={C.text} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
                        {name}: {((value / TOTAL) * 100).toFixed(0)}%
                      </text>
                    );
                  }}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
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

          {/* Legend Details */}
          <div className="space-y-4">
            {WEALTH_COMP.map((asset, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                className="border rounded-lg p-4 hover:opacity-75 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: asset.color }}
                    ></div>
                    <div className="flex-1">
                      <p className="font-semibold">{asset.label}</p>
                      <p style={{ color: C.textMid }} className="text-xs">
                        {asset.source}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{asset.pct}%</p>
                    <p style={{ color: C.textMid }} className="text-xs">
                      {formatCurrency(asset.value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">
          Risk Distribution
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">
          How your portfolio is distributed across risk levels
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {riskAnalysis.map((risk, idx) => {
            const riskColors = [C.green, C.gold, C.red];
            return (
              <div
                key={idx}
                style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                className="border rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: riskColors[idx] }}
                  ></div>
                  <h3 className="font-semibold">{risk.category}</h3>
                </div>
                <p className="text-3xl font-bold mb-2">
                  {((risk.value / TOTAL) * 100).toFixed(1)}%
                </p>
                <p style={{ color: C.textMid }} className="text-sm">
                  {formatCurrency(risk.value)}
                </p>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                  <p style={{ color: C.textMid }} className="text-xs">
                    {risk.assets.join(', ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk Distribution Bar */}
        <div className="w-full h-12 rounded-lg overflow-hidden flex" style={{ backgroundColor: C.bgElevated }}>
          {riskAnalysis.map((risk, idx) => {
            const colors = [C.green, C.gold, C.red];
            return (
              <div
                key={idx}
                className="h-full transition-opacity hover:opacity-75"
                style={{
                  width: `${(risk.value / TOTAL) * 100}%`,
                  backgroundColor: colors[idx],
                }}
                title={`${risk.category}: ${((risk.value / TOTAL) * 100).toFixed(1)}%`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Top Holdings */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">
          Top Holdings
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">
          Your largest asset positions
        </p>

        <div>
          {WEALTH_COMP.sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map((asset, idx) => {
              const percentage = (asset.value / TOTAL) * 100;
              return (
                <div
                  key={idx}
                  style={{ borderBottomColor: C.border }}
                  className="py-4 border-b last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      ></div>
                      <span className="font-semibold">{asset.label}</span>
                    </div>
                    <span style={{ color: C.gold }} className="font-bold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: C.borderLight }}
                  >
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: asset.color,
                      }}
                    ></div>
                  </div>
                  <p style={{ color: C.textMid }} className="text-xs mt-2">
                    {formatCurrency(asset.value)}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
