-- ============================================================
-- SNAPTRADE TOKENS TABLE
-- Stores OAuth 2.0 tokens for Snaptrade API access
-- Run this migration to add token storage support
-- ============================================================

-- Create snaptrade_tokens table
CREATE TABLE IF NOT EXISTS public.snaptrade_tokens (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  investment_account_id uuid not null references public.investment_accounts(id) on delete cascade,
  
  -- OAuth Tokens (encrypted at rest recommended)
  access_token        text not null,          -- Short-lived token (1-2 hours)
  refresh_token       text,                   -- Long-lived token (30+ days)
  token_type          text default 'Bearer',  -- Usually 'Bearer'
  expires_at          timestamptz,            -- When access_token expires
  scope               text,                   -- OAuth scopes granted
  
  -- Metadata
  is_active           boolean default true,
  last_used_at        timestamptz,            -- Track token usage
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Create index for fast lookups
CREATE INDEX idx_snaptrade_tokens_user_id 
ON public.snaptrade_tokens(user_id);

CREATE INDEX idx_snaptrade_tokens_account_id 
ON public.snaptrade_tokens(investment_account_id);

-- Enable RLS for security
ALTER TABLE public.snaptrade_tokens ENABLE ROW LEVEL SECURITY;

-- Only users can see their own tokens
CREATE POLICY "Users can only access their own tokens"
ON public.snaptrade_tokens
FOR ALL
USING (user_id = auth.uid());

-- Vacuum and analyze
VACUUM ANALYZE public.snaptrade_tokens;

-- ============================================================
-- MIGRATION NOTES
-- ============================================================
-- 
-- To roll back this migration:
-- DROP TABLE IF EXISTS public.snaptrade_tokens;
--
-- To check if table exists:
-- SELECT * FROM information_schema.tables 
-- WHERE table_name = 'snaptrade_tokens';
--
-- To view token status:
-- SELECT user_id, investment_account_id, is_active, expires_at
-- FROM public.snaptrade_tokens
-- ORDER BY created_at DESC;
--
-- ============================================================
