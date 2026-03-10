# Snaptrade Integration - Quick Start Guide

## What's New

Your fintech app can now securely connect to Snaptrade brokerage accounts and automatically sync investment portfolios. Users can:

✅ Link their Snaptrade accounts with OAuth 2.0  
✅ View all linked brokerage accounts  
✅ Sync investment positions with one click  
✅ Track portfolio value from multiple brokers  
✅ Disconnect accounts securely  

---

## Getting Started (5 Minutes)

### 1. Get Snaptrade Credentials

Visit https://snaptrade.com/develop and:
1. Sign up for a developer account
2. Create a new application
3. Copy your **Client ID** and **Client Secret**
4. Set redirect URI to: `http://localhost:3000/api/snaptrade/callback`

### 2. Add to .env.local

```bash
SNAPTRADE_CLIENT_ID=your_client_id
SNAPTRADE_CLIENT_SECRET=your_client_secret
SNAPTRADE_REDIRECT_URI=http://localhost:3000/api/snaptrade/callback
```

### 3. Run Database Migration (Optional but Recommended)

Login to your Supabase dashboard and run this SQL in the SQL Editor:

```sql
-- Copy and paste the contents of migrations/001_create_snaptrade_tokens.sql

CREATE TABLE IF NOT EXISTS public.snaptrade_tokens (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  investment_account_id uuid not null references public.investment_accounts(id) on delete cascade,
  access_token        text not null,
  refresh_token       text,
  token_type          text default 'Bearer',
  expires_at          timestamptz,
  scope               text,
  is_active           boolean default true,
  last_used_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

CREATE INDEX idx_snaptrade_tokens_user_id 
ON public.snaptrade_tokens(user_id);

CREATE INDEX idx_snaptrade_tokens_account_id 
ON public.snaptrade_tokens(investment_account_id);

ALTER TABLE public.snaptrade_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tokens"
ON public.snaptrade_tokens
FOR ALL
USING (user_id = auth.uid());
```

### 4. Start the App

```bash
npm run dev
```

Visit `http://localhost:3000` and login.

### 5. Test the Integration

1. Go to **Portfolio** tab
2. Look for **🔗 Snaptrade Integration** section
3. Click **"Link Account"**
4. You'll be redirected to Snaptrade login
5. Authorize the app in the Snaptrade interface
6. Account will appear in the list after authorization
7. Click **"Sync Now"** to fetch investment positions

---

## What's Included

### Files Created

```
├── app/
│   ├── actions/
│   │   ├── snaptrade.ts              # Main OAuth & sync logic
│   │   └── snaptrade-tokens.ts       # Token management
│   └── api/
│       └── snaptrade/
│           ├── callback/
│           │   └── route.ts          # OAuth callback handler
│           └── sync/
│               └── route.ts          # Investment sync endpoint
├── components/
│   └── SnaptradeLinker.tsx           # UI for linking & managing accounts
├── migrations/
│   └── 001_create_snaptrade_tokens.sql  # Database migration
└── SNAPTRADE_SETUP.md                # Detailed setup guide
```

### Components Updated

- **page.tsx** - Added SnaptradeLinker to Portfolio section
- **.env.local** - Added Snaptrade configuration variables

---

## Architecture

### OAuth Flow
```
User → "Link Account" Button
  ↓
Frontend (getSnaptradeOAuthUrl)
  ↓
Snaptrade OAuth Server
  ↓
User Authorization
  ↓
Snaptrade OAuth Redirect
  ↓
Backend (handleSnaptradeCallback)
  ↓
Database (save account + token)
  ↓
Success Message to User
```

### Data Sync Flow
```
User → "Sync Now" Button
  ↓
Frontend (POST /api/snaptrade/sync)
  ↓
Backend (syncSnaptradeInvestments)
  ↓
Snaptrade API (fetch holdings)
  ↓
Database (insert investment_positions)
  ↓
Update account (total_value, last_synced_at)
  ↓
Success Message to User
```

---

## Key Features

### 🔐 Security
- **OAuth 2.0** - Industry-standard authentication
- **CSRF Protection** - State tokens prevent cross-site attacks
- **Row-Level Security** - Users only see their own data
- **Token Storage** - Encrypted at rest in database
- **Token Expiration** - Automatic detection and refresh

### 📊 Data Management
- **Account Linking** - Support for multiple brokerages
- **Position Tracking** - Auto-sync holdings from Snaptrade
- **Balance Caching** - Portfolio values stored locally
- **Timestamp Tracking** - Know when data was last updated

### 🎨 User Experience
- **One-Click Linking** - Simple OAuth flow
- **Real-Time Sync** - Immediate position updates
- **Status Indicators** - Loading, success, error states
- **Sync Confirmation** - Shows number of positions synced

### ⚡ Performance
- **Efficient Queries** - Indexed database lookups
- **Smart Caching** - Holdings cached in investment_positions table
- **Lazy Loading** - Components fetch data on demand
- **Parallel Processing** - Multiple accounts can be synced

---

## Common Tasks

### Link a Snaptrade Account

1. Go to Portfolio tab
2. Scroll to "🔗 Snaptrade Integration"
3. Click "Link Account"
4. Log in to Snaptrade
5. Authorize the application
6. You'll be redirected back with the account linked

### Sync Investments

1. Find the linked account in the list
2. Click "Sync Now" button
3. Wait for completion (1-3 seconds)
4. See message showing number of positions synced
5. Positions appear in the portfolio list below

### View Linked Accounts

- All linked accounts shown in the Snaptrade section
- Displays balance, type, and last sync time
- Green button = account is active and ready to sync

### Disconnect an Account

1. Find the account you want to remove
2. Click "Disconnect" button
3. Confirm deletion in the dialog
4. Account and all associated positions are removed

---

## Database Queries

### View All Linked Snaptrade Accounts

```sql
SELECT id, brokerage_name, total_value, currency, last_synced_at
FROM investment_accounts
WHERE provider = 'snaptrade'
AND is_active = true
ORDER BY created_at DESC;
```

### View Holdings for an Account

```sql
SELECT ticker_symbol, asset_name, quantity, current_price, current_value
FROM investment_positions
WHERE investment_account_id = 'account-uuid'
ORDER BY current_value DESC;
```

### Check Token Status

```sql
SELECT user_id, investment_account_id, is_active, expires_at, last_used_at
FROM snaptrade_tokens
WHERE is_active = true
ORDER BY created_at DESC;
```

### Total Portfolio Value

```sql
SELECT 
  SUM(total_value) as total_value,
  COUNT(DISTINCT id) as num_accounts
FROM investment_accounts
WHERE user_id = 'user-uuid'
AND is_active = true;
```

---

## Troubleshooting

### "Link Account" Button Does Nothing

**Check:**
- Are SNAPTRADE_CLIENT_ID and SNAPTRADE_CLIENT_SECRET set in .env.local?
- Did you restart the dev server after changing .env?
- Check browser console for errors (F12)

**Solution:**
```bash
npm run build  # Verify build succeeds
npm run dev    # Restart dev server
```

### Authorization Fails

**Check:**
- Is the redirect URI in .env.local identical to Snaptrade dashboard?
- Account → Settings → Authorized redirect URIs
- No trailing slashes or differences

**Solution:**
- Go to Snaptrade dev dashboard
- Update redirect URI to exactly: `http://localhost:3000/api/snaptrade/callback`

### No Holdings After Sync

**Possible causes:**
1. Account was just created (no positions yet)
2. Snaptrade API returned empty list
3. Sync didn't actually run

**Check:**
```sql
-- See if positions were inserted
SELECT COUNT(*) as num_positions
FROM investment_positions
WHERE investment_account_id = 'your-account-uuid';

-- Check last sync time
SELECT last_synced_at FROM investment_accounts
WHERE id = 'your-account-uuid';
```

### Token Expired Error

Tokens automatically refresh. If manual refresh needed:

```typescript
import { refreshSnaptradeTokenIfNeeded } from '@/app/actions/snaptrade-tokens';

await refreshSnaptradeTokenIfNeeded(
  accountId,
  userId,
  process.env.SNAPTRADE_CLIENT_ID!,
  process.env.SNAPTRADE_CLIENT_SECRET!,
  process.env.SNAPTRADE_API_URL!
);
```

---

## Production Deployment

### Before Going Live

1. **Get Production Credentials**
   - Register separate app with Snaptrade
   - Use production API endpoint (not sandbox)

2. **Update Redirect URI**
   ```
   https://yourdomain.com/api/snaptrade/callback
   ```

3. **Set Production Environment Variables**
   ```
   SNAPTRADE_REDIRECT_URI=https://yourdomain.com/api/snaptrade/callback
   SNAPTRADE_API_URL=https://api.snaptrade.com/v1  (production)
   ```

4. **Database Backup**
   ```sql
   -- Test token table in production environment
   SELECT COUNT(*) FROM snaptrade_tokens;
   ```

5. **Monitor Syncs**
   - Log all sync operations
   - Set up alerts for sync failures
   - Monitor API rate limits

---

## Next Steps

- [ ] Complete setup with Snaptrade credentials
- [ ] Test account linking with sandbox account
- [ ] Verify sync works and shows holdings
- [ ] Run database migration for token storage
- [ ] Deploy to production environment
- [ ] Set up monitoring/logging
- [ ] Configure automated sync schedule (future)

---

## Need Help?

- **Snaptrade Docs**: https://snaptrade.com/docs
- **Setup Guide**: See SNAPTRADE_SETUP.md
- **API Docs**: Check app/actions/snaptrade.ts for function signatures

Good luck! 🚀
