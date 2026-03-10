"use server";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Insight = Database["public"]["Tables"]["insights"]["Row"];
type InsightInsert = Omit<Insight, "id" | "generated_at">;
type InsightUpdate = Partial<InsightInsert>;

// ─── Insights (Spending Patterns, Behavioral Observations) ─────────────────────

export async function getInsights(userId: string): Promise<Insight[]> {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getInsight(id: string, userId: string): Promise<Insight | null> {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createInsight(input: InsightInsert): Promise<Insight> {
  const { data, error } = await supabase
    .from("insights")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Insight;
}

export async function updateInsight(
  id: string,
  userId: string,
  input: InsightUpdate,
): Promise<Insight | null> {
  const { data, error } = await supabase
    .from("insights")
    .update(input as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data as Insight;
}

export async function dismissInsight(id: string, userId: string): Promise<Insight | null> {
  return updateInsight(id, userId, { is_dismissed: true, dismissed_at: new Date().toISOString() });
}

export async function deleteInsight(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("insights")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

// ─── Spending Stats (aggregated from transactions) ───────────────────────────

export async function getTotalSpendingThisMonth(userId: string): Promise<number> {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .lt("amount", 0) // expenses only (negative)
    .gte("transaction_date", firstDay.toISOString().split("T")[0])
    .lte("transaction_date", lastDay.toISOString().split("T")[0]);

  if (error) return 0;
  const transactions = data ?? [];
  return Math.abs(transactions.reduce((sum: number, t: any) => sum + (t.amount ?? 0), 0));
}

export async function getAverageDailySpending(userId: string, days: number = 30): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date();

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .lt("amount", 0)
    .gte("transaction_date", startDate.toISOString().split("T")[0])
    .lte("transaction_date", endDate.toISOString().split("T")[0]);

  if (error) return 0;
  const transactions = data ?? [];
  const total = Math.abs(transactions.reduce((sum: number, t: any) => sum + (t.amount ?? 0), 0));
  return days > 0 ? total / days : 0;
}
