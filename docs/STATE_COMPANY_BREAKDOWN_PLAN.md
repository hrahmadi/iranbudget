# State Company Revenue Breakdown - Implementation Plan

## Current Structure (Indices 0-30)

### Level 1 - Detailed Revenue (0-10)
- 0-8: Government revenue details
- 9: Ministry revenue  
- 10: State companies (AGGREGATE - needs breakdown!)

### Level 2 - Aggregated (11-13)
- 11: Tax revenue
- 12: Oil & Gas
- 13: Other revenue

### Center (14-15)
- 14: Total revenue
- 15: Total spending

### Level 3 - Main Spending (16-19)
### Level 4 - Detailed Spending (20-30)

---

## NEW Structure (Need to add 6 state company nodes)

### Level 0 - State Company Detail (NEW - indices 0-5)
- 0: Company Operations (revenues)
- 1: Government Credits (current + capital)
- 2: Domestic Loans
- 3: Foreign Loans  
- 4: Asset Sales (current assets)
- 5: Other Receipts

### Level 1 - Government Revenue Detail (shift to 6-14)
- 6: Corporate Tax
- 7: Individual Tax
- 8: VAT
- 9: Import Duties
- 10: Other Taxes
- 11: Oil Exports
- 12: Gas & Condensate
- 13: Fees & Charges
- 14: Other Income

### Level 1b - Direct flows (15-16)
- 15: Ministry Revenue (direct to center)
- 16: State Companies AGGREGATE (from level 0)

### Level 2 - Aggregated (17-19)
- 17: Tax Revenue
- 18: Oil & Gas
- 19: Other Revenue

### Center (20-21)
- 20: Total Revenue
- 21: Total Spending

### Level 3 - Main Spending (22-25)
### Level 4 - Detailed Spending (26-36)

Total nodes: 37 (was 31)

---

## Link Structure

### State Company Details → State Company Aggregate
- 0 → 16 (operations)
- 1 → 16 (credits)
- 2 → 16 (domestic loans)
- 3 → 16 (foreign loans)
- 4 → 16 (assets)
- 5 → 16 (other)

### Government Details → Aggregates  
- 6-10 → 17 (taxes)
- 11-12 → 18 (oil/gas)
- 13-14 → 19 (other)

### Aggregates + Direct → Center
- 17 → 20 (tax to revenue)
- 18 → 20 (oil to revenue)
- 19 → 20 (other to revenue)
- 15 → 20 (ministry direct)
- 16 → 20 (state companies direct)

---

## Visual Layout

```
Level 0 (x=0.02)    Level 1 (x=0.12)    Level 2 (x=0.28)    Center    Level 3    Level 4
─────────────────────────────────────────────────────────────────────────────────────────
Company Ops ─┐
Credits ─────┤
Loans Dom ───┤──→ State Co ──────────────────────┐
Loans For ───┤      (16)                         │
Assets ──────┤                                    │
Other ───────┘                                    │
                                                  │
                Corporate ─┐                      │
                Individual─┤                      │
                VAT ───────┤→ Tax ─────────────┐  │
                Import ────┤  (17)             │  │
                Other Tax ─┘                   │  │
                                               │  │
                Oil Exp ───┐                   │  │
                Gas ───────┘→ Oil/Gas ─────────┤  │
                             (18)              │  │
                                               ├──┤
                Fees ───────┐                  │  │
                Other Inc ──┘→ Other ──────────┘  │
                               (19)               │
                                                  │
                Ministry ─────────────────────────┤
                (15)                              │
                                                  ├──→ Revenue ──→ Spending ──→ ...
                                                  │     (20)        (21)
                                                  │
────────────────────────────────────────────────────────────────────────────────────────
```

---

## Implementation Notes

1. Add 6 new nodes at beginning
2. Shift all existing indices +6
3. Update all link source/target indices
4. Add new links for state company breakdown
5. Adjust x-positions to fit extra level

## For Issue #2 (Z-ordering)

Try these in Plotly Sankey:
- `arrangement: 'snap'` instead of 'freeform'  
- Or keep freeform but ensure links are added in strict top-to-bottom order
- Plotly doesn't expose Z-index control, so ordering is our only option
