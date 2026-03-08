-- ============================================================
-- Seed Data — Wealth & Wellness Hub (matches actual schema)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── 1. User ──────────────────────────────────────────────────
INSERT INTO users (
  id, supabase_auth_id, full_name, email, date_of_birth, nationality,
  annual_income,
  cpf_oa_balance, cpf_sa_balance, cpf_ma_balance, cpf_ra_balance,
  onboarding_complete
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  NULL,
  'Amelia Tan',
  'amelia@example.com',
  '1992-04-15',
  'Singaporean',
  120000,
  85000, 42000, 18000, 0,
  true
) ON CONFLICT (id) DO NOTHING;

-- ── 2. Bank Accounts ─────────────────────────────────────────
INSERT INTO bank_accounts (
  id, user_id, plaid_item_id, plaid_account_id,
  institution_name, account_name, account_type, account_subtype,
  current_balance, available_balance, currency, is_active, last_synced_at
) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'plaid_item_dbs_001', 'plaid_acc_dbs_savings',
    'DBS Bank', 'DBS MySavings', 'depository', 'savings',
    92500, 92500, 'SGD', true, NOW() - INTERVAL '1 hour'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'plaid_item_dbs_001', 'plaid_acc_dbs_current',
    'DBS Bank', 'DBS Current Account', 'depository', 'checking',
    50000, 50000, 'SGD', true, NOW() - INTERVAL '1 hour'
  )
ON CONFLICT (id) DO NOTHING;

-- ── 3. Transactions ───────────────────────────────────────────
INSERT INTO transactions (
  user_id, bank_account_id, plaid_transaction_id,
  amount, currency, merchant_name, category, category_detail,
  transaction_date, description, is_pending
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_001', -85.50,  'SGD', 'Cold Storage',        'Food & Dining',  'Groceries',     '2026-03-07', 'Grocery shopping',      false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_002', -320.00, 'SGD', 'SP Group',            'Utilities',      'Electricity',   '2026-03-06', 'Monthly utilities',     false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_003', -45.00,  'SGD', 'Grab',                'Transport',      'Ride-hailing',  '2026-03-05', 'Grab rides',            false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_004', -180.00, 'SGD', 'Netflix / Spotify',   'Subscriptions',  'Streaming',     '2026-03-01', 'Monthly subscriptions', false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_005', -230.50, 'SGD', 'Zara',                'Shopping',       'Clothing',      '2026-03-04', 'Clothing purchase',     false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_006', -68.00,  'SGD', 'Odeon Cinemas',       'Entertainment',  'Movies',        '2026-03-02', 'Movie tickets',         false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_007', 10000,   'SGD', NULL,                  'Income',         'Salary',        '2026-03-01', 'Monthly salary',        false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_008', -42.00,  'SGD', 'Koufu',               'Food & Dining',  'Restaurant',    '2026-03-06', 'Lunch',                 false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_009', -15.80,  'SGD', 'EZ-Link Top-up',      'Transport',      'Public Transit','2026-03-03', 'MRT top-up',            false),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'txn_010', -550.00, 'SGD', 'Charles & Keith',     'Shopping',       'Clothing',      '2026-03-05', 'Shoes & bags',          true)
ON CONFLICT (id) DO NOTHING;

-- ── 4. Investment Accounts ────────────────────────────────────
INSERT INTO investment_accounts (
  id, user_id, provider, snaptrade_account_id,
  brokerage_name, account_name, account_type,
  total_value, cash_balance, currency, is_active, last_synced_at
) VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'snaptrade', 'snap_ibkr_001',
    'Interactive Brokers', 'IBKR Margin Account', 'margin',
    584200, 12000, 'SGD', true, NOW() - INTERVAL '2 hours'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'snaptrade', 'snap_endowus_001',
    'Endowus', 'Endowus Fund Smart', 'unit_trust',
    213000, 0, 'SGD', true, NOW() - INTERVAL '3 hours'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'snaptrade', 'snap_coinbase_001',
    'Coinbase', 'Coinbase Crypto', 'crypto',
    97400, 0, 'SGD', true, NOW() - INTERVAL '30 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ── 5. Investment Positions ───────────────────────────────────
INSERT INTO investment_positions (
  investment_account_id, user_id,
  ticker_symbol, asset_name, asset_type,
  quantity, average_cost, current_price, current_value, unrealised_gain_loss,
  currency, last_updated_at
) VALUES
  -- IBKR positions
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'VTI',  'Vanguard Total Stock Market ETF', 'ETF',
   180, 185.00, 240.50, 43290, 9990, 'USD', NOW()),

  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'AAPL', 'Apple Inc.', 'stock',
   120, 155.00, 211.00, 25320, 6720, 'USD', NOW()),

  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'MSFT', 'Microsoft Corporation', 'stock',
   85, 310.00, 415.00, 35275, 8925, 'USD', NOW()),

  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'QQQ',  'Invesco QQQ Trust', 'ETF',
   200, 380.00, 455.00, 91000, 15000, 'USD', NOW()),

  -- Endowus positions
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   NULL, 'LionGlobal All Seasons Fund', 'unit_trust',
   50000, 1.80, 2.20, 110000, 20000, 'SGD', NOW()),

  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   NULL, 'Dimensional Global Core Equity', 'unit_trust',
   35000, 2.50, 2.94, 103000, 15400, 'SGD', NOW()),

  -- Coinbase positions
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'BTC', 'Bitcoin', 'crypto',
   0.95, 55000, 88000, 83600, 31350, 'USD', NOW()),

  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'ETH', 'Ethereum', 'crypto',
   5.2, 2200, 2650, 13780, 2340, 'USD', NOW())

ON CONFLICT (id) DO NOTHING;

-- ── 6. Manual Assets ─────────────────────────────────────────
INSERT INTO manual_assets (
  user_id, asset_type, asset_name, estimated_value, currency,
  notes, property_address, outstanding_loan, last_valued_at
) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'property', 'HDB Flat — Bishan', 680000, 'SGD',
    '4-room HDB, purchased 2018',
    '123 Bishan Street 12, #08-45, Singapore 570123',
    285000, '2026-01-01'
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'other', 'Misc Assets', 18000, 'SGD',
    'Jewellery, collectibles',
    NULL, NULL, '2026-01-01'
  )
ON CONFLICT (id) DO NOTHING;

-- ── 7. Milestones ─────────────────────────────────────────────
INSERT INTO milestones (
  user_id, milestone_type, title,
  target_amount, current_amount, target_date,
  monthly_savings, projected_date, on_track, is_complete, notes
) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'vehicle', 'New Car',
    80000, 25000, '2026-12-31',
    2500, '2027-02-01', false, false,
    'BMW 3 Series or equivalent'
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'travel', 'Europe Vacation',
    8000, 5200, '2026-06-30',
    1400, '2026-06-01', true, false,
    '2-week trip, summer 2026'
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'home', 'Home Upgrade',
    50000, 12000, '2027-06-30',
    1500, '2027-07-01', true, false,
    'Kitchen and living room renovation'
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'emergency_fund', 'Emergency Fund',
    30000, 30000, NULL,
    0, NULL, true, true,
    '6 months of expenses'
  )
ON CONFLICT (id) DO NOTHING;

-- ── 8. Wellness Score ─────────────────────────────────────────
INSERT INTO wellness_scores (
  user_id, overall_score,
  liquidity_score, diversification_score, debt_score,
  savings_rate_score, milestone_score,
  net_worth, total_assets, total_liabilities,
  monthly_income, monthly_expenses,
  emergency_fund_months, savings_rate_pct
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  72,
  54, 72, 68,
  81, 75,
  1450100, 1735100, 285000,
  10000, 6500,
  4.6, 35.0
) ON CONFLICT (id) DO NOTHING;

-- ── 9. Insights ───────────────────────────────────────────────
INSERT INTO insights (
  user_id, insight_type, title, body, data_point, severity, is_dismissed
) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'liquidity', 'Liquidity could be improved',
    'Your liquid assets cover 4.6 months of expenses. Consider raising your cash buffer to 6 months for a stronger safety net.',
    '4.6 months', 'warning', false
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'diversification', 'Property is heavily weighted',
    'Property accounts for 39% of your portfolio. High concentration in illiquid assets increases risk.',
    '39%', 'warning', false
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'milestone', 'New Car goal needs attention',
    'At your current savings rate, your New Car goal is projected to complete in Feb 2027, 2 months after target.',
    'SGD 25,000 / 80,000', 'warning', false
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'savings', 'Great savings rate!',
    'You are saving 35% of your monthly income. This puts you well ahead of the recommended 20%.',
    '35%', 'positive', false
  )
ON CONFLICT (id) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────
-- SELECT 'users'              AS tbl, COUNT(*) FROM users              WHERE id = 'a0000000-0000-0000-0000-000000000001'
-- UNION ALL
-- SELECT 'bank_accounts',              COUNT(*) FROM bank_accounts              WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
-- UNION ALL
-- SELECT 'transactions',               COUNT(*) FROM transactions               WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
-- UNION ALL
-- SELECT 'investment_accounts',        COUNT(*) FROM investment_accounts        WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
-- UNION ALL
-- SELECT 'investment_positions',       COUNT(*) FROM investment_positions       WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
-- UNION ALL
-- SELECT 'manual_assets',              COUNT(*) FROM manual_assets              WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
-- UNION ALL
-- SELECT 'milestones',                 COUNT(*) FROM milestones                 WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
-- UNION ALL
-- SELECT 'wellness_scores',            COUNT(*) FROM wellness_scores            WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
-- UNION ALL
-- SELECT 'insights',                   COUNT(*) FROM insights                   WHERE user_id = 'a0000000-0000-0000-0000-000000000001';
