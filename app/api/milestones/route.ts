import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMilestones, getMilestone, createMilestone, updateMilestone, addToMilestoneProgress, deleteMilestone } from '@/app/actions/goals';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (id) {
      const milestone = await getMilestone(id, userId);
      return NextResponse.json({ success: true, data: milestone });
    }

    const milestones = await getMilestones(userId);
    return NextResponse.json({ success: true, data: milestones });
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
    const milestone = await createMilestone(body);
    return NextResponse.json({ success: true, data: milestone }, { status: 201 });
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
    const { id, userId, addAmount, ...updates } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId required' }, { status: 400 });
    }

    let milestone;
    if (addAmount !== undefined) {
      milestone = await addToMilestoneProgress(id, userId, addAmount);
    } else {
      milestone = await updateMilestone(id, userId, updates);
    }

    return NextResponse.json({ success: true, data: milestone });
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

    const success = await deleteMilestone(id, userId);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
