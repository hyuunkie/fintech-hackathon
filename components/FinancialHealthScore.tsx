'use client';

import { C, METRICS } from '@/lib/constants';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function FinancialHealthScore() {
  const overallScore = Math.round((METRICS[0].score + METRICS[1].score + METRICS[2].score) / 3);

  const goals = [
    { label: 'Emergency Fund', current: 240, target: 300, unit: 'K' },
    { label: 'Retirement Savings', current: 584.2, target: 800, unit: 'K' },
    { label: 'Investment Diversification', current: 5, target: 7, unit: 'classes' },
  ];

  const getStatusColor = (score: number): string => {
    if (score >= 80) return C.green;
    if (score >= 60) return C.gold;
    return C.red;
  };

  const getProgressColor = (current: number, target: number) => {
    const percent = (current / target) * 100;
    if (percent >= 85) return C.green;
    if (percent >= 60) return C.gold;
    return C.red;
  };

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">
          Financial Health Score
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">
          Your overall financial health measured against your goals
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Score Circle */}
          <div className="flex justify-center">
            <div className="relative w-80 h-80">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="140"
                  fill="none"
                  stroke={C.borderLight}
                  strokeWidth="20"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="140"
                  fill="none"
                  stroke={getStatusColor(overallScore)}
                  strokeWidth="20"
                  strokeDasharray={`${(overallScore / 100) * 880} 880`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold">{overallScore}</div>
                <div style={{ color: C.textMid }} className="text-lg">
                  out of 100
                </div>
                <div
                  className="mt-2 px-4 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor:
                      overallScore >= 80
                        ? `${C.green}30`
                        : overallScore >= 60
                          ? `${C.gold}30`
                          : `${C.red}30`,
                    color: getStatusColor(overallScore),
                  }}
                >
                  {overallScore >= 80
                    ? 'Excellent'
                    : overallScore >= 60
                      ? 'Good'
                      : 'Needs Attention'}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div>
              <p style={{ color: C.textMid }} className="text-sm mb-2">
                Financial Health Summary
              </p>
              <p className="text-lg leading-relaxed">
                Your financial health is <strong>good</strong> overall. You have strong consistency in your
                savings pattern and decent asset diversification. Improving your liquidity buffer should be the
                priority.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div
                style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={20} style={{ color: C.green }} />
                  <p className="font-semibold">Strengths</p>
                </div>
                <ul style={{ color: C.textMid }} className="text-sm space-y-1 ml-7">
                  <li>• Consistent monthly contributions</li>
                  <li>• Good asset diversification</li>
                  <li>• Low portfolio volatility</li>
                </ul>
              </div>

              <div
                style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle size={20} style={{ color: C.red }} />
                  <p className="font-semibold">Areas to Improve</p>
                </div>
                <ul style={{ color: C.textMid }} className="text-sm space-y-1 ml-7">
                  <li>• Increase emergency fund buffer</li>
                  <li>• Reduce property concentration</li>
                  <li>• Optimize tax efficiency</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {METRICS.map((metric) => (
          <div
            key={metric.key}
            style={{ backgroundColor: C.bgCard, borderColor: C.border }}
            className="border rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">{metric.label}</h3>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                style={{ backgroundColor: `${metric.color}30`, color: metric.color }}
              >
                {metric.score}
              </div>
            </div>

            <p style={{ color: C.textMid }} className="text-sm mb-4">
              {metric.desc}
            </p>

            {/* Score Bar */}
            <div className="mb-6">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: C.borderLight }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${metric.score}%`,
                    backgroundColor: metric.color,
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span style={{ color: C.textMid }} className="text-xs">
                  0
                </span>
                <span style={{ color: metric.color }} className="text-xs font-semibold">
                  {metric.status}
                </span>
                <span style={{ color: C.textMid }} className="text-xs">
                  100
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              {metric.pts.map((pt, idx) => (
                <div key={idx} className="flex gap-2">
                  <span style={{ color: metric.color }} className="flex-shrink-0">
                    •
                  </span>
                  <p style={{ color: C.textMid }} className="text-xs">
                    {pt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Goals Progress */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
          Progress Towards Goals
        </h3>

        <div className="space-y-6">
          {goals.map((goal, idx) => {
            const progressPercent = (goal.current / goal.target) * 100;
            const progressColor = getProgressColor(goal.current, goal.target);

            return (
              <div key={idx}>
                <div className="flex items-end justify-between mb-2">
                  <p className="font-semibold">{goal.label}</p>
                  <p style={{ color: C.textMid }} className="text-sm">
                    {goal.current}/{goal.target} {goal.unit}
                  </p>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: C.bgElevated }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(progressPercent, 100)}%`,
                      backgroundColor: progressColor,
                    }}
                  ></div>
                </div>
                <p style={{ color: C.textMid }} className="text-xs mt-1">
                  {Math.round(progressPercent)}% complete
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations to Improve Score */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
          Path to Score 80+
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-6"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 font-bold"
              style={{ backgroundColor: C.gold, color: '#000' }}
            >
              1
            </div>
            <p className="font-semibold mb-2">Boost Liquidity (54 → 75)</p>
            <p style={{ color: C.textMid }} className="text-sm">
              Increase emergency fund from $240K to $300K minimum
            </p>
            <p style={{ color: C.gold }} className="text-xs font-semibold mt-3">
              +5 points
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-6"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 font-bold"
              style={{ backgroundColor: C.teal, color: '#000' }}
            >
              2
            </div>
            <p className="font-semibold mb-2">Improve Diversification (72 → 82)</p>
            <p style={{ color: C.textMid }} className="text-sm">
              Reduce property allocation and add more international exposure
            </p>
            <p style={{ color: C.teal }} className="text-xs font-semibold mt-3">
              +5 points
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
