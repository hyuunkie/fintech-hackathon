-- ============================================================
-- WEALTH WELLNESS HUB — Additional Tables Migration
-- Add income tracking, financial events, and expense templates
-- Run this in Supabase SQL Editor after the main schema
-- ============================================================

-- ============================================================
-- INCOME ENTRIES
-- Track all income sources manually
-- ============================================================
create table public.income_entries (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  
  amount              numeric(15,2) not null,
  income_type         text not null,    -- 'salary', 'bonus', 'investment_return', 'rental', 'freelance', 'other'
  source              text,              -- e.g. 'Company XYZ', 'Dividends'
  income_date         date not null,
  notes               text,
  
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- FINANCIAL EVENTS
-- Track major financial events (job changes, bonuses, etc.)
-- ============================================================
create table public.financial_events (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  
  event_type          text not null,    -- 'job_change', 'promotion', 'bonus', 'investment_purchase', 'debt_payoff', 'expense_event', 'life_event', 'other'
  title               text not null,
  description         text,
  impact_amount       numeric(15,2),     -- positive or negative financial impact
  event_date          date not null,
  tags                text[] default '{}',  -- Array for tagging events
  
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- EXPENSE TEMPLATES
-- Track recurring expense patterns
-- ============================================================
create table public.expense_templates (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  
  name                text not null,    -- e.g. 'Monthly Rent'
  category            text not null,
  amount              numeric(15,2) not null,
  frequency           text not null,    -- 'once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  is_active           boolean default true,
  
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on public.income_entries (user_id, income_date desc);
create index on public.income_entries (user_id, income_type);
create index on public.financial_events (user_id, event_date desc);
create index on public.financial_events (user_id, event_type);
create index on public.expense_templates (user_id, is_active);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.income_entries enable row level security;
alter table public.financial_events enable row level security;
alter table public.expense_templates enable row level security;

create policy "Users can manage own income entries"
  on public.income_entries for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can manage own financial events"
  on public.financial_events for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));

create policy "Users can manage own expense templates"
  on public.expense_templates for all
  using (user_id in (
    select id from public.users where supabase_auth_id = auth.uid()
  ));
