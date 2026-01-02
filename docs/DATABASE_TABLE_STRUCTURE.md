# PostgreSQL Database Structure - Important Notes

## Database Overview

**Database Name:** `iran_budget`  
**Connection:** `postgresql://hamidreza@localhost:5432/iran_budget`  
**Location:** Running locally on Mac (localhost:5432)

---

## Table Structure - Critical Understanding

### ✅ What Tables Actually Exist

```
iran_budget (PostgreSQL database)
├── years                    - Year index (1395-1404)
├── revenues                 - ALL revenue data (detailed fields)
├── expenditures            - ALL expenditure data (detailed fields)
├── budget_balance          - Metadata
├── budget_scope_notes      - Metadata
└── data_quality_notes      - Metadata
```

### ❌ What Does NOT Exist

**There is NO `budget_data` table!**

Early in the conversation, there was confusion because:
- References to `budget_data` table came from Next.js app documentation
- We thought it was a separate table with different fields
- **Reality:** The Next.js app queries the SAME `revenues` and `expenditures` tables

---

## Key Fields in `revenues` Table

The `revenues` table contains ALL revenue breakdowns:

**Tax Data:**
- `tax_total` - Total tax revenue
- `tax_corporate` - Corporate tax
- `tax_individual` - Individual income tax
- `tax_payroll` - Payroll tax
- `tax_social_security` - Social security contributions

**Oil & Gas:**
- `oil_gas` - Combined oil and gas revenue

**Government:**
- `operational_revenue` - منابع عمومی (includes tax + oil/gas + fees)
- `asset_sales` - واگذاری دارایی
- `borrowing` - استقراض
- `development_fund` - صندوق توسعه ملی
- `special_accounts` - درآمد اختصاصی
- `other` - Other revenue sources

**State Companies (9 fields):**
- `state_comp_revenues` - State company operations
- `state_comp_current_credits` - Current credits
- `state_comp_capital_credits` - Capital credits
- `state_comp_domestic_loans` - Domestic loans
- `state_comp_foreign_loans` - Foreign loans
- `state_comp_current_assets` - Current assets
- `state_comp_other_receipts` - Other receipts
- `state_comp_financial_assets` - Financial assets
- `state_comp_revenue_total` - Total state company revenue

**Totals:**
- `total` - National total revenue (government + state companies)

---

## Key Fields in `expenditures` Table

**Government Spending:**
- `current_exp` - هزینه‌های جاری (current expenditures)
- `capital_exp` - هزینه‌های سرمایه‌ای (capital expenditures)
- `subsidy_spending` - یارانه‌ها (subsidies)
- `unclassified` - DEPRECATED (always 0 now)

**State Companies (13 fields):**
- `state_comp_current_exp` - Current expenditures
- `state_comp_capital_exp` - Capital expenditures
- `state_comp_taxes` - Taxes paid
- `state_comp_special_dividend` - Special dividend (5%)
- `state_comp_dividends` - Regular dividends
- `state_comp_other_profit` - Other profit allocation
- `state_comp_domestic_repay` - Domestic loan repayment
- `state_comp_foreign_repay` - Foreign loan repayment
- `state_comp_managed_funds` - Managed funds
- `state_comp_debt_repay` - Debt repayment
- `state_comp_current_assets_increase` - Current asset increase
- `state_comp_double_counted` - Double-counting adjustment
- `state_comp_net` - Net state company expenditure

**Totals:**
- `total` - National total expenditure

---

## Important: Calculated vs Stored Fields

### Stored Directly (High Confidence)
✅ `tax_total`, `oil_gas` - Direct from budget law  
✅ `state_comp_revenue_total`, `state_comp_net` - Direct from budget law  
✅ `total` (revenues), `total` (expenditures) - Always balanced

### NOT Stored (Must Be Calculated)

**For Sankey Diagram Categories:**

1. **Personnel Costs** - NOT a field, calculated as:
   - Years 1395-1399: `(current_exp × 0.45) + (state_comp_net × 0.30)`
   - Years 1400-1404: `current_exp + state_comp_current_exp`

2. **Development Projects** - NOT a field, calculated as:
   - `capital_exp + state_comp_capital_exp`

3. **Debt Service** - NOT a field, calculated as:
   - `state_comp_domestic_repay + state_comp_foreign_repay + state_comp_debt_repay`

4. **Support Programs** - This IS stored directly:
   - `subsidy_spending`

---

## Data Units - CRITICAL

**All values in database are stored in BILLION RIALS**

- NOT million rials (as early documentation suggested)
- NOT trillion rials
- Example: `tax_total = 314080.39` means 314,080.39 billion rials = 314 trillion rials

**Conversion:**
- Database value ÷ 1,000 = Trillion rials
- Database value × 1,000 = Million rials

---

## Data Granularity by Year

### Years 1395-1399: Aggregate Only
- Government expenditure stored in `current_exp` as single value
- `capital_exp` and `subsidy_spending` are 0 or NULL
- State companies: only `state_comp_net` populated
- Detailed breakdown NOT available in database

### Years 1400-1404: Full Detail
- Government: `current_exp`, `capital_exp`, `subsidy_spending` all populated
- State companies: All 13 fields populated
- Can calculate precise personnel/development/debt breakdowns

---

## Common Mistakes to Avoid

❌ **Don't look for `budget_data` table** - it doesn't exist  
❌ **Don't assume personnel_costs is a field** - it's calculated  
❌ **Don't forget to check year range** - different fields for different years  
❌ **Don't mix up units** - everything is in billion rials  
✅ **DO use `tax_total` and `oil_gas`** - these ARE in the database  
✅ **DO join `years`, `revenues`, `expenditures`** - that's the structure  
✅ **DO check NULL vs 0** - NULL means not available, 0 means explicitly zero  

---

## Quick Reference Query

```sql
-- Get complete data for one year
SELECT 
    y.year_persian,
    
    -- Revenue breakdown
    r.tax_total,
    r.oil_gas,
    r.state_comp_revenue_total,
    r.other,
    r.special_accounts,
    r.total as total_revenue,
    
    -- Expenditure breakdown
    e.current_exp,
    e.capital_exp,
    e.subsidy_spending,
    e.state_comp_net,
    e.total as total_expenditure

FROM years y
JOIN revenues r ON y.year_id = r.year_id
JOIN expenditures e ON y.year_id = e.year_id
WHERE y.year_persian = 1404;
```

---

## Why the Confusion Happened

1. **Next.js documentation** referenced "budget_data table" with fields like `personnel_costs`
2. We assumed this was a **separate table** in PostgreSQL
3. **Reality:** Next.js app calculates these values from `revenues`/`expenditures` tables
4. The "budget_data" in docs refers to the **API response object**, not a database table
5. Field names like `tax_total` exist in BOTH places (database column AND API response)

---

## Summary - One Source of Truth

```
┌─────────────────────────────────────┐
│   PostgreSQL Database (iran_budget) │
│                                      │
│   Tables:                            │
│   ├── years                          │
│   ├── revenues    ← tax_total here  │
│   └── expenditures                   │
│                                      │
└─────────────────┬───────────────────┘
                  │
                  │ queries via SQL
                  ↓
         ┌────────────────┐
         │   Next.js API  │
         │   /api/budget  │
         └────────┬───────┘
                  │
                  │ returns JSON
                  ↓
         ┌────────────────────┐
         │  budget-transform  │
         │  (calculates:      │
         │   personnelCosts,  │
         │   development,     │
         │   etc.)            │
         └────────┬───────────┘
                  │
                  ↓
            Sankey Diagram
```

**ONE database. TWO tables (revenues, expenditures). Calculations happen in code.**

---

**Last Updated:** January 2, 2025  
**Lesson Learned:** Always check `\dt` before assuming table names from documentation!