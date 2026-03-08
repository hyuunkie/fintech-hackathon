-- ============================================================
-- Wealth & Wellness Hub — Database Schema
-- Run this against your PostgreSQL database (Supabase / Neon)
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Connected Apps / Data Sources
CREATE TABLE IF NOT EXISTS connected_apps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,             -- "DBS Bank", "Interactive Brokers"
  app_type          TEXT NOT NULL,             -- bank | broker | crypto | property | other
  connection_method TEXT NOT NULL DEFAULT 'manual', -- api | csv | manual
  status            TEXT NOT NULL DEFAULT 'active', -- active | disconnected | error
  last_synced_at    TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goals & Milestones
CREATE TABLE IF NOT EXISTS goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT NOT NULL,               -- vehicle | travel | home | education | retirement | other
  target_amount  NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  deadline       DATE,
  priority       TEXT NOT NULL DEFAULT 'medium', -- low | medium | high
  status         TEXT NOT NULL DEFAULT 'active', -- active | completed | cancelled
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio Assets (current snapshot per asset class)
CREATE TABLE IF NOT EXISTS portfolio_assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connected_app_id  UUID REFERENCES connected_apps(id) ON DELETE SET NULL,
  label             TEXT NOT NULL,             -- "Equities & ETFs"
  asset_type        TEXT NOT NULL,             -- cash | equities | unit_trust | digital | property | other
  value             NUMERIC(15, 2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'SGD',
  source            TEXT,                      -- "Interactive Brokers (API)"
  color             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio History (monthly snapshots for chart)
CREATE TABLE IF NOT EXISTS portfolio_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  asset_type    TEXT NOT NULL,
  value         NUMERIC(15, 2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'SGD',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, snapshot_date, asset_type)
);

-- Spending categories with budgets
CREATE TABLE IF NOT EXISTS spending (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  amount       NUMERIC(10, 2) NOT NULL,
  budget       NUMERIC(10, 2) NOT NULL,
  period_month DATE NOT NULL,                  -- first day of the month
  color        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category, period_month)
);

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER connected_apps_updated_at
  BEFORE UPDATE ON connected_apps FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER portfolio_assets_updated_at
  BEFORE UPDATE ON portfolio_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER spending_updated_at
  BEFORE UPDATE ON spending FOR EACH ROW EXECUTE FUNCTION update_updated_at();
