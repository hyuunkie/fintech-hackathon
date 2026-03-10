import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTransactions, getTransaction, getTransactionsByCategory, getTransactionsByDateRange, deleteTransaction } from '@/app/actions/portfolio';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    let transactions;

    if (id) {
      const transaction = await getTransaction(id, userId);
      return NextResponse.json({ success: true, data: transaction });
    } else if (category) {
      transactions = await getTransactionsByCategory(userId, category);
    } else if (startDate && endDate) {
      transactions = await getTransactionsByDateRange(userId, startDate, endDate);
    } else {
      const limit = parseInt(searchParams.get('limit') || '100', 10);
      transactions = await getTransactions(userId, limit);
    }

    return NextResponse.json({ success: true, data: transactions });
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

    const success = await deleteTransaction(id, userId);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
