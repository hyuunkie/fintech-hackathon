"use server";

import { supabase } from "@/lib/supabase";

// ─── Income Tracking ──────────────────────────────────────────────────────────

export interface IncomeEntry {
  id: string;
  user_id: string;
  amount: number;
  income_type: string; // 'salary', 'bonus', 'investment_return', 'rental', 'freelance', 'other'
  source: string; // e.g. 'Company XYZ', 'Dividends', 'Property rental'
  income_date: string; // ISO date
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getIncomeEntries(userId: string): Promise<IncomeEntry[]> {
  const { data, error } = await supabase
    .from("income_entries")
    .select("*")
    .eq("user_id", userId)
    .order("income_date", { ascending: false });
  if (error) {
    console.error("Error fetching income entries:", error);
    return [];
  }
  return data || [];
}

export async function createIncomeEntry(input: Omit<IncomeEntry, "id" | "created_at" | "updated_at">): Promise<IncomeEntry | null> {
  const { data, error } = await supabase
    .from("income_entries")
    .insert({
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never)
    .select()
    .single();
  if (error) {
    console.error("Error creating income entry:", error);
    return null;
  }
  return data as IncomeEntry;
}

export async function updateIncomeEntry(
  id: string,
  userId: string,
  input: Partial<Omit<IncomeEntry, "id" | "created_at" | "user_id">>
): Promise<IncomeEntry | null> {
  const { data, error } = await supabase
    .from("income_entries")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) {
    console.error("Error updating income entry:", error);
    return null;
  }
  return data as IncomeEntry;
}

export async function deleteIncomeEntry(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("income_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("Error deleting income entry:", error);
    return false;
  }
  return true;
}

// ─── Financial Events ─────────────────────────────────────────────────────────

export interface FinancialEvent {
  id: string;
  user_id: string;
  event_type: string; // 'job_change', 'promotion', 'bonus', 'investment_purchase', 'debt_payoff', 'expense_event', 'life_event', 'other'
  title: string;
  description?: string;
  impact_amount?: number; // positive or negative financial impact
  event_date: string; // ISO date
  tags?: string[]; // e.g. ['important', 'completed']
  created_at: string;
  updated_at: string;
}

export async function getFinancialEvents(userId: string): Promise<FinancialEvent[]> {
  const { data, error } = await supabase
    .from("financial_events")
    .select("*")
    .eq("user_id", userId)
    .order("event_date", { ascending: false });
  if (error) {
    console.error("Error fetching financial events:", error);
    return [];
  }
  return data || [];
}

export async function createFinancialEvent(
  input: Omit<FinancialEvent, "id" | "created_at" | "updated_at">
): Promise<FinancialEvent | null> {
  const { data, error } = await supabase
    .from("financial_events")
    .insert({
      ...input,
      tags: input.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never)
    .select()
    .single();
  if (error) {
    console.error("Error creating financial event:", error);
    return null;
  }
  return data as FinancialEvent;
}

export async function updateFinancialEvent(
  id: string,
  userId: string,
  input: Partial<Omit<FinancialEvent, "id" | "created_at" | "user_id">>
): Promise<FinancialEvent | null> {
  const { data, error } = await supabase
    .from("financial_events")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) {
    console.error("Error updating financial event:", error);
    return null;
  }
  return data as FinancialEvent;
}

export async function deleteFinancialEvent(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("financial_events")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("Error deleting financial event:", error);
    return false;
  }
  return true;
}

// ─── Expense Tracking ─────────────────────────────────────────────────────────

export interface ExpenseTemplate {
  id: string;
  user_id: string;
  name: string; // e.g. 'Monthly Rent', 'Groceries'
  category: string;
  amount: number;
  frequency: string; // 'once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getExpenseTemplates(userId: string): Promise<ExpenseTemplate[]> {
  const { data, error } = await supabase
    .from("expense_templates")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching expense templates:", error);
    return [];
  }
  return data || [];
}

export async function createExpenseTemplate(
  input: Omit<ExpenseTemplate, "id" | "created_at" | "updated_at">
): Promise<ExpenseTemplate | null> {
  const { data, error } = await supabase
    .from("expense_templates")
    .insert({
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never)
    .select()
    .single();
  if (error) {
    console.error("Error creating expense template:", error);
    return null;
  }
  return data as ExpenseTemplate;
}

export async function updateExpenseTemplate(
  id: string,
  userId: string,
  input: Partial<Omit<ExpenseTemplate, "id" | "created_at" | "user_id">>
): Promise<ExpenseTemplate | null> {
  const { data, error } = await supabase
    .from("expense_templates")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) {
    console.error("Error updating expense template:", error);
    return null;
  }
  return data as ExpenseTemplate;
}

export async function deleteExpenseTemplate(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("expense_templates")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("Error deleting expense template:", error);
    return false;
  }
  return true;
}
