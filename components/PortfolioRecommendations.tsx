'use client';

import { C, WEALTH_COMP, TOTAL } from '@/lib/constants';
import { Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function PortfolioRecommendations() {
  const recommendations = [
    {
      id: 1,
      title: 'Increase Liquidity Buffer',
      description:
        'Your liquid assets are only 14% of your portfolio. Consider moving $50K-$100K to a high-yield savings account for emergency funds.',
      priority: 'high',
      impact: 'Financial Security',
      potentialGain: '+ Reduce risk by 18%',
      riskLevel: 'Low',
    },
    {
      id: 2,
      title: 'Diversify Digital Assets',
      description:
        'Digital assets are concentrated in Bitcoin. Consider diversifying into Ethereum or other established cryptocurrencies for better risk management.',
      priority: 'medium',
      impact: 'Risk Reduction',
      potentialGain: '+ Better correlation',
      riskLevel: 'Medium',
    },
    {
      id: 3,
      title: 'Rebalance Property Allocation',
      description:
        'Property represents 39% of your portfolio - above the recommended 30-35%. Consider redirecting future disposable income to equities.',
      priority: 'medium',
      impact: 'Growth Potential',
      potentialGain: '+ 5-7% annual return',
      riskLevel: 'Medium',
    },
    {
      id: 4,
      title: 'Optimize Tax Efficiency',
      description:
        'Review your ETF holdings in Interactive Brokers for tax-loss harvesting opportunities. Could save ~$2,500-$3,500 annually.',
      priority: 'low',
      impact: 'Tax Efficiency',
      potentialGain: '+ $2,500/year savings',
      riskLevel: 'None',
    },
    {
      id: 5,
      title: 'Increase Equity Exposure',
      description:
        'With your consistent contribution streak, consider increasing equity allocation from 34% to 40% for higher long-term growth.',
      priority: 'medium',
      impact: 'Long-term Returns',
      potentialGain: '+ 3-4% annual gain',
      riskLevel: 'Medium',
    },
    {
      id: 6,
      title: 'Review Unit Trust Performance',
      description:
        'Your Unit Trusts have underperformed benchmarks by 2.3% YoY. Consider switching to lower-cost index funds.',
      priority: 'low',
      impact: 'Cost Reduction',
      potentialGain: '+ Save 0.5-1% fees',
      riskLevel: 'Low',
    },
  ];

  const getPriorityColor = (priority: string) => {
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

  const getPriorityIcon = (priority: string) => {
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

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">
          Portfolio Recommendations
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-6">
          Personalized recommendations to optimize your portfolio based on your risk profile
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              High Priority
            </p>
            <p className="text-3xl font-bold" style={{ color: C.red }}>
              1
            </p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">
              Immediate action recommended
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Medium Priority
            </p>
            <p className="text-3xl font-bold" style={{ color: C.gold }}>
              3
            </p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">
              Should implement soon
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-sm mb-2">
              Potential Gains
            </p>
            <p className="text-3xl font-bold" style={{ color: C.green }}>
              +$5K/yr
            </p>
            <p style={{ color: C.textMid }} className="text-xs mt-2">
              If implemented
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            style={{ backgroundColor: C.bgCard, borderColor: C.border }}
            className="border rounded-xl p-6 hover:opacity-95 transition"
          >
            <div className="flex gap-4">
              {/* Priority Icon */}
              <div
                className="p-3 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: getPriorityColor(rec.priority),
                  color: '#000',
                }}
              >
                {getPriorityIcon(rec.priority)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold">{rec.title}</h3>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-semibold"
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

                <p style={{ color: C.textMid }} className="text-sm mb-4">
                  {rec.description}
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p style={{ color: C.textMid }} className="text-xs mb-1">
                      Impact
                    </p>
                    <p className="text-sm font-semibold">{rec.impact}</p>
                  </div>
                  <div>
                    <p style={{ color: C.textMid }} className="text-xs mb-1">
                      Potential Gain
                    </p>
                    <p style={{ color: C.green }} className="text-sm font-semibold">
                      {rec.potentialGain}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: C.textMid }} className="text-xs mb-1">
                      Risk Level
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color:
                          rec.riskLevel === 'None'
                            ? C.green
                            : rec.riskLevel === 'Low'
                              ? C.teal
                              : rec.riskLevel === 'Medium'
                                ? C.gold
                                : C.red,
                      }}
                    >
                      {rec.riskLevel}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                  <button
                    style={{ backgroundColor: C.blue, color: '#000' }}
                    className="px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-80 transition"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Implementation Timeline */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
          Suggested Implementation Timeline
        </h3>

        <div className="space-y-4">
          {/* Immediate */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: C.textMid }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.red }}></div>
              This Month
            </div>
            <div
              style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
              className="border rounded-lg p-4"
            >
              <p className="font-semibold">Increase Liquidity Buffer</p>
              <p style={{ color: C.textMid }} className="text-sm mt-1">
                Move $50K-$100K to emergency fund
              </p>
            </div>
          </div>

          {/* Next Quarter */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: C.textMid }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.gold }}></div>
              Next 3 Months
            </div>
            <div className="space-y-3">
              {[
                'Diversify Digital Assets',
                'Rebalance Property Allocation',
                'Increase Equity Exposure',
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                  className="border rounded-lg p-4"
                >
                  <p className="font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Long term */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: C.textMid }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.green }}></div>
              Next 12 Months
            </div>
            <div className="space-y-3">
              {[
                'Optimize Tax Efficiency',
                'Review Unit Trust Performance',
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
                  className="border rounded-lg p-4"
                >
                  <p className="font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
