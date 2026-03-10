'use client';

import { useEffect, useMemo, useState } from 'react';
import { C } from '@/lib/constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

type PortfolioBreakdownItem = {
  type: string;
  label: string;
  value: number;
  source: string | null;
};

type PortfolioSummaryResponse = {
  total: number;
  breakdown: PortfolioBreakdownItem[];
};

const ASSET_COLORS: Record<string, string> = {
  cash: C.blue,
  equities: C.teal,
  unit_trust: C.green,
  crypto: C.gold,
  digital: C.gold,
  property: C.purple,
  other: C.textMid,
};

const RISK_MAP: Record<string, 'Low Risk' | 'Medium Risk' | 'High Risk'> = {
  cash: 'Low Risk',
  unit_trust: 'Low Risk',
  property: 'Medium Risk',
  equities: 'High Risk',
  crypto: 'High Risk',
  digital: 'High Risk',
  other: 'High Risk',
};

export default function PortfolioInfographic({ userId }: { userId: string | null }) {
  const [breakdown, setBreakdown] = useState<PortfolioBreakdownItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    if (!userId) {
      setBreakdown([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    let ignore = false;

    async function loadPortfolio() {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/portfolio/summary?userId=${encodeURIComponent(userId)}`, {
          method: 'GET',
          cache: 'no-store',
        });

        const data: PortfolioSummaryResponse | { error: string } = await res.json();

        if (!res.ok) {
          throw new Error('error' in data ? data.error : 'Failed to load portfolio');
        }

        if (!ignore && 'breakdown' in data) {
          setBreakdown(Array.isArray(data.breakdown) ? data.breakdown : []);
          setTotal(typeof data.total === 'number' ? data.total : 0);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
          setBreakdown([]);
          setTotal(0);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      ignore = true;
    };
  }, [userId]);

  const pieData = useMemo(
    () =>
      breakdown.map((item) => ({
        name: item.label,
        value: item.value,
        color: ASSET_COLORS[item.type] ?? C.textMid,
      })),
    [breakdown]
  );

  const riskAnalysis = useMemo(() => {
    const riskBuckets = breakdown.reduce<Record<string, { value: number; assets: string[] }>>(
      (acc, item) => {
        const risk = RISK_MAP[item.type] ?? 'High Risk';
        if (!acc[risk]) acc[risk] = { value: 0, assets: [] };
        acc[risk].value += item.value;
        acc[risk].assets.push(item.label);
        return acc;
      },
      {}
    );

    return ['Low Risk', 'Medium Risk', 'High Risk']
      .filter((r) => riskBuckets[r])
      .map((r) => ({ category: r, ...riskBuckets[r] }));
  }, [breakdown]);

  if (!userId) {
    return (
      <div style={{ color: C.textMid }} className="text-center py-20 text-sm">
        No user selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ color: C.textMid }} className="text-center py-20 text-sm">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: C.textMid }} className="text-center py-20 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl font-bold mb-2"
        >
          Portfolio Composition
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">
          Asset allocation across your investment portfolio
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  labelLine={{ stroke: C.borderLight }}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.55;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={C.text}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={11}
                      >
                        {name}: {total > 0 ? ((value / total) * 100).toFixed(0) : 0}%
                      </text>
                    );
                  }}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : '-'}
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

          <div className="space-y-4">
            {breakdown.map((asset, idx) => (
              <div
                key={`${asset.type}-${asset.label}-${idx}`}
                style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                className="border rounded-lg p-4 hover:opacity-75 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ASSET_COLORS[asset.type] ?? C.textMid }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{asset.label}</p>
                      <p style={{ color: C.textMid }} className="text-xs">
                        {asset.source ?? 'Manual'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      {total > 0 ? ((asset.value / total) * 100).toFixed(1) : 0}%
                    </p>
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

      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl font-bold mb-2"
        >
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
                key={risk.category}
                style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                className="border rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: riskColors[idx] }}
                  />
                  <h3 className="font-semibold">{risk.category}</h3>
                </div>

                <p className="text-3xl font-bold mb-2">
                  {total > 0 ? ((risk.value / total) * 100).toFixed(1) : 0}%
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

        <div className="w-full h-12 rounded-lg overflow-hidden flex" style={{ backgroundColor: C.bgElevated }}>
          {riskAnalysis.map((risk, idx) => {
            const colors = [C.green, C.gold, C.red];

            return (
              <div
                key={risk.category}
                className="h-full transition-opacity hover:opacity-75"
                style={{
                  width: `${total > 0 ? (risk.value / total) * 100 : 0}%`,
                  backgroundColor: colors[idx],
                }}
                title={`${risk.category}: ${total > 0 ? ((risk.value / total) * 100).toFixed(1) : 0}%`}
              />
            );
          })}
        </div>
      </div>

      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl font-bold mb-2"
        >
          Top Holdings
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">
          Your largest asset positions
        </p>

        <div>
          {breakdown.slice(0, 5).map((asset, idx) => {
            const pct = total > 0 ? (asset.value / total) * 100 : 0;

            return (
              <div
                key={`${asset.type}-${asset.label}-${idx}`}
                style={{ borderBottomColor: C.border }}
                className="py-4 border-b last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ASSET_COLORS[asset.type] ?? C.textMid }}
                    />
                    <span className="font-semibold">{asset.label}</span>
                  </div>

                  <span style={{ color: C.gold }} className="font-bold">
                    {pct.toFixed(1)}%
                  </span>
                </div>

                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: C.borderLight }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: ASSET_COLORS[asset.type] ?? C.textMid,
                    }}
                  />
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