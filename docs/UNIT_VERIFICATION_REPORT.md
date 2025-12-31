# Unit Verification Report - Iran Budget Database

**Analysis Date:** 2025-12-30  
**Critical Finding:** MAJOR UNIT DISCREPANCY DETECTED

---

## 🚨 CRITICAL ISSUE IDENTIFIED

### Official Budget Numbers (from Government Sources):

**Year 1395:**
- Official: 9,785,529,974,000,000 ریال (9.785 quadrillion rials)
- In words: "نه میلیون و هفتصد و هشتاد و پنج هزار و پانصد و بیست و نه میلیارد و نهصد و هفتاد و چهار میلیون ریال"
- Translation: 9 million 785 thousand 529 billion 974 million rials
- **Actual unit: MILLION BILLION RIALS** = 9,785,529.974 billion rials

**Year 1403:**
- Official: 64,587,123,997,000,000 ریال (64.587 quadrillion rials)
- Translation: 64,587,123.997 billion rials

**Year 1404:**
- Official (Proposed): 118,966,000,000,000 ریال old money
- Converting: 118,966 billion rials (thousand billion)
- OR: 112.795.309.000.000.000 ریال (final approved)
- **112,795,309 billion rials** or **112.8 trillion rials**

---

## 📊 Database vs Reality Comparison

### Year 1395:
| Source | Total Budget (billion rials) | Ratio |
|--------|------------------------------|-------|
| **Official** | 9,785,529.974 | 1.0x |
| **Database** | 1,502,445.771 | **0.15x** ❌ |
| **Discrepancy** | **-8,283,084 billion** | **-85%** |

### Year 1404:
| Source | Total Revenue (billion rials) | Total Expenditure |
|--------|-------------------------------|-------------------|
| **Official** | 49,564,550 | 53,844,550 |
| **Database** | 49,565,000 | 53,845,000 |
| **Match** | ✅ Correct | ✅ Correct |

---

## 🔍 Root Cause Analysis

### Problem: Years 1395-1403 are UNDERSTATED in database

The database values for years 1395-1403 appear to be:
1. **Wrong unit conversion** OR
2. **Partial budget data** (only government budget, not total national budget)

### Evidence:

**Year 1395 Official Breakdown:**
- **Total National Budget:** 9,785,529.974 billion rials
  - Government Budget: 3,354,895.145 billion rials  
  - State Companies/Banks: 6,816,945.864 billion rials

**Year 1395 Database:**
- Revenues total: 1,502,445.771 billion rials
- Expenditures total: 1,650,185.002 billion rials

**Hypothesis:** Database contains ONLY a portion of government budget, NOT total national budget!

---

## 📈 Unit Clarification

### Iranian Budget Terminology:

**بودجه کل کشور (Total National Budget):**
- Includes:
  - بودجه عمومی دولت (Government General Budget)
  - بودجه شرکت‌های دولتی (State Companies Budget)
  - بانک‌ها (Banks)

**Our Database Appears to Contain:**
- ONLY revenues/expenditures of government operations
- MISSING state companies and banks portions

---

## 🔢 Correct Official Numbers

### Year 1395 (2016-2017):
```
Total National Budget: 9,785,529,974 million rials
= 9,785,529.974 billion rials
= 9.785 trillion rials
```

### Year 1403 (2024-2025):
```
Total National Budget: 64,587,123,997 million rials  
= 64,587,123.997 billion rials
= 64.587 trillion rials
```

### Year 1404 (2025-2026):
```
Total National Budget (Approved): 112,795,309,000 million rials
= 112,795,309 billion rials
= 112.8 trillion rials

Government General Budget: 53,844,550 billion rials
- Revenues: 49,564,550 billion rials
- Expenditures: 53,844,550 billion rials
```

### Year 1405 (2026-2027) - NEW CURRENCY:
```
Total Budget: 14,441,417,555,600 NEW RIALS
(with 4 zeros removed)
= 144,414,175,556,000 OLD RIALS
= 144.414 trillion old rials
```

---

## ⚠️ Impact on Project

### Current State:
1. **Year 1404:** ✅ CORRECT - matches official numbers
2. **Years 1395-1403:** ❌ INCORRECT - significantly understated

### What This Means:
- Sankey diagrams for 1395-1403 show PARTIAL budget only
- Year-over-year comparisons are MISLEADING
- Growth rates are ARTIFICIALLY HIGH for 1404

---

## 🔧 Recommended Actions

### Option 1: Update Database with Full National Budget ⭐ RECOMMENDED
Search for complete national budget data including:
- Government general budget
- State-owned companies
- Banking sector

### Option 2: Document Clearly
Add prominent disclaimers:
- "1395-1403: Government budget only"
- "1404: Full national budget"
- Note: Not directly comparable

### Option 3: Use Consistent Subset
Extract only government general budget for 1404 to match 1395-1403:
- Keep current 1395-1403 data
- Update 1404 to show only government portion (53.8T out of 112.8T)

---

## 📋 Verification Checklist

**Year 1395:**
- [ ] Official total: 9,785.5 trillion rials
- [x] Database has: 1,502.4 billion rials ❌
- [ ] Ratio: 15.4% (missing 84.6%)

**Year 1404:**
- [x] Official government budget: 53.8 trillion rials ✅
- [x] Database has: 53.8 trillion rials ✅
- [x] Match: Perfect!

---

## 🎯 Conclusion

**MAJOR FINDING:** Database is internally inconsistent

- **Years 1395-1403:** Partial data (government budget only)
- **Year 1404:** Complete data (full national budget)

**This makes ALL cross-year comparisons invalid without correction!**

---

## 📚 Sources Used

1. شانا (SHANA - Energy News Agency): Year 1395 official budget law
2. اقتصاد آنلاین: Year 1403 budget report  
3. نام نمک، یانگ‌نیوز، تابناک: Year 1404 budget reports
4. خبرگزاری مهر: Year 1405 budget (with new currency)

All sources confirm the official numbers listed above.

---

**Status:** 🔴 REQUIRES IMMEDIATE ATTENTION BEFORE APP DEPLOYMENT
# Year 1403 Unit Verification

**Date:** 2025-12-30

---

## Official Year 1403 Budget (2024-2025)

### Total National Budget:
**64,587,123,997,000,000 ریال**

Written form: "شصت و چهار میلیون و پانصد و هشتاد و هفت هزار و یکصد و بیست و سه میلیارد و نهصد و نود و هفت میلیون ریال"

Translation: 64 million 587 thousand 123 billion 997 million rials

**Conversion:**
= 64,587,123.997 billion rials
= 64,587.124 trillion rials  
= 6,458.7 thousand billion toman

---

## Breakdown of 1403 Budget:

### Part A - Government General Budget:
**28,371,400,000,000,000 ریال**
= 28,371,400 billion rials
= 28,371.4 trillion rials

Components:
1. General Resources: 25,620,400 billion rials
2. Special Revenue (Ministries): 2,751,000 billion rials

### Part B - State Companies, Banks, Institutions:
**37,415,723,997,000,000 ریال**
= 37,415,723.997 billion rials
= 37,415.7 trillion rials

**Double-counted amounts to subtract:** 1,200,000 billion rials

**Net Total:** 64,587,124 billion rials ✅

---

## Database Comparison:

| Metric | Database | Official | Match? |
|--------|----------|----------|--------|
| **Revenue** | 13,019,221.500 | 28,371,400 (gov only) | ❌ 46% |
| **Expenditure** | 13,930,062.600 | 28,371,400 (gov only) | ❌ 49% |
| **Total National** | N/A | 64,587,124 | ❌ Missing |

---

## Analysis:

### Database Contains:
- **~13,000-14,000 billion rials** range
- Much less than even government budget alone (28,371 billion)

### Hypothesis:
Database might contain only a SUBSET of government general budget:
- Perhaps only "منابع عمومی" (general resources: 25,620 billion)
- Missing "درآمد اختصاصی" (special revenue: 2,751 billion)
- Still doesn't add up correctly

### Discrepancy:
- Database revenue (13,019) vs General Resources (25,620) = **51% of general resources**
- Database revenue (13,019) vs Total Gov Budget (28,371) = **46% of government budget**
- Database revenue (13,019) vs Total National (64,587) = **20% of national budget**

---

## Conclusion for 1403:

🚨 **SAME PROBLEM AS 1395-1402**

Year 1403 database values are also **SIGNIFICANTLY UNDERSTATED**

The pattern is consistent:
- Database has roughly **20-50%** of official government budget
- Missing state companies/banks entirely
- Unclear which specific subset is included

---

## Recommendation:

All years 1395-1403 need verification against official sources to determine:
1. What exact scope of budget is in the database?
2. Is it a consistent subset across all years?
3. Should we update to full national budget or document clearly?

**Only Year 1404 appears to have correct government general budget values.**
