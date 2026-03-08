"use server";

import supabase from "@/lib/db";
import type {
  ConnectedApp,
  CreateConnectedAppInput,
  UpdateConnectedAppInput,
} from "@/lib/types/database";

export async function getConnectedApps(userId: string): Promise<ConnectedApp[]> {
  const { data, error } = await supabase
    .from("connected_apps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getConnectedApp(id: string, userId: string): Promise<ConnectedApp | null> {
  const { data, error } = await supabase
    .from("connected_apps")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createConnectedApp(input: CreateConnectedAppInput): Promise<ConnectedApp> {
  const { data, error } = await supabase
    .from("connected_apps")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateConnectedApp(
  id: string,
  userId: string,
  input: UpdateConnectedAppInput,
): Promise<ConnectedApp | null> {
  const { data, error } = await supabase
    .from("connected_apps")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function markAppSynced(id: string, userId: string): Promise<ConnectedApp | null> {
  const { data, error } = await supabase
    .from("connected_apps")
    .update({ last_synced_at: new Date().toISOString(), status: "active" })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteConnectedApp(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("connected_apps")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}
