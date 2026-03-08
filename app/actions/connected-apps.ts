"use server";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type BankAccount = Database["public"]["Tables"]["bank_accounts"]["Row"];
type BankAccountInsert = Omit<BankAccount, "id" | "created_at">;
type BankAccountUpdate = Partial<BankAccountInsert>;

type InvestmentAccount = Database["public"]["Tables"]["investment_accounts"]["Row"];
type InvestmentAccountInsert = Omit<InvestmentAccount, "id" | "created_at">;
type InvestmentAccountUpdate = Partial<InvestmentAccountInsert>;

type ManualAsset = Database["public"]["Tables"]["manual_assets"]["Row"];
type ManualAssetInsert = Omit<ManualAsset, "id" | "created_at" | "updated_at">;
type ManualAssetUpdate = Partial<ManualAssetInsert>;

// ─── Bank Accounts ────────────────────────────────────────────────────────────

export async function getBankAccounts(userId: string): Promise<BankAccount[]> {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getBankAccount(id: string, userId: string): Promise<BankAccount | null> {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createBankAccount(input: BankAccountInsert): Promise<BankAccount> {
  const { data, error } = await supabase
    .from("bank_accounts")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as BankAccount;
}

export async function updateBankAccount(
  id: string,
  userId: string,
  input: BankAccountUpdate,
): Promise<BankAccount | null> {
  const { data, error } = await supabase
    .from("bank_accounts")
    .update(input as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data as BankAccount;
}

export async function deleteBankAccount(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("bank_accounts")
    .update({ is_active: false } as never)
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

// ─── Investment Accounts ──────────────────────────────────────────────────────

export async function getInvestmentAccounts(userId: string): Promise<InvestmentAccount[]> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getInvestmentAccount(
  id: string,
  userId: string,
): Promise<InvestmentAccount | null> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createInvestmentAccount(
  input: InvestmentAccountInsert,
): Promise<InvestmentAccount> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as InvestmentAccount;
}

export async function updateInvestmentAccount(
  id: string,
  userId: string,
  input: InvestmentAccountUpdate,
): Promise<InvestmentAccount | null> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .update(input as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data as InvestmentAccount;
}

export async function deleteInvestmentAccount(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("investment_accounts")
    .update({ is_active: false } as never)
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

// ─── Manual Assets ────────────────────────────────────────────────────────────

export async function getManualAssets(userId: string): Promise<ManualAsset[]> {
  const { data, error } = await supabase
    .from("manual_assets")
    .select("*")
    .eq("user_id", userId)
    .order("estimated_value", { ascending: false });
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
