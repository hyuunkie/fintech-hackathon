import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getWellnessScores, getLatestWellnessScore, upsertWellnessScore, deleteWellnessScore } from '@/app/actions/portfolio';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const latest = searchParams.get('latest') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const data = latest ? await getLatestWellnessScore(userId) : await getWellnessScores(userId);
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
    const score = await upsertWellnessScore(body);
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
