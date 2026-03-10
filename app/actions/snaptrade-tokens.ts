"use server";

import { supabase } from "@/lib/supabase";

// ─── Token Management Functions ────────────────────────────────────────────

type SnaptradeToken = {
  id: string;
  user_id: string;
  investment_account_id: string;
  access_token: string;
  refresh_token: string | null;
  token_type: string;
  expires_at: string | null;
  scope: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Store Snaptrade OAuth tokens in the database
 */
export async function storeSnaptradeToken(
  userId: string,
  investmentAccountId: string,
  accessToken: string,
  refreshToken: string | null,
  expiresIn: number,
  scope: string
): Promise<SnaptradeToken | null> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { data, error } = await supabase
    .from("snaptrade_tokens")
    .insert({
      user_id: userId,
      investment_account_id: investmentAccountId,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_at: expiresAt,
      scope: scope,
      is_active: true,
    } as never)
    .select()
    .single();

  if (error) {
    console.error("Failed to store Snaptrade token:", error.message);
    return null;
  }

  return data as SnaptradeToken;
}

/**
 * Retrieve valid Snaptrade tokens for a user's account
 */
export async function getSnaptradeToken(
  accountId: string,
  userId: string
): Promise<SnaptradeToken | null> {
  const { data, error } = await supabase
    .from("snaptrade_tokens")
    .select("*")
    .eq("investment_account_id", accountId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  const token = data as SnaptradeToken;

  // Check if token is expired
  if (token.expires_at && new Date(token.expires_at) < new Date()) {
    // Token expired, mark as inactive
    await deactivateSnaptradeToken(token.id);
    return null;
  }

  return token;
}

/**
 * Update token after successful use
 */
export async function updateTokenLastUsed(tokenId: string): Promise<boolean> {
  const { error } = await supabase
    .from("snaptrade_tokens")
    .update({
      last_used_at: new Date().toISOString(),
    } as never)
    .eq("id", tokenId);

  return !error;
}

/**
 * Deactivate a Snaptrade token
 */
export async function deactivateSnaptradeToken(tokenId: string): Promise<boolean> {
  const { error } = await supabase
    .from("snaptrade_tokens")
    .update({
      is_active: false,
    } as never)
    .eq("id", tokenId);

  return !error;
}

/**
 * Refresh an expired Snaptrade token
 */
export async function refreshSnaptradeTokenIfNeeded(
  accountId: string,
  userId: string,
  clientId: string,
  clientSecret: string,
  apiUrl: string
): Promise<string | null> {
  const token = await getSnaptradeToken(accountId, userId);

  if (!token || !token.refresh_token) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
      }),
    });

    if (!response.ok) {
      // Refresh failed, deactivate the old token
      await deactivateSnaptradeToken(token.id);
      return null;
    }

    const newTokenData = await response.json();
    const newAccessToken = newTokenData.access_token;
    const newRefreshToken = newTokenData.refresh_token || token.refresh_token;
    const expiresIn = newTokenData.expires_in || 3600;

    // Store the new token
    await storeSnaptradeToken(
      userId,
      accountId,
      newAccessToken,
      newRefreshToken,
      expiresIn,
      token.scope || ""
    );

    // Deactivate the old token
    await deactivateSnaptradeToken(token.id);

    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

/**
 * Get all active tokens for a user
 */
export async function getUserSnaptradeTokens(userId: string): Promise<SnaptradeToken[]> {
  const { data, error } = await supabase
    .from("snaptrade_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data as SnaptradeToken[];
}

/**
 * Check if a token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(token: SnaptradeToken | null): boolean {
  if (!token || !token.expires_at) {
    return false;
  }

  const expiresAt = new Date(token.expires_at);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  return expiresAt < fiveMinutesFromNow;
}
