"use server";

import supabase from "@/lib/db";
import type { User, CreateUserInput, UpdateUserInput } from "@/lib/types/database";

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

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({ email: input.email, name: input.name, avatar_url: input.avatar_url ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from("users").delete().eq("id", id);
  return !error;
}
