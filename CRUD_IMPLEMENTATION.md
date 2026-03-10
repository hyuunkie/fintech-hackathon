# CRUD Implementation Guide - Wealth & Wellness Hub

This document describes the complete CRUD (Create, Read, Update, Delete) implementation for all major entities in the Wealth & Wellness Hub application.

## Overview

All tabs in the website have been synced with the database and now support full CRUD operations. Users can manually input and manage:
- ✅ **Spending & Income** - Transactions, income sources
- ✅ **Assets** - Manual assets (property, crypto, vehicles, etc.)
- ✅ **Goals** - Milestones and financial targets
- ✅ **Events** - Major financial life events
- ✅ **Financial Health** - Wellness scores and insights

---

## Database Setup

### Step 1: Run Main Schema (if not already done)
The main schema is at: `/schema.sql`

### Step 2: Run Additional Migrations
Run the following SQL in Supabase SQL Editor to create new tables for income, events, and expense templates:

**File:** `/lib/migrations.sql`

This creates three new tables:
- `income_entries` - Track income from all sources
- `financial_events` - Track major financial milestones
- `expense_templates` - Track recurring expense patterns

### Step 3: Update Database Types
Database types have been updated in `/lib/database.types.ts` to include:
- `income_entries`
- `financial_events`
- `expense_templates`

---

## Server Actions (Backend CRUD)

### Transaction Management
**File:** `/app/actions/portfolio.ts`

```typescript
// Get all transactions
getTransactions(userId: string): Promise<Transaction[]>

// Create a new transaction
createTransaction(input: TransactionInsert): Promise<Transaction>

// Update a transaction
updateTransaction(id: string, userId: string, input: TransactionUpdate): Promise<Transaction | null>

// Delete a transaction
deleteTransaction(id: string, userId: string): Promise<boolean>
```

**Transaction Properties:**
- `amount: number` - Negative for expenses, positive for income
- `merchant_name: string` - e.g., "Burger King", "Company XYZ"
- `category: string` - Food, Transport, Shopping, etc.
- `transaction_date: string` - ISO date format
- `description?: string` - Optional notes
- `is_pending: boolean` - Mark as pending if not yet completed

---

### Manual Assets Management
**File:** `/app/actions/portfolio.ts`

```typescript
// Get all manual assets
getManualAssets(userId: string): Promise<ManualAsset[]>

// Create a new manual asset
createManualAsset(input: ManualAssetInsert): Promise<ManualAsset>

// Update a manual asset
updateManualAsset(id: string, userId: string, input: ManualAssetUpdate): Promise<ManualAsset | null>

// Delete a manual asset
deleteManualAsset(id: string, userId: string): Promise<boolean>
```

**Asset Types:**
- `property` - Real estate, HDB, condos (supports property_address, outstanding_loan)
- `crypto` - Cryptocurrencies and digital assets
- `private_equity` - Shares in private companies
- `vehicle` - Cars, motorcycles, boats
- `gold` - Gold and precious metals
- `other` - Any other asset type

---

### Income Tracking
**File:** `/app/actions/events.ts`

```typescript
// Get all income entries
getIncomeEntries(userId: string): Promise<IncomeEntry[]>

// Create new income entry
createIncomeEntry(input: Omit<IncomeEntry, "id" | "created_at" | "updated_at">): Promise<IncomeEntry | null>

// Update income entry
updateIncomeEntry(id: string, userId: string, input: Partial<...>): Promise<IncomeEntry | null>

// Delete income entry
deleteIncomeEntry(id: string, userId: string): Promise<boolean>
```

**Income Types:**
- `salary` - Regular salary from employment
- `bonus` - Bonuses and commissions
- `investment_return` - Dividends, capital gains
- `rental` - Rental income from property
- `freelance` - Freelance/side income
- `other` - Other income sources

---

### Financial Events Tracking
**File:** `/app/actions/events.ts`

```typescript
// Get all financial events
getFinancialEvents(userId: string): Promise<FinancialEvent[]>

// Create new financial event
createFinancialEvent(input: Omit<FinancialEvent, "id" | "created_at" | "updated_at">): Promise<FinancialEvent | null>

// Update financial event
updateFinancialEvent(id: string, userId: string, input: Partial<...>): Promise<FinancialEvent | null>

// Delete financial event
deleteFinancialEvent(id: string, userId: string): Promise<boolean>
```

**Event Types:**
- `job_change` - Job change or new employment
- `promotion` - Promotion or salary increase
- `bonus` - Bonus received
- `investment_purchase` - Major investment made
- `debt_payoff` - Debt paid off
- `expense_event` - Major unexpected expense
- `life_event` - Wedding, birth, major life change
- `other` - Any other event

**Event Features:**
- `impact_amount` - Optional financial impact (positive or negative)
- `tags` - Array of tags (e.g., ["important", "completed"])
- `description` - Optional detailed description

---

### Milestones/Goals
**File:** `/app/actions/goals.ts`

Complete CRUD for financial goals and milestones:

```typescript
// Get all milestones
getMilestones(userId: string): Promise<Milestone[]>

// Create milestone
createMilestone(input: MilestoneInsert): Promise<Milestone>

// Update milestone
updateMilestone(id: string, userId: string, input: MilestoneUpdate): Promise<Milestone | null>

// Delete milestone
deleteMilestone(id: string, userId: string): Promise<boolean>

// Add progress to milestone
addToMilestoneProgress(id: string, userId: string, amount: number): Promise<Milestone | null>
```

**Milestone Types:**
- `bto` - Buy HDB/property
- `marriage` - Wedding expenses
- `child` - Children education/birth
- `retirement` - Retirement planning
- `education` - Further education
- `custom` - Custom goals

---

## UI Components (Frontend)

### 1. Transaction Form (Spending Tab)
**File:** `/components/ManualTransactionsForm.tsx`

Features:
- ✅ Add new transactions (income or expense)
- ✅ Edit existing transactions
- ✅ Delete transactions
- ✅ Filter by category (Food, Transport, Shopping, etc.)
- ✅ Mark as pending/completed
- ✅ View summary: Total Income, Expenses, Net
- ✅ Recent transactions list with edit/delete buttons

### 2. Manual Assets Form (Portfolio Tab)
**File:** `/components/ManualAssetsForm.tsx`

Features:
- ✅ Add new manual assets (property, crypto, vehicles)
- ✅ Edit asset details
- ✅ Delete assets
- ✅ Property-specific fields (address, outstanding loan)
- ✅ Track asset valuation date
- ✅ Add notes to assets
- ✅ View total asset value
- ✅ Display net equity for mortgaged properties

### 3. Income Tracker (Summary Tab)
**File:** `/components/IncomeTracker.tsx`

Features:
- ✅ Add new income entries
- ✅ Edit income entries
- ✅ Delete income entries
- ✅ Multiple income types (Salary, Bonus, Rental, etc.)
- ✅ Track income source
- ✅ View total income by type
- ✅ Summary statistics

### 4. Financial Events Tracker (Financial Story Tab)
**File:** `/components/FinancialEventsTracker.tsx`

Features:
- ✅ Add major financial events
- ✅ Edit events
- ✅ Delete events
- ✅ Track financial impact (positive/negative)
- ✅ Add tags (important, completed, planned)
- ✅ Calculate total positive/negative impact
- ✅ View event timeline

### 5. Milestone Planner (Milestones Tab)
**File:** `/components/MilestonePlanner.tsx`

Features:
- ✅ Create financial goals
- ✅ Edit milestone details
- ✅ Delete milestones
- ✅ Update progress
- ✅ Track target dates
- ✅ Automatic completion detection
- ✅ Overall progress visualization

---

## User Workflow Examples

### Example 1: Adding a Transaction
1. Navigate to **Spending** tab
2. Click **"Add Transaction"**
3. Select Type (Expense/Income)
4. Enter Amount
5. Enter Merchant/Source name
6. Select Category
7. Set Transaction Date
8. Click **"Add Transaction"**

### Example 2: Tracking a New Asset
1. Navigate to **Portfolio** tab
2. Click **"Add Asset"**
3. Select Asset Type (e.g., Property)
4. Enter Asset Name
5. Enter Estimated Value
6. If property: Add address and outstanding loan
7. Click **"Add Asset"**

### Example 3: Recording Income
1. Navigate to **Summary** tab
2. Scroll to **Income Tracker**
3. Click **"Add Income"**
4. Select Income Type (Salary, Bonus, etc.)
5. Enter Amount and Source
6. Set Income Date
7. Click **"Add Entry"**

### Example 4: Logging Major Financial Event
1. Navigate to **Financial Story** tab
2. Click **"Add Event"**
3. Select Event Type (Job Change, Promotion, etc.)
4. Enter Title
5. Optional: Add financial impact amount
6. Add description and tags
7. Click **"Add Event"**

---

## Data Flow & Sync

1. **User Input** → Component Form
2. **Form Submission** → Server Action
3. **Server Action** → Supabase Database
4. **Success Response** → Update UI State
5. **Real-time Display** → Component Re-renders

All operations are protected by **Row-Level Security (RLS)** policies, ensuring users can only access their own data.

---

## Validation & Error Handling

All forms include:
- ✅ Required field validation
- ✅ Numeric validation (amounts must be positive)
- ✅ Date validation
- ✅ Duplicate handling (using Supabase unique constraints)
- ✅ Error feedback to user
- ✅ Loading states during submission

---

## Expense Templates (Optional)

Server action also included for recurring expense templates:

```typescript
// Create recurring expense template
createExpenseTemplate(input: Omit<ExpenseTemplate, "id" | ...>): Promise<ExpenseTemplate | null>

// Frequency options: 'once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
```

This can be used to auto-generate recurring transactions (future enhancement).

---

## Testing the Implementation

1. **Sign in** to the application
2. **Navigate** to each tab
3. **Test CRUD operations:**
   - ✅ Create (Add button)
   - ✅ Read (View list)
   - ✅ Update (Edit button)
   - ✅ Delete (Delete button)
4. **Verify data persists** after page refresh
5. **Check calculations** update correctly
6. **Ensure RLS** prevents access to other users' data

---

## Future Enhancements

1. **Bulk Import** - CSV import for transactions
2. **Recurring Transactions** - Auto-generate from templates
3. **Batch Operations** - Delete multiple items at once
4. **Audit Trail** - Track who modified what and when
5. **Export** - Export transactions/assets as CSV/PDF
6. **Mobile Optimizations** - Better mobile forms
7. **Search & Filter** - Advanced filtering options

---

## Support & Troubleshooting

### Issue: Tables Not Found
**Solution:** Run `/lib/migrations.sql` in Supabase SQL Editor

### Issue: RLS Errors
**Solution:** Ensure RLS policies are enabled on all tables (check schema.sql)

### Issue: Data Not Persisting
**Solution:** 
- Check Supabase connection in `/lib/supabase.ts`
- Verify auth session is valid
- Check browser console for errors

### Issue: Forms Not Submitting
**Solution:**
- Ensure all required fields are filled
- Check network tab for API errors
- Verify server actions are properly imported

---

## Summary

The Wealth & Wellness Hub now has complete CRUD functionality for:
- **Transactions** (spending/income)
- **Manual Assets** (property, crypto, vehicles)
- **Income Sources** (salary, bonus, investments)
- **Financial Events** (job changes, major expenses)
- **Milestones** (financial goals and targets)

All data is synced with the Supabase database and protected by row-level security to ensure user privacy.
