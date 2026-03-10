"use server";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type InvestmentAccount = Database["public"]["Tables"]["investment_accounts"]["Row"];
type InvestmentPosition = Database["public"]["Tables"]["investment_positions"]["Row"];

const SNAPTRADE_API_URL = process.env.SNAPTRADE_API_URL || "https://api.snaptrade.com/v1";
const SNAPTRADE_CLIENT_ID = process.env.SNAPTRADE_CLIENT_ID;
const SNAPTRADE_CLIENT_SECRET = process.env.SNAPTRADE_CLIENT_SECRET;
const SNAPTRADE_REDIRECT_URI = process.env.SNAPTRADE_REDIRECT_URI || "http://localhost:3000/api/snaptrade/callback";

// ─── Generate Snaptrade OAuth URL for user ─────────────────────────────────────

export async function getSnaptradeOAuthUrl(userId: string): Promise<string> {
  if (!SNAPTRADE_CLIENT_ID) {
    throw new Error("Snaptrade client ID not configured");
  }

  // Generate a state token for CSRF protection
  const state = Buffer.from(JSON.stringify({ userId, nonce: Math.random() })).toString("base64");

  const params = new URLSearchParams({
    client_id: SNAPTRADE_CLIENT_ID,
    redirect_uri: SNAPTRADE_REDIRECT_URI,
    response_type: "code",
    state: state,
    scope: "accounts:read investments:read", // Request scopes for reading accounts and investments
  });

  return `https://app.snaptrade.com/oauth2/authorize?${params.toString()}`;
}

// ─── Handle OAuth callback and exchange code for token ──────────────────────────

export async function handleSnaptradeCallback(
  code: string,
  state: string,
  userId: string
): Promise<{ success: boolean; accountId?: string; error?: string }> {
  if (!SNAPTRADE_CLIENT_ID || !SNAPTRADE_CLIENT_SECRET) {
    return { success: false, error: "Snaptrade credentials not configured" };
  }

  try {
    // Verify state token
    const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
    if (decodedState.userId !== userId) {
      return { success: false, error: "Invalid state token" };
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${SNAPTRADE_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${SNAPTRADE_CLIENT_ID}:${SNAPTRADE_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: SNAPTRADE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      return { success: false, error: `Token exchange failed: ${error}` };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Get user accounts from Snaptrade
    const accountsResponse = await fetch(`${SNAPTRADE_API_URL}/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!accountsResponse.ok) {
      return { success: false, error: "Failed to fetch Snaptrade accounts" };
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || [];

    if (accounts.length === 0) {
      return { success: false, error: "No investment accounts found on Snaptrade" };
    }

    // Use the first account or let user select
    const primaryAccount = accounts[0];
    const snaptradeAccountId = primaryAccount.account_id;
    const brokerageName = primaryAccount.brokerage_name || "Snaptrade";

    // Save the investment account to database
    const { data, error } = await supabase
      .from("investment_accounts")
      .insert({
        user_id: userId,
        provider: "snaptrade",
        snaptrade_account_id: snaptradeAccountId,
        brokerage_name: brokerageName,
        account_name: primaryAccount.account_name || "Investment Account",
        account_type: primaryAccount.account_type || "individual",
        is_active: true,
      } as never)
      .select()
      .single();

    if (error) {
      return { success: false, error: `Failed to save account: ${error.message}` };
    }

    // Store the access and refresh tokens securely (in a separate table ideally)
    // For now, we'll store them in a secure environment variable or in a separate encrypted table
    // TODO: Add snaptrade_tokens table with encrypted tokens

    return {
      success: true,
      accountId: (data as any).id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ─── Sync investments from Snaptrade ─────────────────────────────────────────────

export async function syncSnaptradeInvestments(
  investmentAccountId: string,
  userId: string,
  accessToken: string
): Promise<{ success: boolean; positionsCount?: number; error?: string }> {
  try {
    if (!accessToken) {
      return { success: false, error: "Snaptrade access token not available" };
    }

    // Get the investment account
    const { data: account, error: accountError } = await supabase
      .from("investment_accounts")
      .select("*")
      .eq("id", investmentAccountId)
      .eq("user_id", userId)
      .single();

    if (accountError || !account) {
      return { success: false, error: "Investment account not found" };
    }

    const snaptradeAccountId = (account as any).snaptrade_account_id;

    // Fetch holdings from Snaptrade API
    const holdingsResponse = await fetch(
      `${SNAPTRADE_API_URL}/accounts/${snaptradeAccountId}/holdings`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!holdingsResponse.ok) {
      return { success: false, error: "Failed to fetch holdings from Snaptrade" };
    }

    const holdingsData = await holdingsResponse.json();
    const holdings = holdingsData.holdings || [];

    // Delete existing positions for this account
    await supabase
      .from("investment_positions")
      .delete()
      .eq("investment_account_id", investmentAccountId)
      .eq("user_id", userId);

    // Insert new positions
    const positions = holdings.map((holding: any) => ({
      investment_account_id: investmentAccountId,
      user_id: userId,
      ticker_symbol: holding.ticker || holding.symbol,
      asset_name: holding.name || holding.ticker,
      asset_type: holding.asset_type || "stock",
      quantity: holding.quantity || 0,
      current_price: holding.price || 0,
      current_value: (holding.quantity || 0) * (holding.price || 0),
      currency: holding.currency || "USD",
    }));

    if (positions.length > 0) {
      const { error: insertError } = await supabase
        .from("investment_positions")
        .insert(positions as never);

      if (insertError) {
        return { success: false, error: `Failed to insert positions: ${insertError.message}` };
      }
    }

    // Update account totals
    const totalValue = holdings.reduce(
      (sum: number, h: any) => sum + ((h.quantity || 0) * (h.price || 0)),
      0
    );

    await supabase
      .from("investment_accounts")
      .update({
        total_value: totalValue,
        last_synced_at: new Date().toISOString(),
      } as never)
      .eq("id", investmentAccountId);

    return {
      success: true,
      positionsCount: positions.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ─── Get Snaptrade investment accounts for user ───────────────────────────────────

export async function getSnaptradeAccounts(userId: string): Promise<InvestmentAccount[]> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "snaptrade")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as InvestmentAccount[];
}

// ─── Disconnect Snaptrade account ────────────────────────────────────────────────

export async function disconnectSnaptradeAccount(accountId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("investment_accounts")
    .update({ is_active: false } as never)
    .eq("id", accountId)
    .eq("user_id", userId)
    .eq("provider", "snaptrade");

  if (error) throw new Error(error.message);

  // Delete associated positions
  await supabase
    .from("investment_positions")
    .delete()
    .eq("investment_account_id", accountId);

  return true;
}

// ─── Manual token refresh (for long-lived sessions) ────────────────────────────────

export async function refreshSnaptradeToken(refreshToken: string): Promise<string | null> {
  if (!SNAPTRADE_CLIENT_ID || !SNAPTRADE_CLIENT_SECRET) {
    throw new Error("Snaptrade credentials not configured");
  }

  try {
    const response = await fetch(`${SNAPTRADE_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${SNAPTRADE_CLIENT_ID}:${SNAPTRADE_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch {
    return null;
  }
}
