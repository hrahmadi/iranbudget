# HANDOFF: Fix Sankey Diagram - Special Revenue Mislabeling Issue

## Problem Identified

The current Sankey diagram for year 1404 has a **critical labeling error**:
- Shows "Special Revenue → Total Revenue: 63.23T rials"
- This is **WRONG** - that 63.23T is actually **State Companies Revenue** (شرکت‌های دولتی), NOT special revenue

## Correct 1404 Revenue Breakdown

| Category | Persian Label | Amount (T) | % of Total |
|----------|---------------|------------|------------|
| Operational Revenue | منابع عمومی | 49.6 | 43.9% |
| Special Accounts | درآمد اختصاصی | 4.3 | 3.8% |
| **State Companies** | **شرکت‌های دولتی** | **63.7** | **56.5%** |
| **TOTAL** | | **117.6** | **100%** |

## Database Query to Verify

```sql
SELECT 
    'Operational Revenue' as category, 
    operational_revenue as amount, 
    ROUND((operational_revenue / total * 100)::numeric, 1) as pct
FROM revenues WHERE year_id = 10
UNION ALL
SELECT 
    'Special Accounts', 
    special_accounts, 
    ROUND((special_accounts / total * 100)::numeric, 1)
FROM revenues WHERE year_id = 10
UNION ALL
SELECT 
    'State Companies', 
    state_comp_revenue_total, 
    ROUND((state_comp_revenue_total / total * 100)::numeric, 1)
FROM revenues WHERE year_id = 10;
```

**Expected output:**
```
Operational Revenue  49,565,000   43.9%
Special Accounts      4,280,000    3.8%
State Companies      63,732,759   56.5%
```

## What Needs to be Fixed

### In the Sankey data structure:

**BEFORE (Wrong):**
```javascript
const nodes = [
    { id: 0, name: 'درآمدهای عملیاتی', value: 49565000 },
    { id: 1, name: 'واگذاری دارایی', value: 0 },
    { id: 2, name: 'استقراض', value: 0 },
    { id: 3, name: 'درآمد اختصاصی', value: 4280000 },
    { id: 4, name: 'درآمد شرکت‌های دولتی', value: 63732759 },  // ← This is being mislabeled!
];
```

**AFTER (Correct):**
```javascript
const nodes = [
    { id: 0, name: 'منابع عمومی', nameEn: 'Operational Revenue', value: 49565000, color: '#2A7BA8' },
    { id: 1, name: 'درآمد اختصاصی', nameEn: 'Ministry Revenue', value: 4280000, color: '#6EC9D4' },
    { id: 2, name: 'شرکت‌های دولتی', nameEn: 'State Companies', value: 63732759, color: '#1E5F8C' },
    { id: 3, name: 'کل منابع', value: 117577759, color: '#3D9BB8' },
    // ... expenditure nodes
];
```

## Correct Node Labels

### Revenue Nodes (Left Side)
1. **منابع عمومی** (Operational Revenue)
   - Includes: taxes, oil/gas, fees, charges
   - 49.6T
   - Color: Medium blue (#2A7BA8)

2. **درآمد اختصاصی** (Ministry-Specific Revenue)
   - Ministry fees, charges, services
   - 4.3T - **SMALL** flow
   - Color: Light cyan (#6EC9D4)

3. **شرکت‌های دولتی** (State-Owned Companies)
   - State enterprises, banks, public companies
   - 63.7T - **LARGEST** flow
   - Color: Dark blue (#1E5F8C)

### Expenditure Nodes (Right Side)
1. **هزینه‌های جاری** (Current Expenditures) - 22.7T
2. **هزینه‌های سرمایه‌ای** (Capital Expenditures) - 20.7T
3. **یارانه‌ها** (Subsidies) - 10.5T
4. **هزینه شرکت‌های دولتی** (State Companies Exp) - 63.7T

## Where the Bug Likely Is

Check these locations in the code:

### Location 1: Data Loading from Database
```javascript
// WRONG - Don't do this
const specialRevenue = data.revenues.state_companies; // ❌

// CORRECT
const operationalRevenue = data.revenues.operational;
const specialAccounts = data.revenues.special_accounts;  // ✓ Small
const stateCompanies = data.revenues.state_companies;    // ✓ Large
```

### Location 2: Node Labels
```javascript
// Make sure labels match values
nodes: [
    { label: 'منابع عمومی', value: 49565 },      // ✓
    { label: 'درآمد اختصاصی', value: 4280 },     // ✓ Small!
    { label: 'شرکت‌های دولتی', value: 63733 },  // ✓ Large!
]
```

### Location 3: Tooltip Text
```javascript
// Tooltips should show correct category names
tooltip: `${node.name}: ${value} هزار میلیارد ریال`
// NOT "Special Revenue" for the 63.7T flow!
```

## Visual Check After Fix

After fixing, the diagram should show:
- ✅ Three distinct flows from left (revenue sources) to center
- ✅ **Largest flow** = State Companies (63.7T, ~56% of total)
- ✅ **Medium flow** = Operational Revenue (49.6T, ~44% of total)
- ✅ **Tiny flow** = Special Accounts (4.3T, ~4% of total)

The visual proportions should make it OBVIOUS that state companies dominate the revenue side.

## Testing

After fixing, verify:

1. **Hover over the large blue flow** → Should say "شرکت‌های دولتی" (State Companies), NOT "Special Revenue"
2. **Check the small cyan flow** → Should say "درآمد اختصاصی" with 4.3T
3. **Visual proportion** → State companies flow should be visibly larger than operational revenue

## Files to Update

Primary files that likely need fixing:
1. `iran_budget_1404_sankey.html` - Plotly-based version
2. `iran_budget_1404_slopes.jsx` - React SVG version
3. Any Python script generating Sankey data

## Reference Implementation

A corrected version has been created at:
- `/mnt/user-data/outputs/iran_budget_1404_fixed.jsx`

This shows the correct structure with:
- Proper labels (Persian + English)
- Correct value assignments
- Proportional visual representation
- Percentage breakdown footer

## Database Fields Reference

```sql
-- revenues table for year 1404
operational_revenue      = 49,565,000  -- منابع عمومی
special_accounts         =  4,280,000  -- درآمد اختصاصی (SMALL!)
state_comp_revenue_total = 63,732,759  -- شرکت‌های دولتی (LARGE!)
total                    =112,795,309  -- After double-counting adjustment
```

## Common Mistakes to Avoid

❌ **Don't** use `special_accounts` label for `state_comp_revenue_total`  
❌ **Don't** call state companies "Special Revenue"  
❌ **Don't** swap the 4.3T and 63.7T values  
✅ **Do** verify against database before deploying  
✅ **Do** add English labels for clarity  
✅ **Do** show percentage breakdown  

---

**Priority:** HIGH - This is a critical data accuracy issue  
**Impact:** Users see completely wrong revenue composition  
**Effort:** Low - Simple label/value mapping fix  

**Last Updated:** December 31, 2024