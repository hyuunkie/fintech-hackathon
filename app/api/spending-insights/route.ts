import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInsights, getInsight, createInsight, updateInsight, dismissInsight, deleteInsight, getTotalSpendingThisMonth, getAverageDailySpending } from '@/app/actions/spending-insights';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const thisMonth = searchParams.get('thisMonth') === 'true';
    const avgDaily = searchParams.get('avgDaily') === 'true';
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    let data;
    if (thisMonth) {
      const total = await getTotalSpendingThisMonth(userId);
      return NextResponse.json({ success: true, data: { total } });
    } else if (avgDaily) {
      const average = await getAverageDailySpending(userId, days);
      return NextResponse.json({ success: true, data: { average, days } });
    } else if (id) {
      data = await getInsight(id, userId);
    } else {
      data = await getInsights(userId);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const insight = await createInsight(body);
    return NextResponse.json({ success: true, data: insight }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, dismiss, ...updates } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId required' }, { status: 400 });
    }

    let insight;
    if (dismiss) {
      insight = await dismissInsight(id, userId);
    } else {
      insight = await updateInsight(id, userId, updates);
    }

    return NextResponse.json({ success: true, data: insight });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId required' }, { status: 400 });
    }

    const success = await deleteInsight(id, userId);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
