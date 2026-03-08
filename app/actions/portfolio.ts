"use server";

import supabase from "@/lib/db";
import type {
  PortfolioAsset,
  PortfolioHistory,
  Spending,
  CreatePortfolioAssetInput,
  UpdatePortfolioAssetInput,
  UpsertPortfolioHistoryInput,
  UpsertSpendingInput,
  UpdateSpendingInput,
} from "@/lib/types/database";

// ─── Portfolio Assets ────────────────────────────────────────────────────────

export async function getPortfolioAssets(userId: string): Promise<PortfolioAsset[]> {
  const { data, error } = await supabase
    .from("portfolio_assets")
    .select("*")
    .eq("user_id", userId)
    .order("value", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getPortfolioAsset(id: string, userId: string): Promise<PortfolioAsset | null> {
  const { data, error } = await supabase
    .from("portfolio_assets")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function getTotalPortfolioValue(userId: string): Promise<number> {
  const assets = await getPortfolioAssets(userId);
  return assets.reduce((sum, a) => sum + parseFloat(a.value), 0);
}

export async function createPortfolioAsset(input: CreatePortfolioAssetInput): Promise<PortfolioAsset> {
  const { data, error } = await supabase
    .from("portfolio_assets")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePortfolioAsset(
  id: string,
  userId: string,
  input: UpdatePortfolioAssetInput,
): Promise<PortfolioAsset | null> {
  const { data, error } = await supabase
    .from("portfolio_assets")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deletePortfolioAsset(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("portfolio_assets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

// ─── Portfolio History ────────────────────────────────────────────────────────

export async function getPortfolioHistory(userId: string, months = 12): Promise<PortfolioHistory[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const { data, error } = await supabase
    .from("portfolio_history")
    .select("*")
    .eq("user_id", userId)
    .gte("snapshot_date", since.toISOString().split("T")[0])
    .order("snapshot_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertPortfolioHistory(input: UpsertPortfolioHistoryInput): Promise<PortfolioHistory> {
  const { data, error } = await supabase
    .from("portfolio_history")
    .upsert(input, { onConflict: "user_id,snapshot_date,asset_type" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePortfolioHistory(
  userId: string,
  snapshotDate: Date,
  assetType: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("portfolio_history")
    .delete()
    .eq("user_id", userId)
    .eq("snapshot_date", snapshotDate.toISOString().split("T")[0])
    .eq("asset_type", assetType);
  return !error;
}

// ─── Spending ────────────────────────────────────────────────────────────────

export async function getSpending(userId: string, periodMonth?: Date): Promise<Spending[]> {
  const month = periodMonth ?? new Date();
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("spending")
    .select("*")
    .eq("user_id", userId)
    .eq("period_month", firstOfMonth)
    .order("amount", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertSpending(input: UpsertSpendingInput): Promise<Spending> {
  const { data, error } = await supabase
    .from("spending")
    .upsert(input, { onConflict: "user_id,category,period_month" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSpending(
  id: string,
  userId: string,
  input: UpdateSpendingInput,
): Promise<Spending | null> {
  const { data, error } = await supabase
    .from("spending")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteSpending(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("spending")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}
