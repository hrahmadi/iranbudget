# Database Schema Update Complete ✅

**Date:** 2025-12-30  
**Action:** Added missing revenue categories and scope tracking

---

## ✅ Changes Applied

### 1. New Columns Added to `revenues` Table:

| Column | Type | Description | Default |
|--------|------|-------------|---------|
| `asset_sales` | DECIMAL(20,3) | واگذاری دارایی‌های سرمایه‌ای - Asset sales | 0 |
| `borrowing` | DECIMAL(20,3) | استقراض - Government borrowing | 0 |
| `development_fund` | DECIMAL(20,3) | صندوق توسعه ملی - Development fund withdrawals | 0 |
| `special_accounts` | DECIMAL(20,3) | حساب‌های ویژه - Special accounts | 0 |
| `operational_revenue` | DECIMAL(20,3) | درآمدهای عملیاتی - Tax + Oil + Other | Calculated |

### 2. New Columns Added to `years` Table:

| Column | Type | Description | Values |
|--------|------|-------------|--------|
| `revenue_scope` | VARCHAR(100) | Scope of revenue data | 'operational_only', 'منابع_عمومی', 'full_national' |
| `expenditure_scope` | VARCHAR(100) | Scope of expenditure data | 'government_general', 'full_national' |

### 3. New Table Created: `budget_scope_notes`

Tracks what's included/excluded in the data for each year:

```sql
CREATE TABLE budget_scope_notes (
    note_id SERIAL PRIMARY KEY,
    year_id INTEGER,
    category VARCHAR(50),  -- 'revenue' or 'expenditure'
    scope_type VARCHAR(100),
    included_items TEXT[],
    excluded_items TEXT[],
    percentage_of_total DECIMAL(5,2),
    notes TEXT
);
```

### 4. New Views Created:

**`budget_overview_detailed`:**
- Shows all revenue categories (operational + asset sales + borrowing)
- Includes scope information
- Replaces old `budget_overview`

**`operational_revenues_view`:**
- Shows only operational revenues (consistent across all years)
- Calculates percentages for tax, oil, other
- Use this for year-over-year comparisons

---

## 📊 Current Data State

### All Years (1395-1404):
```
operational_revenue = tax_total + oil_gas + other  ✅ Populated
asset_sales = 0  ⚠️ Not yet filled
borrowing = 0  ⚠️ Not yet filled
development_fund = 0  ⚠️ Not yet filled
special_accounts = 0  ⚠️ Not yet filled
```

### Scope Tracking:

**Years 1395-1403:**
- `revenue_scope`: 'operational_only'
- `expenditure_scope`: 'government_general'
- Contains ~51% of منابع عمومی

**Year 1404:**
- `revenue_scope`: 'منابع_عمومی'
- `expenditure_scope`: 'government_general'
- Contains full general resources

---

## 🎯 Next Steps

### Option A: Fill Missing Data (Recommended if time permits)
Search for official budget documents to find:
1. واگذاری دارایی‌ها (Asset sales)
2. استقراض (Borrowing)
3. صندوق توسعه ملی (Development fund)
4. حساب‌های ویژه (Special accounts)

**Benefits:**
- Complete picture of منابع عمومی
- Accurate totals matching official reports

### Option B: Use Current Data with Clear Labels (Quick solution)
Keep zeros for missing categories but update all labels:
- "Operational Revenue" instead of "Total Revenue"
- Add disclaimers about scope
- Use `operational_revenues_view` for visualizations

**Benefits:**
- Ready to use immediately
- Consistent comparisons
- Clear about limitations

---

## 📋 Updated Database Views

### Check Operational Revenues (Consistent):
```sql
SELECT * FROM operational_revenues_view;
```

### Check Detailed Overview with Scope:
```sql
SELECT * FROM budget_overview_detailed;
```

### Check Scope Notes:
```sql
SELECT 
    y.year_persian,
    bsn.scope_type,
    bsn.percentage_of_total,
    bsn.notes
FROM budget_scope_notes bsn
JOIN years y ON bsn.year_id = y.year_id
ORDER BY y.year_persian;
```

---

## 🔍 Data Quality Notes Added

The system now tracks:
1. **Scope of data** for each year
2. **What's included** (tax, oil, other)
3. **What's missing** (asset sales, borrowing, etc.)
4. **Percentage of total** (~51% of منابع عمومی)

---

## 📱 Impact on Frontend

### Current React App Uses:
- `revenues.total` → Should change to `revenues.operational_revenue`
- Label: "Total Revenue" → Should be "Operational Revenue"

### Recommended Updates:
1. Use `operational_revenues_view` for all years
2. Add scope indicator: "Operational Budget Only"
3. Add tooltip: "Excludes asset sales and borrowing (~49% of total)"
4. Show percentage: "~51% of Government General Resources"

---

## ✅ Schema Migration Summary

**Before:**
```
revenues.total = (unclear what it represents)
No tracking of scope
No place for missing categories
```

**After:**
```
revenues.operational_revenue = tax + oil + other (clear)
revenues.asset_sales = 0 (placeholder for future)
revenues.borrowing = 0 (placeholder for future)
years.revenue_scope = tracks what's included
budget_scope_notes = documents limitations
```

---

**Status:** Database schema updated successfully! Ready for frontend integration or additional data collection.
