"use server";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvestmentPosition = Database["public"]["Tables"]["investment_positions"]["Row"];
type InvestmentPositionInsert = Omit<InvestmentPosition, "id" | "created_at">;
type InvestmentPositionUpdate = Partial<InvestmentPositionInsert>;

type WellnessScore = Database["public"]["Tables"]["wellness_scores"]["Row"];
type WellnessScoreInsert = Omit<WellnessScore, "id" | "calculated_at">;

export type PortfolioBreakdownItem = {
  label: string;
  value: number;
  type: string;
  source: string;
};

export type SpendingCategoryItem = {
  category: string;
  amount: number;
  color: string;
};

// ─── Investment Positions ─────────────────────────────────────────────────────

export async function getInvestmentPositions(userId: string): Promise<InvestmentPosition[]> {
  const { data, error } = await supabase
    .from("investment_positions")
    .select("*")
    .eq("user_id", userId)
    .order("current_value", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getPositionsByAccount(
  investmentAccountId: string,
): Promise<InvestmentPosition[]> {
  const { data, error } = await supabase
    .from("investment_positions")
    .select("*")
    .eq("investment_account_id", investmentAccountId)
    .order("current_value", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createInvestmentPosition(
  input: InvestmentPositionInsert,
): Promise<InvestmentPosition> {
  const { data, error } = await supabase
    .from("investment_positions")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as InvestmentPosition;
}

export async function updateInvestmentPosition(
  id: string,
  userId: string,
  input: InvestmentPositionUpdate,
): Promise<InvestmentPosition | null> {
  const { data, error } = await supabase
    .from("investment_positions")
    .update(input as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data as InvestmentPosition;
}

export async function deleteInvestmentPosition(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("investment_positions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

// ─── Portfolio Summary ────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  cash: "Cash & Deposits",
  equities: "Equities & ETFs",
  ETF: "Equities & ETFs",
  stock: "Equities & ETFs",
  unit_trust: "Unit Trusts",
  crypto: "Digital Assets",
  digital: "Digital Assets",
  property: "Property",
  other: "Other",
};

// Normalise raw asset_type strings into canonical groups
function normaliseType(raw: string | null): string {
  const t = (raw ?? "other").toLowerCase();
  if (t === "etf" || t === "stock" || t === "equities") return "equities";
  if (t === "crypto" || t === "digital") return "crypto";
  if (t === "unit_trust") return "unit_trust";
  if (t === "cash" || t === "depository") return "cash";
  if (t === "property") return "property";
  return "other";
}

export async function getTotalPortfolioValue(userId: string): Promise<number> {
  const { data: positions } = await supabase
    .from("investment_positions")
    .select("current_value")
    .eq("user_id", userId) as any;

  const { data: manualAssets } = await supabase
    .from("manual_assets")
    .select("estimated_value")
    .eq("user_id", userId) as any;

  const { data: banks } = await supabase
    .from("bank_accounts")
    .select("current_balance")
    .eq("user_id", userId)
    .eq("is_active", true) as any;

  return (
    (positions ?? []).reduce((s: number, p: any) => s + (p.current_value ?? 0), 0) +
    (manualAssets ?? []).reduce((s: number, a: any) => s + (a.estimated_value ?? 0), 0) +
    (banks ?? []).reduce((s: number, b: any) => s + (b.current_balance ?? 0), 0)
  );
}

export async function getPortfolioBreakdown(userId: string): Promise<PortfolioBreakdownItem[]> {
  const [{ data: banks }, { data: positions }, { data: accounts }, { data: manualAssets }] =
    await Promise.all([
      supabase
        .from("bank_accounts")
        .select("institution_name, current_balance")
        .eq("user_id", userId)
        .eq("is_active", true) as any,
      supabase
        .from("investment_positions")
        .select("asset_type, current_value, investment_account_id")
        .eq("user_id", userId) as any,
      supabase
        .from("investment_accounts")
        .select("id, brokerage_name")
        .eq("user_id", userId) as any,
      supabase
        .from("manual_assets")
        .select("asset_type, asset_name, estimated_value")
        .eq("user_id", userId) as any,
    ]);

  const accountMap = new Map((accounts ?? []).map((a: any) => [a.id, a.brokerage_name ?? ""]));
  const breakdown: PortfolioBreakdownItem[] = [];

  // Cash from bank accounts
  const cashTotal = (banks ?? []).reduce((s: number, b: any) => s + (b.current_balance ?? 0), 0);
  if (cashTotal > 0) {
    const bankNames = [...new Set((banks ?? []).map((b: any) => b.institution_name).filter(Boolean))];
    breakdown.push({
      label: "Cash & Deposits",
      value: cashTotal,
      type: "cash",
      source: bankNames.join(", ") + " (API)",
    });
  }

  // Investment positions grouped by normalised type
  const grouped: Record<string, { value: number; sources: Set<string> }> = {};
  for (const p of positions ?? []) {
    const norm = normaliseType(p.asset_type);
    if (!grouped[norm]) grouped[norm] = { value: 0, sources: new Set() };
    grouped[norm].value += p.current_value ?? 0;
    const src = accountMap.get(p.investment_account_id ?? "");
    if (src) grouped[norm].sources.add(src);
  }
  for (const [typeKey, { value, sources }] of Object.entries(grouped)) {
    // @ts-ignore - Type inference issue with Object.entries
    breakdown.push({
      label: TYPE_LABEL[typeKey] ?? typeKey,
      value,
      type: typeKey,
      source: Array.from(sources).join(", ") + " (API)",
    });
  }

  // Manual assets grouped by type
  const manualGrouped: Record<string, { label: string; value: number }> = {};
  for (const a of manualAssets ?? []) {
    const norm = normaliseType(a.asset_type);
    if (!manualGrouped[norm]) manualGrouped[norm] = { label: TYPE_LABEL[norm] ?? a.asset_name, value: 0 };
    manualGrouped[norm].value += a.estimated_value;
  }
  for (const [typeKey, { label, value }] of Object.entries(manualGrouped)) {
    // @ts-ignore - Type inference issue with Object.entries
    breakdown.push({ label, value, type: typeKey, source: "Manual Input" });
  }

  return breakdown.sort((a, b) => b.value - a.value);
}

// ─── Spending Categories (aggregated from transactions) ───────────────────────

// Normalise DB category names to display names
const CATEGORY_NORMALISE: Record<string, string> = {
  "Food and Drink": "Food & Dining",
  "Food & Drink": "Food & Dining",
  "Transportation": "Transport",
  "Housing": "Utilities",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#F06060",
  Shopping: "#C8A84B",
  Transport: "#4E9EF5",
  Subscriptions: "#9B7FEA",
  Utilities: "#00C2A3",
  Entertainment: "#4FCE8A",
  Transfer: "#7A90B0",
};

export async function getSpendingCategories(userId: string): Promise<SpendingCategoryItem[]> {
  const { data: txns } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("user_id", userId)
    .lt("amount", 0) as any; // expenses only (negative)

  const grouped: Record<string, number> = {};
  for (const t of txns ?? []) {
    const raw = t.category ?? "Other";
    const cat = CATEGORY_NORMALISE[raw] ?? raw;
    grouped[cat] = (grouped[cat] ?? 0) + Math.abs(t.amount);
  }

  return Object.entries(grouped)
    .map(([categoryKey, amount]) => ({
      category: categoryKey,
      amount,
      color: CATEGORY_COLORS[categoryKey as keyof typeof CATEGORY_COLORS] ?? "#7A90B0",
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ─── Wellness Scores ──────────────────────────────────────────────────────────

export async function getLatestWellnessScore(userId: string): Promise<WellnessScore | null> {
  const { data, error } = await supabase
    .from("wellness_scores")
    .select("*")
    .eq("user_id", userId)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function upsertWellnessScore(input: WellnessScoreInsert): Promise<WellnessScore> {
  const { data, error } = await supabase
    .from("wellness_scores")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as WellnessScore;
}

// ─── Transactions (Manual Input) ───────────────────────────────────────────────

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Omit<Transaction, "id" | "created_at">;
type TransactionUpdate = Partial<TransactionInsert>;

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getTransaction(id: string, userId: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createTransaction(input: TransactionInsert): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function updateTransaction(
  id: string,
  userId: string,
  input: TransactionUpdate,
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .update(input as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data as Transaction;
}

export async function deleteTransaction(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

// ─── Manual Assets ────────────────────────────────────────────────────────────

type ManualAsset = Database["public"]["Tables"]["manual_assets"]["Row"];
type ManualAssetInsert = Omit<ManualAsset, "id" | "created_at" | "updated_at">;
type ManualAssetUpdate = Partial<ManualAssetInsert>;

export async function getManualAssets(userId: string): Promise<ManualAsset[]> {
  const { data, error } = await supabase
    .from("manual_assets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getManualAsset(id: string, userId: string): Promise<ManualAsset | null> {
  const { data, error } = await supabase
    .from("manual_assets")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createManualAsset(input: ManualAssetInsert): Promise<ManualAsset> {
  const { data, error } = await supabase
    .from("manual_assets")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ManualAsset;
}

export async function updateManualAsset(
  id: string,
  userId: string,
  input: ManualAssetUpdate,
): Promise<ManualAsset | null> {
  const { data, error } = await supabase
    .from("manual_assets")
    .update(input as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data as ManualAsset;
}

export async function deleteManualAsset(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("manual_assets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}
