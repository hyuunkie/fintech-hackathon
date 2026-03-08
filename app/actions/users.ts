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
