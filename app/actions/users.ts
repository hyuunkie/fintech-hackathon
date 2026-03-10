"use server";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Omit<User, "id" | "created_at" | "updated_at">;
type UserUpdate = Partial<UserInsert>;

export async function getUser(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error) return null;
  return data;
}


export async function createUser(input: UserInsert): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as User;
}

export async function updateUser(id: string, input: UserUpdate): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .update(input as never)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data as User;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from("users").delete().eq("id", id);
  return !error;
}

export async function getUserByAuthId(supabaseAuthId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("supabase_auth_id", supabaseAuthId)
    .single();
  if (error) return null;
  return data;
}

// ============================================================
// BANK ACCOUNTS
// ============================================================

type BankAccount = Database["public"]["Tables"]["bank_accounts"]["Row"];
type BankAccountInsert = {
  plaid_item_id: string;
  plaid_account_id: string;
  institution_name?: string | null;
  account_name?: string | null;
  account_type?: string | null;
  account_subtype?: string | null;
  current_balance?: number | null;
  available_balance?: number | null;
};
type BankAccountUpdate = Partial<Omit<BankAccount, "id" | "user_id" | "plaid_item_id" | "plaid_account_id" | "created_at" | "currency">>;

export async function getBankAccounts(userId: string): Promise<BankAccount[]> {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching bank accounts:", error);
    return [];
  }
  return data || [];
}

export async function getBankAccount(id: string): Promise<BankAccount | null> {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createBankAccount(userId: string, input: BankAccountInsert): Promise<BankAccount> {
  const { data, error } = await supabase
    .from("bank_accounts")
    .insert({ ...input, user_id: userId } as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as BankAccount;
}

export async function updateBankAccount(id: string, input: BankAccountUpdate): Promise<BankAccount | null> {
  const { data, error } = await supabase
    .from("bank_accounts")
    .update(input as never)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data as BankAccount;
}

export async function deleteBankAccount(id: string): Promise<boolean> {
  const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
  return !error;
}

// ============================================================
// INVESTMENT ACCOUNTS
// ============================================================

type InvestmentAccount = Database["public"]["Tables"]["investment_accounts"]["Row"];
type InvestmentAccountInsert = {
  provider: string;
  snaptrade_account_id?: string | null;
  brokerage_name?: string | null;
  account_name?: string | null;
  account_type?: string | null;
  total_value?: number | null;
  cash_balance?: number | null;
};
type InvestmentAccountUpdate = Partial<Omit<InvestmentAccount, "id" | "user_id" | "created_at" | "currency">>;

export async function getInvestmentAccounts(userId: string): Promise<InvestmentAccount[]> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching investment accounts:", error);
    return [];
  }
  return data || [];
}

export async function getInvestmentAccount(id: string): Promise<InvestmentAccount | null> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createInvestmentAccount(userId: string, input: InvestmentAccountInsert): Promise<InvestmentAccount> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .insert({ ...input, user_id: userId } as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as InvestmentAccount;
}

export async function updateInvestmentAccount(id: string, input: InvestmentAccountUpdate): Promise<InvestmentAccount | null> {
  const { data, error } = await supabase
    .from("investment_accounts")
    .update(input as never)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data as InvestmentAccount;
}

export async function deleteInvestmentAccount(id: string): Promise<boolean> {
  const { error } = await supabase.from("investment_accounts").delete().eq("id", id);
  return !error;
}
