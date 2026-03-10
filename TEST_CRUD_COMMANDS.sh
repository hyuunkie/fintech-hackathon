#!/bin/bash
# CRUD Operations - Quick Testing Guide
# Run these curl commands after getting a user ID from the app

BASE_URL="http://localhost:3000"
USER_ID="your-user-id-here"

echo "=== WEALTH & WELLNESS HUB - CRUD TEST COMMANDS ==="
echo "Replace USER_ID=${USER_ID} with an actual UUID from the app"
echo ""

# ============================================================
# INVESTMENT POSITIONS
# ============================================================
echo "1. GET all investment positions"
curl "$BASE_URL/api/investment-positions?userId=$USER_ID"
echo ""

echo "2. CREATE a new investment position"
curl -X POST "$BASE_URL/api/investment-positions" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER_ID'",
    "investment_account_id":"account-uuid-here",
    "ticker_symbol":"AAPL",
    "asset_name":"Apple Inc",
    "asset_type":"stock",
    "quantity":10,
    "current_price":150.00,
    "current_value":1500.00,
    "currency":"USD"
  }'
echo ""

echo "3. UPDATE investment position"
curl -X PUT "$BASE_URL/api/investment-positions" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"position-id-here",
    "userId":"'$USER_ID'",
    "quantity":15,
    "current_value":2250.00
  }'
echo ""

echo "4. DELETE investment position"
curl -X DELETE "$BASE_URL/api/investment-positions?id=position-id-here&userId=$USER_ID"
echo ""

# ============================================================
# TRANSACTIONS
# ============================================================
echo "5. GET all transactions (limit 50)"
curl "$BASE_URL/api/transactions?userId=$USER_ID&limit=50"
echo ""

echo "6. GET transactions by category"
curl "$BASE_URL/api/transactions?userId=$USER_ID&category=Food"
echo ""

echo "7. GET transactions by date range"
curl "$BASE_URL/api/transactions?userId=$USER_ID&startDate=2024-01-01&endDate=2024-12-31"
echo ""

echo "8. DELETE a transaction"
curl -X DELETE "$BASE_URL/api/transactions?id=transaction-id-here&userId=$USER_ID"
echo ""

# ============================================================
# MILESTONES (GOALS)
# ============================================================
echo "9. GET all milestones"
curl "$BASE_URL/api/milestones?userId=$USER_ID"
echo ""

echo "10. CREATE a new milestone"
curl -X POST "$BASE_URL/api/milestones" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER_ID'",
    "milestone_type":"bto",
    "title":"Buy 4-room HDB in Tampines",
    "target_amount":450000,
    "current_amount":50000,
    "target_date":"2028-01-01",
    "monthly_savings":5000
  }'
echo ""

echo "11. UPDATE milestone"
curl -X PUT "$BASE_URL/api/milestones" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"milestone-id-here",
    "userId":"'$USER_ID'",
    "current_amount":75000
  }'
echo ""

echo "12. ADD progress to milestone (special endpoint)"
curl -X PUT "$BASE_URL/api/milestones" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"milestone-id-here",
    "userId":"'$USER_ID'",
    "addAmount":10000
  }'
echo ""

echo "13. DELETE milestone"
curl -X DELETE "$BASE_URL/api/milestones?id=milestone-id-here&userId=$USER_ID"
echo ""

# ============================================================
# MANUAL ASSETS
# ============================================================
echo "14. GET all manual assets"
curl "$BASE_URL/api/manual-assets?userId=$USER_ID"
echo ""

echo "15. CREATE manual asset (e.g., property)"
curl -X POST "$BASE_URL/api/manual-assets" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER_ID'",
    "asset_type":"property",
    "asset_name":"HDB Flat Bukit Batok",
    "estimated_value":450000,
    "currency":"SGD",
    "property_address":"123 Bukit Batok Street 23"
  }'
echo ""

echo "16. UPDATE manual asset"
curl -X PUT "$BASE_URL/api/manual-assets" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"asset-id-here",
    "userId":"'$USER_ID'",
    "estimated_value":500000
  }'
echo ""

echo "17. DELETE manual asset"
curl -X DELETE "$BASE_URL/api/manual-assets?id=asset-id-here&userId=$USER_ID"
echo ""

# ============================================================
# BANK ACCOUNTS
# ============================================================
echo "18. GET all bank accounts"
curl "$BASE_URL/api/bank-accounts?userId=$USER_ID"
echo ""

echo "19. CREATE bank account"
curl -X POST "$BASE_URL/api/bank-accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER_ID'",
    "plaid_item_id":"item-abc123",
    "plaid_account_id":"acc-abc123",
    "institution_name":"DBS",
    "account_name":"Everyday Account",
    "account_type":"checking",
    "current_balance":25000,
    "currency":"SGD"
  }'
echo ""

echo "20. UPDATE bank account"
curl -X PUT "$BASE_URL/api/bank-accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"bank-id-here",
    "userId":"'$USER_ID'",
    "current_balance":30000
  }'
echo ""

echo "21. DELETE bank account (soft delete)"
curl -X DELETE "$BASE_URL/api/bank-accounts?id=bank-id-here&userId=$USER_ID"
echo ""

# ============================================================
# INVESTMENT ACCOUNTS
# ============================================================
echo "22. GET all investment accounts"
curl "$BASE_URL/api/investment-accounts?userId=$USER_ID"
echo ""

echo "23. CREATE investment account"
curl -X POST "$BASE_URL/api/investment-accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER_ID'",
    "provider":"snaptrade",
    "brokerage_name":"Webull",
    "account_name":"Trading Account",
    "account_type":"individual",
    "total_value":150000,
    "currency":"USD"
  }'
echo ""

echo "24. UPDATE investment account"
curl -X PUT "$BASE_URL/api/investment-accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"inv-account-id-here",
    "userId":"'$USER_ID'",
    "total_value":200000
  }'
echo ""

echo "25. DELETE investment account"
curl -X DELETE "$BASE_URL/api/investment-accounts?id=inv-account-id-here&userId=$USER_ID"
echo ""

# ============================================================
# WELLNESS SCORES
# ============================================================
echo "26. GET latest wellness score"
curl "$BASE_URL/api/wellness-scores?userId=$USER_ID&latest=true"
echo ""

echo "27. GET all wellness scores"
curl "$BASE_URL/api/wellness-scores?userId=$USER_ID"
echo ""

echo "28. CREATE wellness score"
curl -X POST "$BASE_URL/api/wellness-scores" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER_ID'",
    "overall_score":75,
    "liquidity_score":80,
    "diversification_score":70,
    "debt_score":85,
    "savings_rate_score":72,
    "milestone_score":80,
    "net_worth":500000,
    "total_assets":500000,
    "total_liabilities":0,
    "monthly_income":8000,
    "monthly_expenses":5000,
    "emergency_fund_months":6.5,
    "savings_rate_pct":35.5
  }'
echo ""

echo "29. DELETE wellness score"
curl -X DELETE "$BASE_URL/api/wellness-scores?id=score-id-here&userId=$USER_ID"
echo ""

# ============================================================
# HEALTH SCORES (Calculated)
# ============================================================
echo "30. Calculate financial health score"
curl "$BASE_URL/api/health-scores?userId=$USER_ID&calculate=true"
echo ""

# ============================================================
# SPENDING INSIGHTS
# ============================================================
echo "31. GET all insights"
curl "$BASE_URL/api/spending-insights?userId=$USER_ID"
echo ""

echo "32. GET this month's spending"
curl "$BASE_URL/api/spending-insights?userId=$USER_ID&thisMonth=true"
echo ""

echo "33. GET average daily spending (last 30 days)"
curl "$BASE_URL/api/spending-insights?userId=$USER_ID&avgDaily=true&days=30"
echo ""

echo "34. CREATE insight"
curl -X POST "$BASE_URL/api/spending-insights" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER_ID'",
    "insight_type":"payday_spike",
    "title":"Your spending spikes on payday",
    "body":"We noticed you tend to spend more right after payday. Consider setting aside savings first.",
    "data_point":"28% higher spending",
    "severity":"info"
  }'
echo ""

echo "===================================================="
echo "✅ Test completed!"
echo ""
echo "For quick testing in the app, visit: /test-crud"
