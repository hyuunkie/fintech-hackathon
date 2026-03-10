'use client';

import { useEffect, useMemo, useState } from 'react';
import { C } from '@/lib/constants';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';

type RecommendationPriority = 'high' | 'medium' | 'low';
type RecommendationRisk = 'None' | 'Low' | 'Medium' | 'High';

type RecommendationItem = {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  impact: string;
  potentialGain: string;
  riskLevel: RecommendationRisk;
  actionLabel?: string;
  actionHref?: string;
  timeline: 'this_month' | 'next_3_months' | 'next_12_months';
};

type RecommendationsResponse = {
  summary: {
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    estimatedAnnualUpside: string;
  };
  recommendations: RecommendationItem[];
};

export default function PortfolioRecommendations({
  userId,
}: {
  userId: string | null;
}) {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPriorityColor = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'high':
        return C.red;
      case 'medium':
        return C.gold;
      case 'low':
        return C.green;
      default:
        return C.textMid;
    }
  };

  const getPriorityIcon = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={20} />;
      case 'medium':
        return <Zap size={20} />;
      case 'low':
        return <CheckCircle size={20} />;
      default:
        return <TrendingUp size={20} />;
    }
  };

  const getRiskColor = (risk: RecommendationRisk) => {
    switch (risk) {
      case 'None':
        return C.green;
      case 'Low':
        return C.teal;
      case 'Medium':
        return C.gold;
      case 'High':
        return C.red;
      default:
        return C.textMid;
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setData(null);
      return;
    }

    let cancelled = false;

    async function loadRecommendations() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/portfolio/recommendations?userId=${encodeURIComponent(userId || '')}`,
          { method: 'GET', cache: 'no-store' }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || 'Failed to load recommendations');
        }

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const timelineGroups = useMemo(() => {
    const items = data?.recommendations ?? [];

    return {
      thisMonth: items.filter((r) => r.timeline === 'this_month'),
      next3Months: items.filter((r) => r.timeline === 'next_3_months'),
      next12Months: items.filter((r) => r.timeline === 'next_12_months'),
    };
  }, [data]);

  if (!userId) {
    return (
      <div style={{ color: C.textMid }} className="text-center py-20 text-sm">
        No user selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ color: C.textMid }} className="text-center py-20 text-sm flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} />
        Loading recommendations…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border, color: C.textMid }}
        className="border rounded-2xl p-8 text-center text-sm"
      >
        {error}
      </div>
    );
  }

  if (!data || data.recommendations.length === 0) {
    return (
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Wallet style={{ color: C.teal }} size={22} />
          <h2
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl font-bold"
          >
            Portfolio Recommendations
          </h2>
        </div>
        <p style={{ color: C.textMid }} className="text-sm">
          No recommendations yet. Add portfolio assets to generate personalized advice.
        </p>
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
          Portfolio Recommendations
        </h2>

        <p style={{ color: C.textMid }} className="text-sm mb-6">
          Personalized suggestions based on your current asset allocation and concentration risk.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-5"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              High Priority
            </p>
            <p className="text-3xl font-bold" style={{ color: C.red }}>
              {data.summary.highPriority}
            </p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">
              Immediate attention
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-5"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Medium Priority
            </p>
            <p className="text-3xl font-bold" style={{ color: C.gold }}>
              {data.summary.mediumPriority}
            </p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">
              Worth planning soon
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-5"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Low Priority
            </p>
            <p className="text-3xl font-bold" style={{ color: C.green }}>
              {data.summary.lowPriority}
            </p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">
              Longer-term optimizations
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-xl p-5"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Estimated Upside
            </p>
            <p className="text-3xl font-bold" style={{ color: C.teal }}>
              {data.summary.estimatedAnnualUpside}
            </p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">
              Based on suggested actions
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.recommendations.map((rec) => (
          <div
            key={rec.id}
            style={{ backgroundColor: C.bgCard, borderColor: C.border }}
            className="border rounded-2xl p-6 hover:opacity-95 transition"
          >
            <div className="flex gap-4">
              <div
                className="p-3 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: getPriorityColor(rec.priority),
                  color: '#000',
                }}
              >
                {getPriorityIcon(rec.priority)}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold">{rec.title}</h3>

                  <div
                    className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                    style={{
                      backgroundColor:
                        rec.priority === 'high'
                          ? `${C.red}20`
                          : rec.priority === 'medium'
                            ? `${C.gold}20`
                            : `${C.green}20`,
                      color: getPriorityColor(rec.priority),
                    }}
                  >
                    {rec.priority === 'high'
                      ? 'High Priority'
                      : rec.priority === 'medium'
                        ? 'Medium Priority'
                        : 'Low Priority'}
                  </div>
                </div>

                <p style={{ color: C.textMid }} className="text-sm mb-5">
                  {rec.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                    className="border rounded-lg p-4"
                  >
                    <p style={{ color: C.textMid }} className="text-xs mb-1">
                      Impact
                    </p>
                    <p className="text-sm font-semibold">{rec.impact}</p>
                  </div>

                  <div
                    style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                    className="border rounded-lg p-4"
                  >
                    <p style={{ color: C.textMid }} className="text-xs mb-1">
                      Potential Gain
                    </p>
                    <p style={{ color: C.green }} className="text-sm font-semibold">
                      {rec.potentialGain}
                    </p>
                  </div>

                  <div
                    style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                    className="border rounded-lg p-4"
                  >
                    <p style={{ color: C.textMid }} className="text-xs mb-1">
                      Risk Level
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: getRiskColor(rec.riskLevel) }}
                    >
                      {rec.riskLevel}
                    </p>
                  </div>
                </div>

                {rec.actionHref && (
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: C.border }}>
                    <a
                      href={rec.actionHref}
                      style={{ backgroundColor: C.blue, color: '#000' }}
                      className="inline-flex px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-80 transition"
                    >
                      {rec.actionLabel ?? 'Learn More'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-2xl font-bold mb-6"
        >
          Suggested Implementation Timeline
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: C.textMid }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.red }} />
              This Month
            </div>
            <div className="space-y-3">
              {timelineGroups.thisMonth.map((item) => (
                <div
                  key={item.id}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                  className="border rounded-lg p-4"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p style={{ color: C.textMid }} className="text-sm mt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: C.textMid }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.gold }} />
              Next 3 Months
            </div>
            <div className="space-y-3">
              {timelineGroups.next3Months.map((item) => (
                <div
                  key={item.id}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                  className="border rounded-lg p-4"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p style={{ color: C.textMid }} className="text-sm mt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: C.textMid }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.green }} />
              Next 12 Months
            </div>
            <div className="space-y-3">
              {timelineGroups.next12Months.map((item) => (
                <div
                  key={item.id}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                  className="border rounded-lg p-4"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p style={{ color: C.textMid }} className="text-sm mt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}