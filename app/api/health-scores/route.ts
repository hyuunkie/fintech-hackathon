import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getWellnessScores, getLatestWellnessScore, getWellnessScore, createWellnessScore, deleteWellnessScore, calculateHealthScore } from '@/app/actions/health-scores';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const latest = searchParams.get('latest') === 'true';
    const calculate = searchParams.get('calculate') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    let data;
    if (calculate) {
      const score = await calculateHealthScore(userId);
      return NextResponse.json({ success: true, data: score });
    } else if (id) {
      data = await getWellnessScore(id, userId);
    } else if (latest) {
      data = await getLatestWellnessScore(userId);
    } else {
      data = await getWellnessScores(userId);
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
    const score = await createWellnessScore(body);
    return NextResponse.json({ success: true, data: score }, { status: 201 });
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

    const success = await deleteWellnessScore(id, userId);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
