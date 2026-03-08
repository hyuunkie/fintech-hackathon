"use server";

import supabase from "@/lib/db";
import type { Goal, CreateGoalInput, UpdateGoalInput } from "@/lib/types/database";

export async function getGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("deadline", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getGoal(id: string, userId: string): Promise<Goal | null> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateGoal(
  id: string,
  userId: string,
  input: UpdateGoalInput,
): Promise<Goal | null> {
  const { data, error } = await supabase
    .from("goals")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function addToGoalProgress(
  id: string,
  userId: string,
  amount: number,
): Promise<Goal | null> {
  // Fetch current, then update
  const goal = await getGoal(id, userId);
  if (!goal) return null;

  const newAmount = parseFloat(goal.current_amount) + amount;
  const isCompleted = newAmount >= parseFloat(goal.target_amount);

  return updateGoal(id, userId, {
    current_amount: newAmount.toString(),
    status: isCompleted ? "completed" : goal.status,
  });
}

export async function deleteGoal(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}
