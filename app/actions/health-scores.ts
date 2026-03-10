"use server";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type WellnessScore = Database["public"]["Tables"]["wellness_scores"]["Row"];
type WellnessScoreInsert = Omit<WellnessScore, "id" | "calculated_at">;
type WellnessScoreUpdate = Partial<WellnessScoreInsert>;

// ─── Wellness Scores / Health Scores ───────────────────────────────────────────

export async function getWellnessScores(userId: string): Promise<WellnessScore[]> {
  const { data, error } = await supabase
    .from("wellness_scores")
    .select("*")
    .eq("user_id", userId)
    .order("calculated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

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

export async function getWellnessScore(id: string, userId: string): Promise<WellnessScore | null> {
  const { data, error } = await supabase
    .from("wellness_scores")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createWellnessScore(input: WellnessScoreInsert): Promise<WellnessScore> {
  const { data, error } = await supabase
    .from("wellness_scores")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as WellnessScore;
}

export async function deleteWellnessScore(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("wellness_scores")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

// ─── Health Score Calculation Helpers ──────────────────────────────────────────

export async function calculateHealthScore(userId: string): Promise<WellnessScore> {
  // Fetch user financial data
  const { data: user } = await supabase
    .from("users")
    .select("annual_income, cpf_oa_balance, cpf_sa_balance, cpf_ra_balance")
    .eq("id", userId)
    .single();

  const { data: investments } = await supabase
    .from("investment_positions")
    .select("current_value")
    .eq("user_id", userId);

  const { data: bankAccounts } = await supabase
    .from("bank_accounts")
    .select("current_balance")
    .eq("user_id", userId)
    .eq("is_active", true);

  // Calculate asset allocation and values
  const investmentTotal = (investments ?? []).reduce((sum: number, i: any) => sum + (i.current_value ?? 0), 0);
  const cashTotal = (bankAccounts ?? []).reduce((sum: number, b: any) => sum + (b.current_balance ?? 0), 0);
  const totalAssets = investmentTotal + cashTotal;

  // Get user data safely
  const userData = user as any || {};
  const annualIncome = userData.annual_income ?? 0;
  const cpfTotal = (userData.cpf_oa_balance ?? 0) + (userData.cpf_sa_balance ?? 0) + (userData.cpf_ra_balance ?? 0);

  // Calculate component scores (0-100 each)
  let overallScore = 50; // base score

  // Liquidity score - emergency fund coverage
  const monthlyIncome = annualIncome / 12;
  const monthlyNeed = monthlyIncome / 3; 
  let liquidityScore = 0;
  if (cashTotal >= monthlyNeed * 6) liquidityScore = 100;
  else if (cashTotal >= monthlyNeed * 3) liquidityScore = 75;
  else if (cashTotal >= monthlyNeed) liquidityScore = 50;
  else liquidityScore = 25;

  // Diversification score
  let diversificationScore = 50;
  if (totalAssets > 0) {
    const investmentRatio = investmentTotal / totalAssets;
    if (investmentRatio >= 0.4 && investmentRatio <= 0.7) diversificationScore = 100;
    else if (investmentRatio >= 0.2 && investmentRatio <= 0.8) diversificationScore = 75;
    else diversificationScore = 50;
  }

  // Savings rate score - based on CPF balance and income
  let savingsScore = 50;
  if (cpfTotal > annualIncome * 0.5) savingsScore = 100;
  else if (cpfTotal > annualIncome * 0.3) savingsScore = 75;
  else if (cpfTotal > 0) savingsScore = 50;

  // Debt score (no debt table yet, so default to positive)
  const debtScore = 80; // assumes healthy debt level

  // Update overall score
  overallScore = Math.round(
    (liquidityScore * 0.25 + diversificationScore * 0.25 + savingsScore * 0.25 + debtScore * 0.25)
  );

  const score: WellnessScoreInsert = {
    user_id: userId,
    overall_score: Math.min(100, Math.max(0, overallScore)),
    liquidity_score: liquidityScore,
    diversification_score: diversificationScore,
    savings_rate_score: savingsScore,
    debt_score: debtScore,
    milestone_score: 75, // default
    net_worth: totalAssets,
    total_assets: totalAssets,
    total_liabilities: 0, // no debt table yet
    monthly_income: monthlyIncome,
    monthly_expenses: 0, // would calculate from transactions
    emergency_fund_months: monthlyIncome > 0 ? cashTotal / monthlyIncome : 0,
    savings_rate_pct: monthlyIncome > 0 ? ((cpfTotal / 12) / monthlyIncome) * 100 : 0,
  };

  return await createWellnessScore(score);
}
