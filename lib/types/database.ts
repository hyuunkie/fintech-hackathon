export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
};

export type ConnectedApp = {
  id: string;
  user_id: string;
  name: string;
  app_type: "bank" | "broker" | "crypto" | "property" | "other";
  connection_method: "api" | "csv" | "manual";
  status: "active" | "disconnected" | "error";
  last_synced_at: Date | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: "vehicle" | "travel" | "home" | "education" | "retirement" | "other";
  target_amount: string; // postgres returns NUMERIC as string
  current_amount: string;
  deadline: Date | null;
  priority: "low" | "medium" | "high";
  status: "active" | "completed" | "cancelled";
  created_at: Date;
  updated_at: Date;
};

export type PortfolioAsset = {
  id: string;
  user_id: string;
  connected_app_id: string | null;
  label: string;
  asset_type: "cash" | "equities" | "unit_trust" | "digital" | "property" | "other";
  value: string; // NUMERIC as string
  currency: string;
  source: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
};

export type PortfolioHistory = {
  id: string;
  user_id: string;
  snapshot_date: Date;
  asset_type: string;
  value: string;
  currency: string;
  created_at: Date;
};

export type Spending = {
  id: string;
  user_id: string;
  category: string;
  amount: string;
  budget: string;
  period_month: Date;
  color: string | null;
  created_at: Date;
  updated_at: Date;
};

// Input types (omit auto-generated fields)
export type CreateUserInput = Pick<User, "email" | "name"> & { avatar_url?: string };
export type UpdateUserInput = Partial<Pick<User, "email" | "name" | "avatar_url">>;

export type CreateConnectedAppInput = Omit<ConnectedApp, "id" | "created_at" | "updated_at" | "last_synced_at"> & {
  last_synced_at?: Date;
};
export type UpdateConnectedAppInput = Partial<Omit<ConnectedApp, "id" | "user_id" | "created_at" | "updated_at">>;

export type CreateGoalInput = Omit<Goal, "id" | "created_at" | "updated_at">;
export type UpdateGoalInput = Partial<Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">>;

export type CreatePortfolioAssetInput = Omit<PortfolioAsset, "id" | "created_at" | "updated_at"> & {
  connected_app_id?: string;
};
export type UpdatePortfolioAssetInput = Partial<Omit<PortfolioAsset, "id" | "user_id" | "created_at" | "updated_at">>;

export type UpsertPortfolioHistoryInput = Omit<PortfolioHistory, "id" | "created_at">;

export type UpsertSpendingInput = Omit<Spending, "id" | "created_at" | "updated_at">;
export type UpdateSpendingInput = Partial<Pick<Spending, "amount" | "budget" | "color">>;
