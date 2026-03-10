# Snaptrade API Integration Guide

## Overview

This integration allows users to securely link their Snaptrade investment accounts and automatically sync their portfolio holdings to the Wealth & Wellness Hub.

### Features
- **OAuth 2.0 Authentication** - Secure user authorization with Snaptrade
- **Account Linking** - Users can link multiple Snaptrade brokerage accounts
- **Investment Sync** - Automatically fetch and cache investment positions from Snaptrade
- **Portfolio Tracking** - Display real-time portfolio values and holdings

---

## Prerequisites

1. **Snaptrade API Credentials**
   - Register for a Snaptrade developer account at https://snaptrade.com
   - Get your Client ID and Client Secret
   - Configure the OAuth 2.0 redirect URI

2. **Environment Setup**
   - Node.js 18+ 
   - PostgreSQL database (via Supabase)
   - Next.js 16+

---

## Setup Instructions

### Step 1: Get Snaptrade Credentials

1. Visit https://snaptrade.com/developers
2. Create an account and register your application
3. Configure OAuth settings:
   - **Redirect URI**: `http://localhost:3000/api/snaptrade/callback` (dev)
   - **Scopes**: `accounts:read investments:read`
4. Note your **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
# Snaptrade Configuration
SNAPTRADE_API_URL=https://api.snaptrade.com/v1
SNAPTRADE_CLIENT_ID=your_client_id_from_dashboard
SNAPTRADE_CLIENT_SECRET=your_client_secret_from_dashboard
SNAPTRADE_REDIRECT_URI=http://localhost:3000/api/snaptrade/callback
NEXT_PUBLIC_SNAPTRADE_ACCESS_TOKEN=your_access_token_for_testing
```

**Important Security Notes:**
- Never commit `.env.local` to version control
- Store production secrets in environment variables only
- Rotate CLIENT_SECRET periodically
- Use HTTPS for production redirect URI

### Step 3: Database Setup

The database schema is already configured with:
- `investment_accounts` table (stores linked Snaptrade accounts)
- `investment_positions` table (stores holdings from each account)
- Fields: `snaptrade_account_id`, `provider`, `brokerage_name`, etc.

### Step 4: Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## How It Works

### OAuth Flow

```
User clicks "Link Account"
    ↓
Frontend calls getSnaptradeOAuthUrl(userId)
    ↓
User is redirected to Snaptrade login
    ↓
User authorizes the app
    ↓
Snaptrade redirects to /api/snaptrade/callback with auth code
    ↓
Backend exchanges code for access token
    ↓
Backend fetches user's Snaptrade accounts
    ↓
Account data saved to database
    ↓
User redirected back to Portfolio tab with confirmation
```

### Data Sync Flow

```
User clicks "Sync Now" on linked account
    ↓
Frontend calls /api/snaptrade/sync with accountId
    ↓
Backend fetches holdings from Snaptrade API
    ↓
Backend deletes old investment_positions for this account
    ↓
Backend inserts new positions from Snaptrade
    ↓
Account last_synced_at timestamp is updated
    ↓
User sees success message with position count
```

---

## API Implementation

### Server Actions (`app/actions/snaptrade.ts`)

#### `getSnaptradeOAuthUrl(userId: string)`
Generates the OAuth authorization URL for the user.

```typescript
const oAuthUrl = await getSnaptradeOAuthUrl(userId);
window.location.href = oAuthUrl;
```

#### `handleSnaptradeCallback(code, state, userId)`
Handles OAuth callback, exchanges auth code for token, and saves account.

**Response:**
```json
{
  "success": true,
  "accountId": "account-uuid"
}
```

#### `syncSnaptradeInvestments(accountId, userId, accessToken)`
Syncs investment positions from Snaptrade to the database.

**Response:**
```json
{
  "success": true,
  "positionsCount": 15,
  "message": "Successfully synced 15 investment positions"
}
```

#### `getSnaptradeAccounts(userId)`
Retrieves all linked Snaptrade accounts for a user.

**Response:**
```json
[
  {
    "id": "account-uuid",
    "brokerage_name": "Webull",
    "total_value": 50000,
    "currency": "USD",
    "last_synced_at": "2026-03-11T10:30:00Z"
  }
]
```

#### `disconnectSnaptradeAccount(accountId, userId)`
Disconnects a Snaptrade account and removes associated positions.

### API Routes

#### POST `/api/snaptrade/callback`
Handles OAuth redirects from Snaptrade.

**Query Parameters:**
- `code`: Authorization code from Snaptrade
- `state`: CSRF protection token
- `error`: (optional) Error code if authorization failed

#### GET `/api/snaptrade/sync`
Triggers investment position synchronization.

**Body:**
```json
{
  "accountId": "account-uuid",
  "userId": "user-uuid",
  "accessToken": "snaptrade-access-token"
}
```

---

## UI Components

### SnaptradeLinker Component

Located at `components/SnaptradeLinker.tsx`

**Features:**
- Display all linked Snaptrade accounts
- Show account balance, type, and last sync time
- "Link Account" button to start OAuth flow
- "Sync Now" button for each account
- "Disconnect" button with confirmation
- Loading and error states
- Real-time sync progress indicator

**Usage:**
```jsx
import SnaptradeLinker from '@/components/SnaptradeLinker';

<SnaptradeLinker userId={userId} />
```

---

## Database Schema

### investment_accounts Table

```sql
id                  uuid (primary key)
user_id             uuid (foreign key to users)
provider            text ('snaptrade')
snaptrade_account_id text (from Snaptrade API)
brokerage_name      text ('Webull', 'Moomoo', etc.)
account_name        text
account_type        text ('individual', 'joint', etc.)
total_value         numeric (cached from API)
cash_balance        numeric (cached from API)
currency            text ('USD', 'SGD', etc.)
is_active           boolean
last_synced_at      timestamptz
created_at          timestamptz
```

### investment_positions Table

```sql
id                      uuid (primary key)
investment_account_id   uuid (foreign key)
user_id                 uuid (foreign key)
ticker_symbol           text (from Snaptrade)
asset_name              text
asset_type              text ('stock', 'bond', 'crypto', etc.)
quantity                numeric
average_cost            numeric
current_price           numeric
current_value           numeric (quantity * price)
unrealised_gain_loss    numeric
currency                text
last_updated_at         timestamptz
created_at              timestamptz
```

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Snaptrade client ID not configured" | Missing env variable | Add SNAPTRADE_CLIENT_ID to .env.local |
| "Token exchange failed" | Invalid auth code | Ensure redirect URI matches in Snaptrade dashboard |
| "Failed to fetch holdings" | Access token expired | Implement token refresh logic |
| "Invalid state token" | CSRF protection failed | Ensure state matches in request |
| "No investment accounts found" | User has no Snaptrade accounts | Guide user to create account on Snaptrade |

### Logging

All API calls include detailed error messages. Check server logs for:
```
[Snaptrade] Token exchange failed: {...}
[Snaptrade] Sync completed: 15 positions
[Snaptrade] Access token expired, refreshing...
```

---

## Security Best Practices

### Token Management

1. **Access Tokens** - Short-lived (1-2 hours)
   - Fetch fresh token before each API call
   - Never store in localStorage
   
2. **Refresh Tokens** - Long-lived (30+ days)
   - Store in secure HTTP-only cookies (recommended future improvement)
   - Use for obtaining new access tokens
   
3. **State Tokens** - One-time CSRF prevention
   - Generate random state for each OAuth request
   - Validate state in callback handler
   - Hash NRIC/sensitive data (see schema.sql)

### Data Protection

- All Snaptrade data is synced to PostgreSQL with RLS enabled
- User can only see their own account data
- Sensitive fields like NRIC stored as SHA-256 hashes
- All API calls use HTTPS

---

## Performance Considerations

### Sync Timing
- Initial sync: ~2-5 seconds per account (API latency dependent)
- Subsequent syncs: ~1-3 seconds (database operations)
- Recommended sync interval: Every 30 minutes to 1 hour

### Caching
- Holdings cached in `investment_positions` table
- `last_synced_at` timestamp tracks currency
- Consider Redis for multi-user scenarios (future improvement)

### Rate Limits
- Snaptrade typically allows 100+ requests per minute
- Current implementation: 1 sync per user action
- No batch sync yet (future enhancement)

---

## Testing

### Manual Testing

1. **Link Account Flow**
   ```bash
   1. Navigate to Portfolio tab
   2. Click "Link Account"
   3. Log in to Snaptrade sandbox account
   4. Authorize the app
   5. Verify account appears in the list
   ```

2. **Sync Holdings**
   ```bash
   1. Click "Sync Now" on a linked account
   2. Wait for completion (~2-5 seconds)
   3. Verify positions appear in PortfolioCRUD section
   4. Check "Last Synced" timestamp updated
   ```

3. **Disconnect Account**
   ```bash
   1. Click "Disconnect"
   2. Confirm removal
   3. Verify account removed from list
   4. Check positions deleted from database
   ```

### API Testing

```bash
# Get OAuth URL
curl -X POST http://localhost:3000/api/snaptrade/get-oauth-url \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-uuid"}'

# Sync investments
curl -X POST http://localhost:3000/api/snaptrade/sync \
  -H "Content-Type: application/json" \
  -d '{
    "accountId":"account-uuid",
    "userId":"user-uuid",
    "accessToken":"your-token"
  }'
```

---

## Future Enhancements

### Roadmap

- [ ] **Token Refresh** - Automatic refresh of expired access tokens
- [ ] **Webhook Support** - Real-time portfolio updates from Snaptrade
- [ ] **Batch Sync** - Sync multiple accounts in parallel
- [ ] **Trade History** - Import historical trades and dividends
- [ ] **Performance Alerts** - Notify on significant portfolio changes
- [ ] **Tax Reports** - Generate tax-compliant statements
- [ ] **Multi-Brokerage** - Support other brokerages (Alpaca, Interactive Brokers, etc.)
- [ ] **Redis Caching** - Cache portfolio data for faster access
- [ ] **Premium Features** - Advanced analytics and rebalancing tools

---

## Troubleshooting

### Account Won't Link

**Check:**
1. Is SNAPTRADE_CLIENT_ID set in .env.local?
2. Does redirect URI match exactly in Snaptrade dashboard?
3. Are you using the correct environment (sandbox vs production)?
4. Are there any TypeScript errors in the build?

```bash
npm run build
```

### Sync Returns Error

**Check:**
1. Is the access token valid? (Tokens expire after 1-2 hours)
2. Is the account still active on Snaptrade?
3. Does the user have at least one position?
4. Check server logs for detailed error message

```bash
# Tail logs (if using cloud deployment)
tail -f /var/log/app.log | grep Snaptrade
```

### No Holdings Appear After Sync

**Possible causes:**
1. Holdings weren't actually synced (check last_synced_at timestamp)
2. Snaptrade API returned empty holdings
3. Investment positions table wasn't updated

**Debug:**
```bash
# Check if table has data
SELECT COUNT(*) FROM investment_positions 
WHERE investment_account_id = 'your-account-uuid';
```

---

## Support & Documentation

- **Snaptrade Docs**: https://snaptrade.com/docs
- **Snaptrade API Reference**: https://api.snaptrade.com/docs
- **OAuth 2.0 Spec**: https://tools.ietf.org/html/rfc6749

---

## Changelog

### v1.0 (Initial Release - March 2026)
- ✅ OAuth 2.0 integration with Snaptrade
- ✅ Account linking and unlinking
- ✅ Investment position syncing  
- ✅ Portfolio balance tracking
- ✅ UI component for management

### Planned v1.1
- Auto token refresh
- Webhook support for real-time updates
- Batch import for historical data
