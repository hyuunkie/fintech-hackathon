"use server";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
type MilestoneInsert = Omit<Milestone, "id" | "created_at" | "updated_at">;
type MilestoneUpdate = Partial<MilestoneInsert>;

export async function getMilestones(userId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .order("target_date", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getMilestone(id: string, userId: string): Promise<Milestone | null> {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createMilestone(input: MilestoneInsert): Promise<Milestone> {
  const { data, error } = await supabase
    .from("milestones")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Milestone;
}

export async function updateMilestone(
  id: string,
  userId: string,
  input: MilestoneUpdate,
): Promise<Milestone | null> {
  const { data, error } = await supabase
    .from("milestones")
    .update(input as never)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data as Milestone;
}

export async function addToMilestoneProgress(
  id: string,
  userId: string,
  amount: number,
): Promise<Milestone | null> {
  const milestone = await getMilestone(id, userId);
  if (!milestone) return null;

  const newAmount = (milestone.current_amount ?? 0) + amount;
  const isComplete =
    milestone.target_amount !== null && newAmount >= milestone.target_amount;

  return updateMilestone(id, userId, {
    current_amount: newAmount,
    is_complete: isComplete,
  });
}

export async function deleteMilestone(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}
