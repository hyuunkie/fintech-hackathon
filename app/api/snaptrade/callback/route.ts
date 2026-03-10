import { NextRequest, NextResponse } from "next/server";
import { handleSnaptradeCallback } from "@/app/actions/snaptrade";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `Snaptrade authorization denied: ${error}` },
      { status: 400 }
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing authorization code or state" },
      { status: 400 }
    );
  }

  try {
    // Decode state to get userId
    const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
    const userId = decodedState.userId;

    const result = await handleSnaptradeCallback(code, state, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Redirect to portfolio page with success message
    return NextResponse.redirect(
      new URL(
        `/portfolio-settings?snaptrade=linked&accountId=${result.accountId}`,
        request.url
      )
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
