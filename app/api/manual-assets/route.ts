import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getManualAssets, getManualAsset, createManualAsset, updateManualAsset, deleteManualAsset } from '@/app/actions/connected-apps';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (id) {
      const asset = await getManualAsset(id, userId);
      return NextResponse.json({ success: true, data: asset });
    }

    const assets = await getManualAssets(userId);
    return NextResponse.json({ success: true, data: assets });
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
    const asset = await createManualAsset(body);
    return NextResponse.json({ success: true, data: asset }, { status: 201 });
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
    const { id, userId, ...updates } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId required' }, { status: 400 });
    }

    const asset = await updateManualAsset(id, userId, updates);
    return NextResponse.json({ success: true, data: asset });
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

    const success = await deleteManualAsset(id, userId);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
