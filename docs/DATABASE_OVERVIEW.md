# Iran Budget Database - Complete Overview

## Database Summary

**Database Name:** `iran_budget`  
**Coverage:** Years 1395-1404 (Persian calendar = 2016-2026 Gregorian)  
**Scope:** Full national budget = Government General Budget + State-Owned Companies & Banks  
**Units:** Billion rials (1 trillion = 1,000 billion)

---

## ✅ Data Completeness - All 10 Years Complete & Balanced

| Year | Revenue | Expenditure | Balance | Detail Level |
|------|---------|-------------|---------|--------------|
| 1395 | 9,786 T | 9,786 T | ✓ | Aggregate |
| 1396 | 11,277 T | 11,277 T | ✓ | Aggregate |
| 1397 | 12,830 T | 12,830 T | ✓ | Aggregate |
| 1398 | 17,972 T | 17,972 T | ✓ | Aggregate |
| 1399 | 20,767 T | 20,767 T | ✓ | Aggregate |
| 1400 | 28,823 T | 28,823 T | ✓ | Full Detail |
| 1401 | 37,588 T | 37,588 T | ✓ | Full Detail |
| 1402 | 49,947 T | 49,947 T | ✓ | Full Detail |
| 1403 | 64,587 T | 64,587 T | ✓ | Full Detail |
| 1404 | 112,795 T | 112,795 T | ✓ | Full Detail |

**Note:** Revenue always equals expenditure by Iranian budget law (balanced budget principle).

---

## Database Schema

### Table: `years` - Master Index
```sql
year_id (PK)              SERIAL
year_persian              INTEGER (1395-1404)
year_gregorian            VARCHAR(20)
currency                  VARCHAR(50) DEFAULT 'billion rials'
data_source               TEXT
revenue_scope             VARCHAR(100)
expenditure_scope         VARCHAR(100)
created_at               TIMESTAMP
updated_at               TIMESTAMP
```

### Table: `revenues` - All Revenue Sources

#### Core Fields
- `year_id` - Foreign key to years table
- **`total`** - Total national budget revenue (ALWAYS equals expenditure total)

#### Government General Budget Revenues
- `operational_revenue` - منابع عمومی (taxes, oil/gas, fees, etc.)
- `asset_sales` - واگذاری دارایی‌های سرمایه‌ای (privatization)
- `borrowing` - استقراض (Islamic bonds)
- `development_fund` - منابع صندوق توسعه ملی (1404 only)
- `special_accounts` - درآمد اختصاصی دستگاه‌ها

#### State Companies Revenues (9 columns)
- `state_comp_revenues` - درآمدها
- `state_comp_current_credits` - اعتبارات هزینه‌ای
- `state_comp_capital_credits` - اعتبارات تملک دارایی‌ها
- `state_comp_domestic_loans` - تسهیلات بانکی داخلی
- `state_comp_foreign_loans` - وام‌های خارجی
- `state_comp_current_assets` - دارایی‌های جاری
- `state_comp_other_receipts` - سایر دریافت‌ها
- `state_comp_financial_assets` - افزایش دارایی‌های مالی
- **`state_comp_revenue_total`** - جمع کل منابع شرکت‌ها

### Table: `expenditures` - All Expenditure Categories

#### Core Fields
- `year_id` - Foreign key to years table
- **`total`** - Total national budget expenditure (ALWAYS equals revenue total)

#### Government General Budget Expenditures
- `current_exp` - هزینه‌های جاری
  - **For years 1395-1399:** Contains TOTAL government expenditure (aggregate)
  - **For years 1400-1404:** Contains only current expenses (detailed)
- `capital_exp` - هزینه‌های سرمایه‌ای (1400-1404 only)
- `subsidy_spending` - یارانه‌ها (1400-1404 only)
- `unclassified` - **DEPRECATED** - Do not use

#### State Companies Expenditures (13 columns)
- `state_comp_current_exp` - هزینه‌های جاری
- `state_comp_capital_exp` - هزینه‌های سرمایه‌ای
- `state_comp_taxes` - مالیات
- `state_comp_special_dividend` - سود ویژه ۵٪
- `state_comp_dividends` - سود سهام
- `state_comp_other_profit` - سایر تخصیص سود
- `state_comp_domestic_repay` - بازپرداخت تسهیلات داخلی
- `state_comp_foreign_repay` - بازپرداخت وام خارجی
- `state_comp_managed_funds` - وجوه اداره‌شده
- `state_comp_debt_repay` - بازپرداخت بدهی
- `state_comp_current_assets_increase` - افزایش دارایی جاری (1404)
- `state_comp_double_counted` - کسر: مبالغ دوبار منظور / ذخیره استهلاک
- **`state_comp_net`** - جمع خالص شرکت‌ها (after adjustments)

---

## Understanding Data Structure

### Why Different Detail Levels?

**Aggregate Years (1395-1399):**
- Government: Only total available, stored in `current_exp`
- State Companies: Only total available, stored in `state_comp_revenue_total` and `state_comp_net`
- Reason: Detailed breakdowns not published in official budget law for these years

**Detailed Years (1400-1404):**
- Government: Split into `current_exp`, `capital_exp`, `subsidies`
- State Companies: Full 11-13 line item breakdown
- Reason: Table 11 (پیوست ۳) published with detailed categories

### Why "Double-Counting" Adjustments?

Some transfers between government and state companies appear in BOTH budgets:
- State company pays taxes → counted as state company expenditure
- Government receives taxes → counted as government revenue
- **Solution:** Subtract double-counted amount to get true national total

**Formula:** `National Total = Government + State Companies - Double Counted`

| Year | Double-Counted | Type |
|------|----------------|------|
| 1396 | 427 T | Internal transfers |
| 1397 | 598 T | Internal transfers |
| 1398 | 528 T | Internal transfers |
| 1399 | 591 T | Internal transfers |
| 1400 | 628 T | Internal transfers |
| 1402 | 1,527 T | Internal transfers |
| 1403 | 1,200 T | Internal transfers |
| 1404 | 4,782 T | Depreciation reserve |

---

## How to Query the Database

### Get Total Budget for All Years
```sql
SELECT 
    y.year_persian,
    r.total as revenue,
    e.total as expenditure
FROM years y
JOIN revenues r ON y.year_id = r.year_id
JOIN expenditures e ON y.year_id = e.year_id
ORDER BY y.year_persian;
```

### Get Government vs State Companies Breakdown
```sql
SELECT 
    y.year_persian,
    -- Government
    (r.operational_revenue + r.asset_sales + r.borrowing + 
     COALESCE(r.development_fund, 0) + r.special_accounts) as gov_revenue,
    (e.current_exp + COALESCE(e.capital_exp, 0) + COALESCE(e.subsidy_spending, 0)) as gov_expenditure,
    -- State Companies
    r.state_comp_revenue_total as state_revenue,
    e.state_comp_net as state_expenditure
FROM years y
JOIN revenues r ON y.year_id = r.year_id
JOIN expenditures e ON y.year_id = e.year_id
ORDER BY y.year_persian;
```

### Get Detailed Breakdown (Years 1400-1404 Only)
```sql
SELECT 
    y.year_persian,
    -- Government detail
    e.current_exp,
    e.capital_exp,
    e.subsidy_spending,
    -- State companies detail
    e.state_comp_current_exp,
    e.state_comp_capital_exp,
    e.state_comp_taxes,
    e.state_comp_dividends
FROM years y
JOIN expenditures e ON y.year_id = e.year_id
WHERE y.year_persian >= 1400
ORDER BY y.year_persian;
```

### Calculate Year-over-Year Growth
```sql
SELECT 
    y.year_persian,
    r.total,
    LAG(r.total) OVER (ORDER BY y.year_persian) as prev_year,
    ROUND(((r.total / LAG(r.total) OVER (ORDER BY y.year_persian)) - 1) * 100, 2) as growth_pct
FROM years y
JOIN revenues r ON y.year_id = r.year_id;
```

---

## Important Field Usage Notes

### ✅ Always Use
- `revenues.total` - Total national revenue
- `expenditures.total` - Total national expenditure
- `state_comp_revenue_total` - State companies total revenue
- `state_comp_net` - State companies net expenditure

### ⚠️ Use with COALESCE for Years 1395-1399
- `revenues.state_comp_revenues` - NULL for 1395-1399, use `state_comp_revenue_total`
- `expenditures.capital_exp` - NULL for 1395-1399, all in `current_exp`
- `expenditures.subsidy_spending` - NULL for 1395-1399, all in `current_exp`

### ❌ Never Use
- `expenditures.unclassified` - Deprecated field, always 0 now

---

## Data Quality Checks

### Verify Budget Balance
```sql
-- Should return 0.000 for all years
SELECT 
    year_persian,
    (r.total - e.total) as difference
FROM years y
JOIN revenues r ON y.year_id = r.year_id
JOIN expenditures e ON y.year_id = e.year_id
ORDER BY year_persian;
```

### Verify Government Budget Balance
```sql
-- For years 1395-1399, government exp should equal government rev
SELECT 
    y.year_persian,
    (r.operational_revenue + r.asset_sales + r.borrowing + r.special_accounts) as gov_rev,
    e.current_exp as gov_exp,
    ((r.operational_revenue + r.asset_sales + r.borrowing + r.special_accounts) - e.current_exp) as diff
FROM years y
JOIN revenues r ON y.year_id = r.year_id
JOIN expenditures e ON y.year_id = e.year_id
WHERE y.year_persian <= 1399;
```

---

## Data Sources

All data from official Iranian budget laws (قانون بودجه کل کشور):
- **Primary source:** Majlis (Parliament) official budget law texts - ماده واحده
- **State companies detail:** Table 11 / پیوست ۳ (Attachment 3) of budget law (years 1400-1404)
- **Government aggregates:** Article text for all years
- **Verification:** Cross-referenced with official law documents for accuracy

---

## Common Gotchas & Solutions

### Gotcha #1: "Why is current_exp so large for year 1398?"
**Answer:** For years 1395-1399, ALL government expenditure is in `current_exp` (aggregate). It's not just current expenses.

### Gotcha #2: "State company revenue columns are NULL for old years!"
**Answer:** Use `state_comp_revenue_total` for aggregate. Detailed columns only populated for 1400-1404.

### Gotcha #3: "Total doesn't match my manual calculation!"
**Answer:** Don't forget the double-counting adjustment! Use the stored `total` field, not manual sum.

### Gotcha #4: "Why does COALESCE keep showing up in queries?"
**Answer:** Because NULL vs 0 matters. NULL = "not available", 0 = "explicitly zero". Use COALESCE to treat NULL as 0 in calculations.

---

## Best Practices

1. **Always use stored totals** (`revenues.total`, `expenditures.total`) - don't recalculate
2. **Check year range** before accessing detailed fields (capital_exp, subsidies, etc.)
3. **Use COALESCE** when summing fields that might be NULL
4. **Join on year_id**, not year_persian (faster, enforced by foreign keys)
5. **Document your queries** - explain which years have which data

---

## Is This Database "Convoluted"?

**No.** It accurately reflects reality:
- ✅ Some years have detailed data, others don't (matches official publications)
- ✅ Budget law has two tiers (government + state companies)
- ✅ Double-counting adjustments are real (required by law)
- ✅ Aggregate vs detailed is a feature, not a bug

The complexity is in **Iranian budget law**, not the database design.

---

**Last Updated:** December 31, 2024  
**Database Version:** Complete & balanced 10-year dataset (1395-1404)