-- ============================================================
-- Seed Data — Wealth & Wellness Hub
-- Run AFTER schema.sql
-- ============================================================

-- User
INSERT INTO users (id, email, name, avatar_url) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'amelia@example.com',
  'Amelia',
  null
) ON CONFLICT (email) DO NOTHING;

-- Connected Apps
INSERT INTO connected_apps (user_id, name, app_type, connection_method, status, last_synced_at, metadata) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'DBS Bank',             'bank',     'api',    'active',       NOW() - INTERVAL '1 hour',  '{"account_type": "savings"}'),
  ('a0000000-0000-0000-0000-000000000001', 'Interactive Brokers',  'broker',   'api',    'active',       NOW() - INTERVAL '2 hours', '{"account_type": "margin"}'),
  ('a0000000-0000-0000-0000-000000000001', 'Endowus',              'broker',   'api',    'active',       NOW() - INTERVAL '3 hours', '{"account_type": "unit_trust"}'),
  ('a0000000-0000-0000-0000-000000000001', 'Coinbase',             'crypto',   'api',    'active',       NOW() - INTERVAL '30 mins', '{"account_type": "exchange"}'),
  ('a0000000-0000-0000-0000-000000000001', 'Property (Manual)',    'property', 'manual', 'active',       NULL,                       '{"address": "123 Orchard Rd"}'),
  ('a0000000-0000-0000-0000-000000000001', 'CSV Import',           'other',    'csv',    'disconnected', NULL,                       '{"last_file": "misc_assets_feb.csv"}')
ON CONFLICT DO NOTHING;

-- Goals
INSERT INTO goals (user_id, name, description, category, target_amount, current_amount, deadline, priority, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'New Car',      'BMW 3 Series',         'vehicle',    80000,  25000, '2026-12-31', 'high',   'active'),
  ('a0000000-0000-0000-0000-000000000001', 'Vacation',     'Europe trip, summer',  'travel',      8000,   5200, '2026-06-30', 'medium', 'active'),
  ('a0000000-0000-0000-0000-000000000001', 'Home Upgrade', 'Kitchen + living room','home',       50000,  12000, '2027-06-30', 'medium', 'active'),
  ('a0000000-0000-0000-0000-000000000001', 'Emergency Fund','6 months expenses',   'other',      30000,  30000, NULL,         'high',   'completed')
ON CONFLICT DO NOTHING;

-- Portfolio Assets (current snapshot)
INSERT INTO portfolio_assets (user_id, label, asset_type, value, currency, source, color) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Cash & Deposits',  'cash',       142500, 'SGD', 'DBS Bank (API)',             '#4E9EF5'),
  ('a0000000-0000-0000-0000-000000000001', 'Equities & ETFs',  'equities',   584200, 'SGD', 'Interactive Brokers (API)',  '#00C2A3'),
  ('a0000000-0000-0000-0000-000000000001', 'Unit Trusts',      'unit_trust', 213000, 'SGD', 'Endowus (API)',              '#4FCE8A'),
  ('a0000000-0000-0000-0000-000000000001', 'Digital Assets',   'digital',     97400, 'SGD', 'Coinbase (API)',             '#C8A84B'),
  ('a0000000-0000-0000-0000-000000000001', 'Property',         'property',   680000, 'SGD', 'Manual Input',              '#9B7FEA'),
  ('a0000000-0000-0000-0000-000000000001', 'Other',            'other',       18000, 'SGD', 'CSV Import',                '#7A90B0')
ON CONFLICT DO NOTHING;

-- Portfolio History (monthly snapshots — last 8 months)
INSERT INTO portfolio_history (user_id, snapshot_date, asset_type, value, currency) VALUES
  ('a0000000-0000-0000-0000-000000000001', '2025-08-01', 'cash',       130000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-08-01', 'equities',   410000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-08-01', 'unit_trust', 180000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-08-01', 'digital',     45000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-08-01', 'property',   650000, 'SGD'),

  ('a0000000-0000-0000-0000-000000000001', '2025-09-01', 'cash',       135000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-09-01', 'equities',   450000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-09-01', 'unit_trust', 190000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-09-01', 'digital',     62000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-09-01', 'property',   655000, 'SGD'),

  ('a0000000-0000-0000-0000-000000000001', '2025-10-01', 'cash',       128000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-10-01', 'equities',   430000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-10-01', 'unit_trust', 185000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-10-01', 'digital',     55000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-10-01', 'property',   660000, 'SGD'),

  ('a0000000-0000-0000-0000-000000000001', '2025-11-01', 'cash',       140000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-11-01', 'equities',   500000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-11-01', 'unit_trust', 200000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-11-01', 'digital',     78000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-11-01', 'property',   665000, 'SGD'),

  ('a0000000-0000-0000-0000-000000000001', '2025-12-01', 'cash',       138000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-12-01', 'equities',   520000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-12-01', 'unit_trust', 205000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-12-01', 'digital',     82000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2025-12-01', 'property',   668000, 'SGD'),

  ('a0000000-0000-0000-0000-000000000001', '2026-01-01', 'cash',       141000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-01-01', 'equities',   555000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-01-01', 'unit_trust', 209000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-01-01', 'digital',     90000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-01-01', 'property',   672000, 'SGD'),

  ('a0000000-0000-0000-0000-000000000001', '2026-02-01', 'cash',       139000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-02-01', 'equities',   570000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-02-01', 'unit_trust', 211000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-02-01', 'digital',     94000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-02-01', 'property',   677000, 'SGD'),

  ('a0000000-0000-0000-0000-000000000001', '2026-03-01', 'cash',       142500, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-03-01', 'equities',   584200, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-03-01', 'unit_trust', 213000, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-03-01', 'digital',     97400, 'SGD'),
  ('a0000000-0000-0000-0000-000000000001', '2026-03-01', 'property',   680000, 'SGD')
ON CONFLICT (user_id, snapshot_date, asset_type) DO UPDATE SET value = EXCLUDED.value;

-- Spending (current month: March 2026)
INSERT INTO spending (user_id, category, amount, budget, period_month, color) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Food & Dining', 1200, 1500, '2026-03-01', '#F06060'),
  ('a0000000-0000-0000-0000-000000000001', 'Shopping',       800, 1000, '2026-03-01', '#C8A84B'),
  ('a0000000-0000-0000-0000-000000000001', 'Transport',      400,  500, '2026-03-01', '#4E9EF5'),
  ('a0000000-0000-0000-0000-000000000001', 'Subscriptions',  180,  200, '2026-03-01', '#9B7FEA'),
  ('a0000000-0000-0000-0000-000000000001', 'Utilities',      320,  400, '2026-03-01', '#00C2A3'),
  ('a0000000-0000-0000-0000-000000000001', 'Entertainment',  450,  600, '2026-03-01', '#4FCE8A')
ON CONFLICT (user_id, category, period_month) DO UPDATE SET
  amount = EXCLUDED.amount,
  budget = EXCLUDED.budget;

-- ============================================================
-- Quick verification queries — run these to confirm everything loaded
-- ============================================================
-- SELECT * FROM users;
-- SELECT * FROM connected_apps;
-- SELECT * FROM goals;
-- SELECT * FROM portfolio_assets ORDER BY value DESC;
-- SELECT COUNT(*) FROM portfolio_history;
-- SELECT * FROM spending WHERE period_month = '2026-03-01';
