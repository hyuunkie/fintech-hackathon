'use client';

import { useEffect, useState } from 'react';
import { C } from '@/lib/constants';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { getLatestWellnessScore } from '@/app/actions/portfolio';
import { getMilestones } from '@/app/actions/goals';
import type { Database } from '@/lib/database.types';

type WellnessScore = Database["public"]["Tables"]["wellness_scores"]["Row"];
type Milestone = Database["public"]["Tables"]["milestones"]["Row"];

const getStatusColor = (score: number) =>
  score >= 80 ? C.green : score >= 60 ? C.gold : C.red;

const getStatusLabel = (score: number) =>
  score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Attention';

export default function FinancialHealthScore({ userId }: { userId: string | null }) {
  const [wellness, setWellness] = useState<WellnessScore | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([getLatestWellnessScore(userId), getMilestones(userId)]).then(
      ([w, m]) => { setWellness(w); setMilestones(m.filter(ms => !ms.is_complete && ms.target_amount)); setLoading(false); }
    );
  }, [userId]);

  const overall = wellness?.overall_score ?? 0;

  const metrics = [
    {
      key: 'diversification', label: 'Diversification', score: wellness?.diversification_score ?? 0,
      color: C.teal, desc: 'Asset class spread & correlation',
      status: (wellness?.diversification_score ?? 0) >= 80 ? 'Strong' : (wellness?.diversification_score ?? 0) >= 60 ? 'Good' : 'Moderate',
      pts: [
        `Net worth: $${((wellness?.net_worth ?? 0) / 1000).toFixed(0)}K`,
        `Total assets: $${((wellness?.total_assets ?? 0) / 1000).toFixed(0)}K`,
        `Total liabilities: $${((wellness?.total_liabilities ?? 0) / 1000).toFixed(0)}K`,
      ],
    },
    {
      key: 'liquidity', label: 'Liquidity', score: wellness?.liquidity_score ?? 0,
      color: C.gold, desc: 'Liquid access within 30 days',
      status: (wellness?.liquidity_score ?? 0) >= 80 ? 'Strong' : (wellness?.liquidity_score ?? 0) >= 60 ? 'Good' : 'Moderate',
      pts: [
        `Emergency fund: ${wellness?.emergency_fund_months?.toFixed(1) ?? '—'} months`,
        `Monthly expenses: $${((wellness?.monthly_expenses ?? 0) / 1000).toFixed(1)}K`,
        `Monthly income: $${((wellness?.monthly_income ?? 0) / 1000).toFixed(1)}K`,
      ],
    },
    {
      key: 'savings', label: 'Savings Rate', score: wellness?.savings_rate_score ?? 0,
      color: C.green, desc: 'Savings as % of income',
      status: (wellness?.savings_rate_score ?? 0) >= 80 ? 'Strong' : (wellness?.savings_rate_score ?? 0) >= 60 ? 'Good' : 'Moderate',
      pts: [
        `Savings rate: ${wellness?.savings_rate_pct?.toFixed(1) ?? '—'}%`,
        `Milestone score: ${wellness?.milestone_score ?? '—'}/100`,
        `Debt score: ${wellness?.debt_score ?? '—'}/100`,
      ],
    },
  ];

  if (loading && userId) {
    return <div style={{ color: C.textMid }} className="text-center py-20 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">Financial Health Score</h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">Your overall financial health measured against your goals</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <div className="relative w-80 h-80">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="140" fill="none" stroke={C.borderLight} strokeWidth="20" />
                <circle cx="50%" cy="50%" r="140" fill="none" stroke={getStatusColor(overall)}
                  strokeWidth="20" strokeDasharray={`${(overall / 100) * 880} 880`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold">{overall}</div>
                <div style={{ color: C.textMid }} className="text-lg">out of 100</div>
                <div className="mt-2 px-4 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${getStatusColor(overall)}30`, color: getStatusColor(overall) }}>
                  {getStatusLabel(overall)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p style={{ color: C.textMid }} className="text-sm mb-2">Financial Health Summary</p>
              <p className="text-lg leading-relaxed">
                Your financial health is <strong>{getStatusLabel(overall).toLowerCase()}</strong>. Focus on improving
                your lowest scoring area to increase your overall score.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={20} style={{ color: C.green }} />
                  <p className="font-semibold">Strengths</p>
                </div>
                <ul style={{ color: C.textMid }} className="text-sm space-y-1 ml-7">
                  {metrics.filter(m => m.score >= 70).map(m => <li key={m.key}>• {m.label}: {m.score}/100</li>)}
                  {metrics.every(m => m.score < 70) && <li>• Keep building your financial habits</li>}
                </ul>
              </div>
              <div style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle size={20} style={{ color: C.red }} />
                  <p className="font-semibold">Areas to Improve</p>
                </div>
                <ul style={{ color: C.textMid }} className="text-sm space-y-1 ml-7">
                  {metrics.filter(m => m.score < 70).map(m => <li key={m.key}>• Improve {m.label.toLowerCase()} (currently {m.score}/100)</li>)}
                  {metrics.every(m => m.score >= 70) && <li>• Maintain your excellent habits!</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.key} style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">{metric.label}</h3>
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                style={{ backgroundColor: `${metric.color}30`, color: metric.color }}>
                {metric.score}
              </div>
            </div>
            <p style={{ color: C.textMid }} className="text-sm mb-4">{metric.desc}</p>
            <div className="mb-6">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.borderLight }}>
                <div className="h-full transition-all duration-500" style={{ width: `${metric.score}%`, backgroundColor: metric.color }} />
              </div>
              <div className="flex justify-between mt-2">
                <span style={{ color: C.textMid }} className="text-xs">0</span>
                <span style={{ color: metric.color }} className="text-xs font-semibold">{metric.status}</span>
                <span style={{ color: C.textMid }} className="text-xs">100</span>
              </div>
            </div>
            <div className="space-y-2">
              {metric.pts.map((pt, idx) => (
                <div key={idx} className="flex gap-2">
                  <span style={{ color: metric.color }} className="flex-shrink-0">•</span>
                  <p style={{ color: C.textMid }} className="text-xs">{pt}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Goals Progress */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Progress Towards Goals</h3>
        <div className="space-y-6">
          {milestones.slice(0, 4).map((m) => {
            const pct = m.target_amount ? (m.current_amount / m.target_amount) * 100 : 0;
            const color = pct >= 85 ? C.green : pct >= 60 ? C.gold : C.red;
            return (
              <div key={m.id}>
                <div className="flex items-end justify-between mb-2">
                  <p className="font-semibold">{m.title}</p>
                  <p style={{ color: C.textMid }} className="text-sm">
                    ${m.current_amount.toLocaleString()} / ${(m.target_amount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: C.bgElevated }}>
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                </div>
                <p style={{ color: C.textMid }} className="text-xs mt-1">{Math.round(pct)}% complete</p>
              </div>
            );
          })}
          {milestones.length === 0 && (
            <p style={{ color: C.textDim }} className="text-sm">No active goals found.</p>
          )}
        </div>
      </div>

      {/* Path to higher score */}
      <div style={{ backgroundColor: C.bgCard, borderColor: C.border }} className="border rounded-2xl p-8">
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">Path to Score 80+</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.filter(m => m.score < 80).slice(0, 2).map((m, idx) => (
            <div key={m.key} style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }} className="border rounded-xl p-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 font-bold"
                style={{ backgroundColor: m.color, color: '#000' }}>{idx + 1}</div>
              <p className="font-semibold mb-2">Boost {m.label} ({m.score} → 80)</p>
              <p style={{ color: C.textMid }} className="text-sm">{m.pts[0]}</p>
              <p style={{ color: m.color }} className="text-xs font-semibold mt-3">+{80 - m.score} points needed</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
