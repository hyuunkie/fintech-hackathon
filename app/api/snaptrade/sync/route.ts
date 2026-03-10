import { NextRequest, NextResponse } from "next/server";
import { syncSnaptradeInvestments } from "@/app/actions/snaptrade";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { accountId, userId, accessToken } = await request.json();

    if (!accountId || !userId || !accessToken) {
      return NextResponse.json(
        { error: "Missing accountId, userId, or accessToken" },
        { status: 400 }
      );
    }

    const result = await syncSnaptradeInvestments(accountId, userId, accessToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      positionsCount: result.positionsCount,
      message: `Successfully synced ${result.positionsCount} investment positions`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
