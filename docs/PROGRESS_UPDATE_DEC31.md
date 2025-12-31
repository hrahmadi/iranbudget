# Progress Update - December 31, 2025

## Issues Addressed

### Issue 1: State Company Revenue Breakdown ⏳ IN PROGRESS

**Request:** Add detail level for state companies on revenue side

**Status:** Partially implemented
- ✅ API now returns state company breakdown fields
- ✅ Data interface updated
- ✅ Labels added
- ⏳ Node structure needs major refactoring (adding 6 nodes, renumbering all indices)

**Available breakdown:**
- Company Operations: 50.4T
- Government Credits: 0.5T
- Domestic Loans: 4.6T
- Foreign Loans: Available
- Current Assets: Available
- Other Receipts: Available

**Complexity:** HIGH - requires restructuring entire node system (37 nodes instead of 31)

**Plan created:** `/docs/STATE_COMPANY_BREAKDOWN_PLAN.md`

---

### Issue 2: Z-ordering / Link Overlap ✅ ATTEMPTED

**Request:** Fix visual overlap of flows

**What we tried:**
1. ✅ Changed `arrangement: 'freeform'` → `arrangement: 'snap'`
2. ✅ Ensured links added in strict top-to-bottom order

**Limitation:** Plotly Sankey doesn't expose Z-index control

**Alternative solutions:**
- Use `arrangement: 'snap'` (auto-layout)
- Increase node `pad` spacing
- Adjust node positions manually with `freeform`

**Status:** Test with `snap` arrangement first

---

## Current State

### Working Features ✅
1. Budget balanced (112.8T both sides)
2. State companies included in expenditure
3. Vertical text on center columns
4. Correct labeling (no more "special revenue" confusion)
5. Government + state company spending combined by category

### Files Modified Today
1. `/app/api/budget/route.ts` - Added state company revenue fields
2. `/lib/budget-transform.ts` - Added state breakdown parsing (not yet used)
3. `/lib/labels.ts` - Added state company labels
4. `/components/HierarchicalSankey.tsx` - Changed to `snap` arrangement

---

## Next Steps

### Option A: Quick Fix (Recommended)
1. Test current `snap` arrangement
2. If better, keep it
3. Document that state company revenue is shown as aggregate
4. Note: Full breakdown requires major refactoring

### Option B: Full Implementation  
1. Implement complete node restructuring (37 nodes)
2. Add state company revenue level
3. Renumber all existing nodes (+6 offset)
4. Update all link indices
5. Adjust x-positions for extra level

**Estimate:** Option A = 5 min, Option B = 1-2 hours

---

## Technical Debt

**Major refactoring needed for:**
- State company revenue breakdown (6 new nodes)
- May want to also add government expenditure breakdown (show gov vs state separately on spending side)

**Current approach:**
- Revenue: Showing state companies as single aggregate
- Expenditure: Combining gov + state by category (Personnel, Development, etc.)

This is actually a reasonable simplification that shows the important flows clearly.

---

## Recommendation

**For now:**
1. Test the `snap` arrangement - does it help with overlap?
2. If yes, ship it as-is
3. State company revenue breakdown can be Phase 2 (requires major work)

**The current diagram shows:**
- ✅ Correct totals
- ✅ Balanced budget
- ✅ State companies on revenue side (as aggregate)
- ✅ State companies on expenditure side (merged with gov by category)
- ⚠️ Overlap issue partially addressed

This is production-ready with known limitations documented.

---

**Status:** Ready for testing `snap` arrangement
**Decision needed:** Full state breakdown or ship current version?
