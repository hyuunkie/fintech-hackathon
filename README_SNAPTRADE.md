# Snaptrade Integration - Setup & Usage Guide

## Quick Overview

Your fintech app now has **complete Snaptrade integration** that allows users to:

✅ **Link Snaptrade accounts** - Secure OAuth 2.0 authentication  
✅ **Sync investments** - Automatically fetch holdings from Snaptrade  
✅ **Track portfolios** - View balances and positions in the app  
✅ **Manage accounts** - Link/unlink multiple brokerage accounts  

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your Snaptrade Credentials

1. Go to https://snaptrade.com/develop
2. Sign up for a **developer account**
3. Create a new **application**
4. Copy your:
   - **Client ID**
   - **Client Secret**
5. Set **Redirect URI** to: `http://localhost:3000/api/snaptrade/callback`

### Step 2: Configure Environment Variables

Edit `.env.local` and add:

```bash
# Snaptrade OAuth Configuration
SNAPTRADE_API_URL=https://api.snaptrade.com/v1
SNAPTRADE_CLIENT_ID=your_client_id_here
SNAPTRADE_CLIENT_SECRET=your_client_secret_here
SNAPTRADE_REDIRECT_URI=http://localhost:3000/api/snaptrade/callback
```

**Don't forget to restart your dev server after editing .env.local:**

```bash
npm run dev
```

### Step 3: Test It Out

1. Open http://localhost:3000
2. Go to **Portfolio** tab
3. Find **🔗 Snaptrade Integration** section
4. Click **"Link Account"**
5. Log in with your Snaptrade account
6. Authorize the app
7. You'll be redirected back to see your linked account!

---

## 📊 How It Works

### For Users

```
User Flow:
  Link Account → Login to Snaptrade → Authorize App → Account Linked
  
  Then:
  View Account → Click "Sync Now" → See Holdings → Disconnect if needed
```

### Behind the Scenes

```
Technical Flow:
  
  1. OAuth Authorization
     User clicks "Link Account"
     ↓
     App redirects to Snaptrade OAuth server
     ↓
     User authorizes the app on Snaptrade
     ↓
     Snaptrade redirects back with authorization code
     ↓
     App exchanges code for access token
     ↓
     Token & account data saved to database
  
  2. Investment Sync
     User clicks "Sync Now"
     ↓
     App calls Snaptrade API with access token
     ↓
     Snaptrade returns list of holdings
     ↓
     App saves holdings to investment_positions table
     ↓
     User sees portfolio updated with latest data
```

---

## 🛠️ What Was Installed

### Files Created

```
Backend Logic:
├── app/actions/snaptrade.ts              # OAuth & sync functions
├── app/actions/snaptrade-tokens.ts       # Token management
├── app/api/snaptrade/callback/route.ts   # OAuth callback handler
└── app/api/snaptrade/sync/route.ts       # Sync endpoint

Frontend:
├── components/SnaptradeLinker.tsx        # Account management UI

Database:
└── migrations/001_create_snaptrade_tokens.sql  # Token storage table

Documentation:
├── SNAPTRADE_SETUP.md                    # Detailed setup guide
├── SNAPTRADE_QUICKSTART.md               # Quick reference
└── SNAPTRADE_IMPLEMENTATION.md           # Technical details
```

### Updates to Existing Files

- `app/page.tsx` - Added SnaptradeLinker to Portfolio section
- `.env.local` - Added Snaptrade configuration

---

## 🔐 Security Features

### OAuth 2.0
- ✅ Industry-standard secure authentication
- ✅ CSRF protection with state tokens
- ✅ Authorization codes (not credentials) in URLs
- ✅ Secure token exchange on backend

### Token Management
- ✅ Short-lived access tokens (1-2 hours)
- ✅ Long-lived refresh tokens for auto-renewal
- ✅ Automatic expiration detection
- ✅ Secure database storage with encryption-ready

### Data Protection
- ✅ Users only see their own accounts
- ✅ Row-level security on database
- ✅ No API credentials exposed to frontend
- ✅ All Snaptrade calls made server-side

---

## 💻 Using the Feature

### Link a Snaptrade Account

1. Navigate to **Portfolio** tab
2. Scroll to **🔗 Snaptrade Integration** section
3. Click **"Link Account"** button
4. You'll be redirected to Snaptrade login
5. Log in with your Snaptrade credentials
6. Click **"Authorize"** to grant access
7. You'll be redirected back to the app
8. Your account now appears in the list!

### Sync Your Investments

1. Find your linked account in the Snaptrade section
2. Click **"Sync Now"** button
3. Wait 1-3 seconds for sync to complete
4. You'll see: "Successfully synced X investment positions"
5. Your holdings now appear in the Portfolio section below
6. Scroll down to see all your synced investments

### View Account Details

Each linked account shows:
- **Brokerage Name** (Webull, Tiger, etc.)
- **Account Type** (Individual, Joint, etc.)
- **Total Value** (Portfolio balance in USD)
- **Last Synced** (When holdings were last updated)
- **Sync Button** (Click to update)
- **Disconnect Button** (Remove account)

### Disconnect an Account

1. Find the account you want to remove
2. Click **"Disconnect"** button
3. Confirm the deletion in the popup
4. Account and all holdings are removed
5. Data is cleared from the database

---

## 🐛 Troubleshooting

### "Link Account" Button Does Nothing

**Problem:** Button appears but nothing happens when clicked.

**Solutions:**
1. Check environment variables are set:
   ```bash
   # In .env.local, verify these exist:
   SNAPTRADE_CLIENT_ID=xxx
   SNAPTRADE_CLIENT_SECRET=xxx
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Clear browser cache:
   - Press F12
   - Settings → Clear site data
   - Reload page

### "Authorization Failed" or Redirect Issues

**Problem:** Snaptrade shows error after log in.

**Solution:** Check redirect URI matches exactly:
- Go to https://snaptrade.com/develop
- Check your app's "Authorized Redirect URIs"
- Must be exactly: `http://localhost:3000/api/snaptrade/callback`

### "Access Denied" from Snaptrade

**Problem:** Snaptrade says app is not authorized.

**Causes:**
1. Client ID/Secret is wrong
2. App not registered on Snaptrade
3. Scopes not configured properly

**Solution:**
1. Double-check credentials in dashboard
2. Create new app if credentials lost
3. Verify scopes include: `accounts:read investments:read`

### No Holdings Appear After Sync

**Problem:** "Successfully synced" message but no holdings shown.

**Causes:**
1. Snaptrade account has no positions yet
2. Sync didn't actually run
3. Browser cache issue

**Check:**
1. Log into Snaptrade directly - do you see holdings there?
2. Try syncing again - click "Sync Now" twice
3. Clear browser cache

### Token Expired Error

**Problem:** See error about "access token expired"

**Auto-handled:** App automatically refreshes tokens. If still failing:
1. Disconnect and reconnect the account
2. This resets the token

---

## 📈 What Happens to Your Data

### When You Link an Account

✅ Account name is saved (Webull, Tiger, etc.)  
✅ Account balance is cached  
✅ OAuth access token is securely stored  
✅ Account marked as "active"  

### When You Sync Investments

✅ Holdings are fetched from Snaptrade  
✅ Investment positions are saved to database  
✅ Portfolio value is calculated  
✅ "Last Synced" timestamp is updated  

### When You Disconnect

❌ Account is marked as "inactive"  
❌ All stored tokens are invalidated  
❌ Investment positions are deleted  
✅ User data is preserved (no personal info deleted)

---

## 🔄 Database Overview

### investment_accounts Table

Stores linked Snaptrade accounts:

```
id                    - Unique account ID
user_id              - Which user owns this
provider             - "snaptrade"
snaptrade_account_id - ID from Snaptrade API
brokerage_name       - "Webull", "Tiger", etc.
total_value          - Cached portfolio value
last_synced_at       - When holdings were last synced
is_active            - Whether account is still linked
```

### investment_positions Table

Stores holdings from synced accounts:

```
id                      - Unique position ID
investment_account_id   - Which account this belongs to
ticker_symbol           - Stock ticker (AAPL, MSFT, etc.)
asset_name             - Full stock name
quantity               - How many shares
current_price          - Price per share
current_value          - Total value (quantity × price)
currency               - Currency (USD)
```

### snaptrade_tokens Table

Stores OAuth tokens securely:

```
id                      - Unique token ID
user_id                 - Which user
investment_account_id   - Which account
access_token            - API access token (short-lived)
refresh_token           - For renewing access_token
expires_at              - When token expires
is_active               - If token is still valid
```

---

## 🚀 Production Deployment

When deploying to production:

1. **Get Production Credentials**
   - Create new app on Snaptrade (production)
   - Get new Client ID & Secret

2. **Update redirect URI**
   ```
   Changed from: http://localhost:3000/api/snaptrade/callback
   To:           https://yourdomain.com/api/snaptrade/callback
   ```

3. **Update .env variables**
   ```bash
   SNAPTRADE_CLIENT_ID=prod_client_id
   SNAPTRADE_CLIENT_SECRET=prod_client_secret
   SNAPTRADE_REDIRECT_URI=https://yourdomain.com/api/snaptrade/callback
   ```

4. **Run database migration** (if not done)
   ```sql
   -- Execute migrations/001_create_snaptrade_tokens.sql
   ```

5. **Test thoroughly** before launching
   - Link test account
   - Sync positions
   - Check database
   - Verify no errors in logs

---

## 📚 Documentation

Read these for more details:

- **SNAPTRADE_SETUP.md** - Complete technical setup guide
- **SNAPTRADE_QUICKSTART.md** - Quick reference and FAQs  
- **SNAPTRADE_IMPLEMENTATION.md** - System architecture & internals

---

## ❓ Common Questions

**Q: Is my Snaptrade password stored?**  
A: No! Only the OAuth access token is stored, not your password. Snaptrade handles authentication.

**Q: Can I link multiple accounts?**  
A: Yes! Link as many as you want. Each will be synced separately.

**Q: How often should I sync?**  
A: Click "Sync Now" whenever you want latest data. Auto-sync coming in future.

**Q: What if I lose my access token?**  
A: Don't worry - disconnect and reconnect to get a new one.

**Q: Can I use this for other brokers?**  
A: Currently supports Snaptrade brokers (Webull, Tiger, Moomoo, etc.). More coming soon!

---

## 📞 Support

- **Snaptrade Docs**: https://snaptrade.com/docs
- **This Codebase**: See SNAPTRADE_SETUP.md
- **Issues**: Check troubleshooting section above

---

## Summary

Your Snaptrade integration is **ready to use**! 

1. Set up credentials in `.env.local`
2. Restart your server
3. Go to Portfolio tab
4. Click "Link Account"
5. Enjoy automated investment syncing!

---

**Last Updated:** March 11, 2026  
**Status:** ✅ Production Ready
