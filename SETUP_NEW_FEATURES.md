# QUICK START: Database Setup for New CRUD Features

## What's New?

All tabs in the Wealth & Wellness Hub now support **full CRUD operations** for manually inputting financial data:

✅ **Spending & Transactions** - Add, edit, delete transactions  
✅ **Assets** - Manage property, crypto, vehicles, and other assets  
✅ **Income** - Track multiple income sources  
✅ **Financial Events** - Log major financial milestones  
✅ **Milestones** - Set and track financial goals  

---

## Setup Instructions

### 1. Run the Database Migration

Copy the SQL from `/lib/migrations.sql` and run it in your **Supabase SQL Editor**:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Click "New Query"
# 3. Paste entire contents of /lib/migrations.sql
# 4. Click "Run"
```

This creates 3 new tables:
- `income_entries` - Track income from any source
- `financial_events` - Track major financial events
- `expense_templates` - Track recurring expenses

### 2. Restart Your Dev Server

```bash
npm run dev
```

### 3. Start Using the New Features!

Navigate to any tab and look for the **"Add"** buttons:

| Tab | Feature |
|-----|---------|
| **Summary** | 💰 Add Income entries |
| **Portfolio** | 🏠 Add Manual Assets |
| **Spending** | 💳 Add Transactions |
| **Financial Story** | 📊 Add Financial Events |
| **Milestones** | 🎯 Add/Edit Goals |

---

## Common Task Examples

### Add a Transaction
1. Go to **Spending** tab
2. Click **"Add Transaction"**
3. Choose **Expense** or **Income**
4. Enter amount, merchant name, category
5. Set date and click **"Add Transaction"**

### Record Income
1. Go to **Summary** tab
2. Scroll down to **Income Tracker**
3. Click **"Add Income"**
4. Select income type (Salary, Bonus, etc.)
5. Enter amount and source
6. Click **"Add Entry"**

### Track a Property
1. Go to **Portfolio** tab
2. Scroll down to **Manual Assets**
3. Click **"Add Asset"**
4. Select **Property** type
5. Enter property address, value, and outstanding loan
6. Click **"Add Asset"**

### Log a Job Change
1. Go to **Financial Story** tab
2. Scroll down to **Financial Events**
3. Click **"Add Event"**
4. Select event type (Job Change)
5. Enter title and optional salary impact
6. Click **"Add Event"**

---

## Key Features

### For Transactions
- Add income (positive) or expenses (negative)
- Categorize spending
- Mark as pending or completed
- Edit/delete anytime

### For Assets
- Multiple asset types supported
- Optional property-specific fields
- Track outstanding loans
- Record valuation date

### For Income
- Multiple income sources
- Track salary, bonuses, investments, rentals
- See total income summary

### For Events
- Tag events as important/completed
- Track financial impact
- See complete timeline

---

## Troubleshooting

**Problem:** "Table income_entries does not exist"  
**Solution:** Did you run the migration SQL? Check step 1 above.

**Problem:** Forms not showing  
**Solution:** 
1. Clear browser cache (Cmd+Shift+R on Mac)
2. Restart dev server (`npm run dev`)

**Problem:** Data not saving  
**Solution:**
1. Check browser console for errors (F12)
2. Make sure you're signed in
3. Verify Supabase connection is working

**Problem:** Only seeing read-only data  
**Solution:** The new form components are below the existing views. Scroll down!

---

## Database Structure

Three new tables are created:

### income_entries
- `id` - Unique identifier
- `user_id` - Associated user
- `amount` - Income amount (SGD)
- `income_type` - Type (salary, bonus, rental, etc.)
- `source` - Where the income came from
- `income_date` - When received
- `notes` - Optional notes

### financial_events
- `id` - Unique identifier
- `user_id` - Associated user
- `event_type` - Type (job_change, promotion, etc.)
- `title` - Event title
- `description` - Full description
- `impact_amount` - Optional financial impact
- `event_date` - When it happened
- `tags` - Array of tags

### expense_templates
- `id` - Unique identifier
- `user_id` - Associated user
- `name` - Template name
- `category` - Expense category
- `amount` - Amount
- `frequency` - How often (daily, weekly, monthly, etc.)
- `is_active` - Active or archived

---

## Next Steps

1. ✅ Run the migration
2. ✅ Restart your dev server
3. ✅ Go to each tab and add some test data
4. ✅ Verify data persists after refresh
5. ✅ Check calculations update correctly

For detailed API documentation, see [CRUD_IMPLEMENTATION.md](./CRUD_IMPLEMENTATION.md)

---

## Need Help?

- Check existing data in Supabase Dashboard to verify tables exist
- Look at browser console (F12) for error messages
- Review form validation error messages
- Check that you're logged in with a valid session

Happy tracking! 🎉
