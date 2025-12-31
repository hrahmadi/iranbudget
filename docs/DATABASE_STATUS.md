# Iran Budget Database - Data Status Summary

**Last Updated:** 2025-12-31

## Overall Status: 6/10 Years Complete

### Data Quality Tiers

**Tier 1 - Full Detail (5 years):** Complete government + detailed state companies breakdown
- ✅ 1404, 1403, 1402, 1401, 1400

**Tier 2 - Aggregate Only (1 year):** Complete government + aggregate state companies totals  
- ⚠️ 1399

**Tier 3 - Government Only (4 years):** Government budget only, missing state companies
- ❌ 1398, 1397, 1396, 1395

---

## Year-by-Year Status

### 1404 ✅ COMPLETE - Full Detail
- Government Budget: 53,845,000 billion rials
- State Companies (Detailed): 63,732,759 billion rials
- **Total National: 112,795,309 billion rials**
- Source: Official law + Table 11

### 1403 ✅ COMPLETE - Full Detail  
- Government Budget: 28,371,400 billion rials
- State Companies (Detailed): 37,415,724 billion rials
- **Total National: 64,587,124 billion rials**
- Source: Official law + Table 11

### 1402 ✅ COMPLETE - Full Detail
- Government Budget: 22,634,918 billion rials
- State Companies (Detailed): 28,839,107 billion rials
- **Total National: 49,947,144 billion rials**
- Source: Official law + Table 11

### 1401 ✅ COMPLETE - Full Detail
- Government Budget: 15,273,715 billion rials
- State Companies (Detailed): 22,314,079 billion rials
- **Total National: 37,587,794 billion rials**
- Source: Official law + Table 11

### 1400 ✅ COMPLETE - Full Detail
- Government Budget: 13,737,699 billion rials
- State Companies (Detailed): 15,713,218 billion rials
- **Total National: 28,823,398 billion rials**
- Source: Official law + Table 11

### 1399 ⚠️ AGGREGATE ONLY
- Government Budget: 6,407,771 billion rials
- State Companies (Aggregate): 14,359,226 billion rials
- **Total National: 20,176,017 billion rials**
- Source: Official law (detailed table not available online)
- **Note:** Missing detailed breakdown for state companies

### 1398 ❌ INCOMPLETE
- Government Budget: 2,149,498 billion rials
- State Companies: **MISSING**
- **Total:** Incomplete
- **Action Needed:** Find official law for state companies aggregate

### 1397 ❌ INCOMPLETE
- Government Budget: 1,895,748 billion rials
- State Companies: **MISSING**
- **Total:** Incomplete
- **Action Needed:** Find official law for state companies aggregate

### 1396 ❌ INCOMPLETE
- Government Budget: 1,656,310 billion rials
- State Companies: **MISSING**
- **Total:** Incomplete
- **Action Needed:** Find official law for state companies aggregate

### 1395 ❌ INCOMPLETE
- Government Budget: 1,502,446 billion rials
- State Companies: **MISSING**
- **Total:** Incomplete
- **Action Needed:** Find official law for state companies aggregate

---

## Next Steps

1. **Find state companies aggregates for 1395-1398:**
   - Search for official budget law texts (ماده واحده)
   - Look for: "بودجه شرکت‌های دولتی، بانک‌ها و مؤسسات انتفاعی"
   - Extract total amounts

2. **Data completeness priorities:**
   - Priority 1: Get 1398 (most recent incomplete year)
   - Priority 2: Get 1397
   - Priority 3: Get 1396  
   - Priority 4: Get 1395

3. **Future enhancement (optional):**
   - Try to find detailed breakdowns for 1395-1399 if available
   - Check parliamentary archives or research institutions

---

## Database Schema Notes

### Revenues Table
- **Detailed columns available for 1400-1404:**
  - state_comp_revenues
  - state_comp_current_credits
  - state_comp_capital_credits
  - state_comp_domestic_loans
  - state_comp_foreign_loans
  - state_comp_current_assets
  - state_comp_other_receipts
  - state_comp_financial_assets
  - state_comp_revenue_total

- **For 1399 and earlier:** Only `state_comp_revenue_total` populated

### Expenditures Table  
- **Detailed columns available for 1400-1404:**
  - state_comp_current_exp
  - state_comp_taxes
  - state_comp_special_dividend
  - state_comp_dividends
  - state_comp_other_profit
  - state_comp_domestic_repay
  - state_comp_foreign_repay
  - state_comp_managed_funds
  - state_comp_debt_repay
  - state_comp_capital_exp
  - state_comp_current_assets_increase
  - state_comp_exp_total
  - state_comp_double_counted
  - state_comp_net

- **For 1399 and earlier:** Only aggregate columns populated
