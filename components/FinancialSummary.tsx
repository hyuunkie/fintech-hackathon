'use client';

import { C, WEALTH_COMP, TOTAL, OVER_TIME } from '@/lib/constants';
import { TrendingUp, ArrowUp } from 'lucide-react';

export default function FinancialSummary() {
  const previousTotal = OVER_TIME[OVER_TIME.length - 2];
  const currentTotal = OVER_TIME[OVER_TIME.length - 1];
  
  const prevSum = previousTotal.Cash + previousTotal.Equities + previousTotal.Trust + previousTotal.Digital + previousTotal.Property;
  const currSum = currentTotal.Cash + currentTotal.Equities + currentTotal.Trust + currentTotal.Digital + currentTotal.Property;
  const change = currSum - prevSum;
  const changePercent = ((change / prevSum) * 100).toFixed(2);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Net Worth Overview */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">
          Net Worth Summary
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-6">
          Complete overview of your financial health
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Net Worth */}
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-6"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Total Net Worth
            </p>
            <div className="text-3xl font-bold mb-2">{formatCurrency(TOTAL)}</div>
            <div className="flex items-center gap-2">
              <ArrowUp size={16} style={{ color: C.green }} />
              <span style={{ color: C.green }} className="text-sm font-semibold">
                +{formatCurrency(change)} ({changePercent}%)
              </span>
            </div>
            <p style={{ color: C.textDim }} className="text-xs mt-3">
              vs. last month
            </p>
          </div>

          {/* Top Asset Class */}
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-6"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Largest Asset Class
            </p>
            <div className="text-3xl font-bold mb-2">
              {WEALTH_COMP.reduce((a, b) => (a.value > b.value ? a : b)).label}
            </div>
            <div style={{ color: C.gold }} className="font-semibold">
              {formatCurrency(WEALTH_COMP.reduce((a, b) => (a.value > b.value ? a : b)).value)}
            </div>
            <p style={{ color: C.textDim }} className="text-xs mt-3">
              {(
                (WEALTH_COMP.reduce((a, b) => (a.value > b.value ? a : b)).value / TOTAL) *
                100
              ).toFixed(1)}
              % of portfolio
            </p>
          </div>

          {/* Liquid Assets */}
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-6"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Liquid Assets
            </p>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(
                WEALTH_COMP.filter((w) => w.label !== 'Property').reduce((a, b) => a + b.value, 0)
              )}
            </div>
            <div style={{ color: C.teal }} className="font-semibold">
              {(
                ((WEALTH_COMP.filter((w) => w.label !== 'Property').reduce((a, b) => a + b.value, 0) /
                  TOTAL) *
                  100)
              ).toFixed(1)}
              % accessible
            </div>
            <p style={{ color: C.textDim }} className="text-xs mt-3">
              Readily available funds
            </p>
          </div>
        </div>
      </div>

      {/* Asset Breakdown Table */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8 overflow-x-auto"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
          Asset Breakdown
        </h3>

        <table className="w-full">
          <thead>
            <tr style={{ borderBottomColor: C.border }} className="border-b">
              <th className="text-left py-3 px-4" style={{ color: C.textMid }}>
                Asset Class
              </th>
              <th className="text-right py-3 px-4" style={{ color: C.textMid }}>
                Value
              </th>
              <th className="text-right py-3 px-4" style={{ color: C.textMid }}>
                % of Portfolio
              </th>
              <th className="text-left py-3 px-4" style={{ color: C.textMid }}>
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {WEALTH_COMP.map((asset, idx) => (
              <tr
                key={idx}
                style={{ borderBottomColor: C.borderLight }}
                className="border-b hover:opacity-75 transition"
              >
                <td className="py-4 px-4 flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  ></div>
                  <span className="font-medium">{asset.label}</span>
                </td>
                <td className="text-right py-4 px-4 font-semibold">
                  {formatCurrency(asset.value)}
                </td>
                <td className="text-right py-4 px-4" style={{ color: C.textMid }}>
                  {asset.pct}%
                </td>
                <td className="py-4 px-4 text-sm" style={{ color: C.textDim }}>
                  {asset.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Metrics */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
          Financial Health Indicators
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl" style={{ backgroundColor: C.bgElevated }}>
            <TrendingUp style={{ color: C.green }} size={24} className="mb-3" />
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              YoY Growth
            </p>
            <p className="text-2xl font-bold">+12.4%</p>
            <p style={{ color: C.textDim }} className="text-xs mt-2">
              Compared to last year
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: C.bgElevated }}>
            <div className="text-2xl mb-3">📊</div>
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Monthly Savings
            </p>
            <p className="text-2xl font-bold">$2,400</p>
            <p style={{ color: C.textDim }} className="text-xs mt-2">
              Average contribution
            </p>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: C.bgElevated }}>
            <div className="text-2xl mb-3">🎯</div>
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Diversification
            </p>
            <p className="text-2xl font-bold">5 Classes</p>
            <p style={{ color: C.textDim }} className="text-xs mt-2">
              Across 3 regions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
