import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

type AssetRow = {
  asset_type: string;
  label: string;
  value: number | string;
  source: string | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('portfolio_assets')
    .select('asset_type, label, value, source')
    .eq('user_id', userId)
    .order('value', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const assets: AssetRow[] = (data ?? []).map((item) => ({
    ...item,
    value: Number(item.value),
  }));

  const total = assets.reduce((sum, item) => sum + Number(item.value), 0);

  if (total <= 0) {
    return NextResponse.json({
      summary: {
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        estimatedAnnualUpside: '—',
      },
      recommendations: [],
    });
  }

  const allocation = assets.reduce<Record<string, number>>((acc, item) => {
    const type = item.asset_type;
    acc[type] = (acc[type] ?? 0) + Number(item.value);
    return acc;
  }, {});

  const cashPct = ((allocation.cash ?? 0) / total) * 100;
  const equitiesPct = ((allocation.equities ?? 0) / total) * 100;
  const propertyPct = ((allocation.property ?? 0) / total) * 100;
  const digitalPct = (((allocation.digital ?? 0) + (allocation.crypto ?? 0)) / total) * 100;

  const topHolding = assets[0];
  const topHoldingPct = topHolding ? (Number(topHolding.value) / total) * 100 : 0;

  const recommendations = [];

  if (cashPct < 15) {
    recommendations.push({
      id: 'liquidity-buffer',
      title: 'Increase Liquidity Buffer',
      description: `Liquid assets are ${cashPct.toFixed(1)}% of your portfolio. Consider increasing cash reserves toward a 15-20% buffer for emergencies and short-term needs.`,
      priority: 'high',
      impact: 'Financial Security',
      potentialGain: 'Stronger resilience',
      riskLevel: 'Low',
      actionLabel: 'View cash holdings',
      actionHref: '/portfolio',
      timeline: 'this_month',
    });
  }

  if (propertyPct > 35) {
    recommendations.push({
      id: 'rebalance-property',
      title: 'Rebalance Property Allocation',
      description: `Property makes up ${propertyPct.toFixed(1)}% of your portfolio, which is relatively concentrated. Consider directing new contributions into other asset classes to improve diversification.`,
      priority: 'medium',
      impact: 'Risk Reduction',
      potentialGain: 'Better balance',
      riskLevel: 'Medium',
      actionLabel: 'Review allocation',
      actionHref: '/portfolio/infographic',
      timeline: 'next_3_months',
    });
  }

  if (digitalPct > 15) {
    recommendations.push({
      id: 'digital-diversification',
      title: 'Reduce Digital Asset Concentration',
      description: `Digital assets are ${digitalPct.toFixed(1)}% of your portfolio. Review concentration risk and consider capping future additions until other categories catch up.`,
      priority: 'medium',
      impact: 'Volatility Control',
      potentialGain: 'Lower drawdown risk',
      riskLevel: 'High',
      actionLabel: 'Inspect digital exposure',
      actionHref: '/portfolio/infographic',
      timeline: 'next_3_months',
    });
  }

  if (equitiesPct < 35) {
    recommendations.push({
      id: 'increase-equities',
      title: 'Increase Equity Exposure',
      description: `Equities are ${equitiesPct.toFixed(1)}% of your portfolio. If your time horizon is long, gradually increasing broad-market equity exposure may improve long-term growth potential.`,
      priority: 'medium',
      impact: 'Long-term Returns',
      potentialGain: 'Higher growth potential',
      riskLevel: 'Medium',
      actionLabel: 'Review portfolio',
      actionHref: '/portfolio',
      timeline: 'next_3_months',
    });
  }

  if (topHoldingPct > 40) {
    recommendations.push({
      id: 'single-holding-concentration',
      title: 'Reduce Single-Holding Concentration',
      description: `${topHolding.label} represents ${topHoldingPct.toFixed(1)}% of your total portfolio. Consider spreading future contributions across other holdings to reduce dependency on one position.`,
      priority: 'high',
      impact: 'Diversification',
      potentialGain: 'Lower concentration risk',
      riskLevel: 'Medium',
      actionLabel: 'Inspect top holdings',
      actionHref: '/portfolio/infographic',
      timeline: 'this_month',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'maintain-allocation',
      title: 'Maintain Current Allocation',
      description:
        'Your current portfolio looks reasonably balanced based on the available data. Focus on consistent contributions and periodic rebalancing.',
      priority: 'low',
      impact: 'Discipline',
      potentialGain: 'Steady progress',
      riskLevel: 'Low',
      actionLabel: 'View portfolio',
      actionHref: '/portfolio',
      timeline: 'next_12_months',
    });
  }

  const summary = {
    highPriority: recommendations.filter((r) => r.priority === 'high').length,
    mediumPriority: recommendations.filter((r) => r.priority === 'medium').length,
    lowPriority: recommendations.filter((r) => r.priority === 'low').length,
    estimatedAnnualUpside:
      recommendations.length >= 3 ? 'Moderate' : recommendations.length >= 1 ? 'Targeted' : '—',
  };

  return NextResponse.json({
    summary,
    recommendations,
  });
}