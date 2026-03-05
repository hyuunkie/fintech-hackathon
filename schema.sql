-- ============================================================
-- WEALTH WELLNESS HUB — Supabase Schema
-- Paste this entire file into Supabase SQL Editor and run it
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- Stores verified identity data pulled from MyInfo/Singpass
-- ============================================================
create table public.users (
  id                  uuid primary key default uuid_generate_v4(),
  supabase_auth_id    uuid unique references auth.users(id) on delete cascade,

  -- From MyInfo/Singpass
  full_name           text,
  nric_hash           text unique,        -- SHA-256 hash of NRIC, never store raw
  date_of_birth       date,
  nationality         text,
  email               text,

  -- Income & CPF (from MyInfo)
  annual_income       numeric(15,2),
  cpf_oa_balance      numeric(15,2),      -- Ordinary Account
  cpf_sa_balance      numeric(15,2),      -- Special Account
  cpf_ma_balance      numeric(15,2),      -- Medisave Account
  cpf_ra_balance      numeric(15,2),      -- Retirement Account
  cpf_data_updated_at timestamptz,

  -- App metadata
  onboarding_complete boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- BANK ACCOUNTS
-- Connected via Plaid / Open Banking API
-- ============================================================
create table public.bank_accounts (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,

  -- Plaid identifiers
  plaid_item_id       text not null,
  plaid_account_id    text not null unique,
  institution_name    text,               -- e.g. 'DBS', 'OCBC', 'UOB'
  account_name        text,
  account_type        text,               -- 'checking', 'savings', 'credit'
  account_subtype     text,

  -- Balances (refreshed on sync)
  current_balance     numeric(15,2),
  available_balance   numeric(15,2),
  currency            text default 'SGD',

  is_active           boolean default true,
  last_synced_at      timestamptz,
  created_at          timestamptz default now()
);

-- ============================================================
-- TRANSACTIONS
-- Pulled from Plaid — used for expenditure tracking
-- and behavioural finance insights
-- ============================================================
create table public.transactions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.users(id) on delete cascade,
  bank_account_id       uuid references public.bank_accounts(id) on delete cascade,

  -- From Plaid
  plaid_transaction_id  text unique,
  amount                numeric(15,2) not null,  -- negative = debit, positive = credit
  currency              text default 'SGD',
  merchant_name         text,
  category              text,                    -- e.g. 'Food and Drink'
  category_detail       text,                    -- e.g. 'Restaurants'
  transaction_date      date not null,
  description           text,
  is_pending            boolean default false,

  created_at            timestamptz default now()
);

-- ============================================================
-- INVESTMENT ACCOUNTS
-- Connected via SnapTrade (Webull, Moomoo, Tiger etc.)
-- ============================================================
create table public.investment_accounts (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.users(id) on delete cascade,

  -- Connection info
  provider              text not null,            -- 'snaptrade', 'webull'
  snaptrade_account_id  text,
  brokerage_name        text,                     -- e.g. 'Webull', 'Moomoo'
  account_name          text,
  account_type          text,                     -- 'individual', 'joint', 'retirement'

  -- Totals (cached, refreshed on sync)
  total_value           numeric(15,2),
  cash_balance          numeric(15,2),
  currency              text default 'USD',

  is_active             boolean default true,
  last_synced_at        timestamptz,
  created_at            timestamptz default now()
);

-- ============================================================
-- INVESTMENT POSITIONS
-- Individual holdings within an investment account
-- ============================================================
create table public.investment_positions (
  id                    uuid primary key default uuid_generate_v4(),
  investment_account_id uuid not null references public.investment_accounts(id) on delete cascade,
  user_id               uuid not null references public.users(id) on delete cascade,

  ticker_symbol         text,
  asset_name            text,
  asset_type            text,                     -- 'stock', 'etf', 'crypto', 'bond', 'cash'
  quantity              numeric(20,8),
  average_cost          numeric(15,4),
  current_price         numeric(15,4),
  current_value         numeric(15,2),
  unrealised_gain_loss  numeric(15,2),
  currency              text default 'USD',

  last_updated_at       timestamptz,
  created_at            timestamptz default now()
);

-- ============================================================
-- MANUAL ASSETS
-- User-entered assets: property, crypto, private investments
-- Anything that doesn't have an API
-- ============================================================
create table public.manual_assets (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,

  asset_type          text not null,              -- 'property', 'crypto', 'private_equity', 'vehicle', 'other'
  asset_name          text not null,              -- e.g. 'HDB Flat Tampines', 'Bitcoin', 'Startup equity'
  estimated_value     numeric(15,2) not null,
  currency            text default 'SGD',
  notes               text,

  -- Property specific fields
  property_address    text,
  outstanding_loan    numeric(15,2),              -- remaining mortgage balance

  last_valued_at      date,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- MILESTONES
-- Life goals: BTO, marriage, children, retirement etc.
-- Core feature — milestone planning with projection engine
-- ============================================================
create table public.milestones (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,

  milestone_type      text not null,              -- 'bto', 'marriage', 'child', 'retirement', 'education', 'custom'
  title               text not null,              -- e.g. 'Buy 4-room BTO in Tampines'
  target_amount       numeric(15,2),              -- total amount needed
  current_amount      numeric(15,2) default 0,    -- amount saved so far
  target_date         date,                       -- when they want to achieve it
  monthly_savings     numeric(15,2),              -- planned monthly contribution

  -- Computed by backend projection engine
  projected_date      date,                       -- when they'll hit target at current rate
  on_track            boolean,                    -- true if projected_date <= target_date

  is_complete         boolean default false,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- WELLNESS SCORES
-- Point-in-time snapshot of calculated financial health metrics
-- Stored historically so users can track progress over time
-- ============================================================
create table public.wellness_scores (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references public.users(id) on delete cascade,

  -- Overall score (0-100)
  overall_score           integer check (overall_score between 0 and 100),

  -- Component scores (each 0-100)
  liquidity_score         integer,   -- emergency fund coverage
  diversification_score   integer,   -- asset class spread
  debt_score              integer,   -- debt-to-asset ratio
  savings_rate_score      integer,   -- monthly savings % of income
  milestone_score         integer,   -- on-track toward goals

  -- Raw financial metrics (shown in UI)
  net_worth               numeric(15,2),
  total_assets            numeric(15,2),
  total_liabilities       numeric(15,2),
  monthly_income          numeric(15,2),
  monthly_expenses        numeric(15,2),
  emergency_fund_months   numeric(5,2),   -- months of expenses covered by liquid assets
  savings_rate_pct        numeric(5,2),   -- e.g. 24.5 for 24.5%

  calculated_at           timestamptz default now()
);

-- ============================================================
-- BEHAVIOURAL INSIGHTS
-- Rule-based observations about the user's financial patterns
-- All framed as education/awareness — NOT financial advice
-- ============================================================
create table public.insights (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,

  insight_type        text not null,   -- 'loss_aversion', 'present_bias', 'concentration_risk',
                                       -- 'payday_spike', 'emergency_fund_low', 'cpf_opportunity',
                                       -- 'positive_trend'
  title               text not null,   -- short headline shown in UI
  body                text not null,   -- educational explanation (never prescriptive)
  data_point          text,            -- specific number backing the insight e.g. '34% in tech'
  severity            text default 'info' check (severity in ('info', 'warning', 'positive')),

  is_dismissed        boolean default false,
  dismissed_at        timestamptz,

  generated_at        timestamptz default now()
);

-- ============================================================
-- SCENARIO SIMULATIONS
-- "What If" simulator — stores saved scenarios per user
-- Used for the scenario simulator feature
-- ============================================================
create table public.scenarios (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,

  scenario_name       text not null,              -- e.g. 'Invest my bonus', 'Job loss 3 months'
  scenario_type       text not null,              -- 'bonus_investment', 'job_loss', 'expense_cut',
                                                  -- 'market_crash', 'property_purchase', 'custom'

  -- Input parameters (what the user changed)
  parameters          jsonb not null default '{}',
  -- e.g. { "monthly_savings_delta": 300, "duration_months": 12 }
  -- e.g. { "job_loss_months": 3 }
  -- e.g. { "lump_sum_investment": 10000 }

  -- Computed output (calculated by backend)
  baseline_net_worth_10yr   numeric(15,2),        -- without the change
  scenario_net_worth_10yr   numeric(15,2),        -- with the change
  net_difference            numeric(15,2),        -- scenario - baseline
  summary_text              text,                 -- human-readable result

  created_at          timestamptz default now()
);



-- ============================================================
-- STRESS TEST RESULTS
-- Financial resilience test — how would user survive shocks?
-- ============================================================
create table public.stress_test_results (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,

  -- Each row = one shock scenario tested
  scenario_name       text not null,              -- 'job_loss_3m', 'job_loss_6m', 'medical_10k',
                                                  -- 'market_crash_30pct', 'property_drop_20pct'
  result              text not null check (result in ('safe', 'stressed', 'critical')),
  months_sustainable  numeric(5,1),               -- how long they could sustain this shock
  shortfall_amount    numeric(15,2),              -- how much they'd be short (if stressed/critical)
  summary_text        text,                       -- plain English explanation

  calculated_at       timestamptz default now()
);

-- ============================================================
-- INDEXES — speeds up the most common queries
-- ============================================================
create index on public.transactions (user_id, transaction_date desc);
create index on public.transactions (user_id, category);
create index on public.transactions (bank_account_id);
create index on public.investment_positions (investment_account_id);
create index on public.investment_positions (user_id, asset_type);
create index on public.wellness_scores (user_id, calculated_at desc);
create index on public.insights (user_id, is_dismissed, generated_at desc);
create index on public.milestones (user_id, milestone_type);
create index on public.scenarios (user_id, created_at desc);
create index on public.stress_test_results (user_id, calculated_at desc);


-- ============================================================
-- ROW LEVEL SECURITY
-- Ensures users can ONLY access their own data
-- Critical — enables before any real user data is stored
-- ============================================================
alter table public.users enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.investment_accounts enable row level security;
alter table public.investment_positions enable row level security;
alter table public.manual_assets enable row level security;
alter table public.milestones enable row level security;
alter table public.wellness_scores enable row level security;
alter table public.insights enable row level security;
alter table public.scenarios enable row level security;
alter table public.stress_test_results enable row level security;



-- User-specific RLS policies
create policy "Users can manage own profile"
  on public.users for all
  using (auth.uid() = supabase_auth_id);

create policy "Users can manage own bank accounts"
  on public.bank_accounts for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can manage own transactions"
  on public.transactions for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can manage own investment accounts"
  on public.investment_accounts for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can manage own investment positions"
  on public.investment_positions for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can manage own manual assets"
  on public.manual_assets for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can manage own milestones"
  on public.milestones for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can read own wellness scores"
  on public.wellness_scores for select
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can read and dismiss own insights"
  on public.insights for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can manage own scenarios"
  on public.scenarios for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can read own stress test results"
  on public.stress_test_results for select
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));


