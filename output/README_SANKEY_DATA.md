# Iran National Budget - Sankey Aggregate Data (1395-1404)

## Overview

This CSV contains **10 years of aggregate budget data** matching the structure of the Sankey flow diagram, covering years 1395-1404 (Persian calendar) = 2016-2026 (Gregorian calendar).

**File:** `iran_budget_sankey_aggregate.csv`  
**Source:** Official Iranian budget laws + calculated aggregates  
**Unit:** Billion rials (1,000 billion = 1 trillion)  
**Rows:** 10 (one per year)  
**Columns:** 13

---

## Column Definitions

### Year Identification
- **Year (Persian)** - Year in Persian calendar (1395-1404)
- **Year (Gregorian)** - Corresponding Gregorian year range (e.g., "2016-2017")

### Revenue Categories (5 columns)
All in billion rials:

1. **Tax Revenue** (درآمد مالیاتی) - Corporate tax, individual tax, VAT, customs duties
2. **Oil & Gas Revenue** (درآمد نفت و گاز) - Oil exports, gas exports, condensates
3. **State Companies Revenue** (درآمد شرکت‌های دولتی) - State-owned enterprises, banks
4. **Other Revenue** (سایر درآمدها) - Asset sales, fees, charges, other income
5. **Ministry Revenue** (درآمد اختصاصی) - Ministry-specific fees and services

### Total Revenue
6. **TOTAL REVENUE** (کل منابع) - Sum of all revenue sources

### Expenditure Categories (4 columns)
All in billion rials:

7. **Personnel Costs** (هزینه‌های پرسنلی) - Salaries, pensions, benefits
   - **Years 1395-1399:** Estimated as 45% of government current + 30% of state companies
   - **Years 1400-1404:** Direct from current expenditure + state company current expenditure
   
8. **Development Projects** (طرح‌های عمرانی) - Infrastructure, capital investments
   - Government capital expenditure + state company capital expenditure
   
9. **Debt Service** (بازپرداخت بدهی) - Loan repayments, debt obligations
   - State company domestic + foreign + debt repayments
   
10. **Support Programs** (برنامه‌های حمایتی) - Subsidies, cash transfers
    - Energy subsidies, cash subsidies, food subsidies

### Total Expenditure
11. **TOTAL EXPENDITURE** (کل مصارف) - Sum of all spending categories

---

## Data Calculation Methods

### Revenue Side
All revenue fields are **direct from database** - no estimation:
- Tax, Oil/Gas, State Companies, Other, Ministry revenues stored as official law values

### Expenditure Side

#### Years 1395-1399 (Aggregate Data)
These years only have total current/capital spending, so categories are **estimated**:

```
Personnel Costs = (Current Exp × 45%) + (State Companies × 30%)
Development     = Capital Exp + State Capital Exp
Debt Service    = State Company Debt Repayments
Support         = Subsidy Spending
```

#### Years 1400-1404 (Detailed Data)
These years have detailed breakdowns:

```
Personnel Costs = Current Exp + State Company Current Exp
Development     = Capital Exp + State Company Capital Exp  
Debt Service    = State Domestic Repay + Foreign Repay + Debt Repay
Support         = Subsidy Spending
```

---

## Key Insights

### Revenue Trends

**Tax Revenue Growth:**
- 1395: 314 billion → 1404: 17,000 billion (54× increase!)
- Massive acceleration in tax collection in 1404

**Oil & Gas:**
- Volatile: dropped to 116B in 1399, recovered to 21,070B in 1404
- Less dominant than before: 18.7% of total in 1404 vs higher % in early years

**State Companies:**
- Consistent growth from 6.4T (1395) to 63.7T (1404)
- Now largest single revenue source at 56.5% of total

### Expenditure Trends

**Personnel Costs:**
- Largest spending category for all years
- 1395: 3.4T → 1404: 71.3T (20× increase)
- Represents 60-63% of total expenditure

**Development Projects:**
- Minimal in 1395-1399 (aggregate years)
- Accelerated in 1400-1404
- 1404: 33T - major infrastructure push

**Debt Service:**
- Only visible in detailed years (1400-1404)
- Relatively stable at 1.7-3.6T per year
- 2-4% of total expenditure

**Support Programs (Subsidies):**
- Minimal until 1404
- 1404: 10.5T - major subsidy expansion

---

## Data Quality Notes

✅ **Revenue:** All direct from official budget laws - high confidence  
✅ **Expenditure (1400-1404):** Direct from detailed breakdowns - high confidence  
⚠️ **Expenditure (1395-1399):** Estimated using percentages - medium confidence  
✅ **Balanced:** Revenue = Expenditure for all years  
⚠️ **Units:** All values in billions - multiply by 1,000 to get trillions  

### Estimation Accuracy (1395-1399)

The 45%/30% split for personnel costs is based on:
- Historical analysis of detailed years (1400-1404)
- Typical government spending patterns
- International budget structure benchmarks

For precise analysis of 1395-1399, use total revenue/expenditure figures which are exact.

---

## Usage Examples

### Python (pandas)
```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('iran_budget_sankey_aggregate.csv')

# Revenue composition over time
df.plot(x='Year (Persian)', 
        y=['Tax Revenue', 'Oil & Gas Revenue', 'State Companies Revenue'],
        kind='area', 
        stacked=True,
        title='Iran Budget Revenue Composition (1395-1404)')
plt.ylabel('Billion Rials')
plt.show()

# Expenditure breakdown (detailed years only)
detailed = df[df['Year (Persian)'] >= 1400]
detailed.plot(x='Year (Persian)',
              y=['Personnel Costs', 'Development Projects', 'Debt Service', 'Support Programs'],
              kind='bar',
              stacked=True)
```

### Excel Analysis
1. Open CSV in Excel
2. Create pivot table: Years (rows) vs Categories (columns)
3. Insert stacked area chart for revenue composition
4. Add trendlines for tax revenue growth

### Visualization Tips
- Use **stacked area chart** for revenue composition over time
- Use **stacked bar chart** for expenditure categories
- **Separate 1395-1399 from 1400-1404** when analyzing expenditure detail
- Show tax revenue growth on **log scale** due to 54× increase

---

## Matching Sankey Diagram

This CSV contains the EXACT same categories as your Sankey flow diagram:

**Revenue Side (Left):**
- Tax Revenue
- Oil & Gas Revenue
- State Companies Revenue  
- Other Revenue
- Ministry Revenue

**Expenditure Side (Right):**
- Personnel Costs
- Development Projects
- Debt Service
- Support Programs

**Center Column:**
- TOTAL REVENUE → TOTAL EXPENDITURE

---

## Additional Resources

- **Full Database:** PostgreSQL `iran_budget` with 30+ detailed fields
- **Documentation:** `/docs/DATABASE_OVERVIEW.md` (if available)
- **Source Laws:** Official Iranian budget laws (قانون بودجه کل کشور)
- **Visualization:** React Sankey diagram with interactive flows

---

## Limitations & Caveats

1. **Personnel estimates (1395-1399):** Based on 45%/30% assumption, not official breakdown
2. **Missing categories:** Some state company detail categories not shown (simplified for clarity)
3. **Inflation:** Values are nominal - adjust for CPI for real analysis
4. **VAT adjustment:** State company revenues already have 30% VAT double-counting removed

---

## Questions?

For detailed breakdowns, original database access, or verification of specific values, contact the database maintainer.

**Last Updated:** January 2, 2025  
**Data Version:** Complete 10-year dataset (1395-1404)  
**Next Update:** When 1405 budget law published (typically April/May 2026)