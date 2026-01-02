# Sankey Layout Mechanics - Critical Insights

## Discovery Date
January 2, 2026

## The Problem
Revenue side had visual inconsistency: paths from "Other Revenue" and "Ministry Revenue" aggregate nodes were starting from BELOW the "State Companies" aggregate node, even though their Y-position values indicated they should be above it.

## Root Cause
**Y-position values control STACKING ORDER, not visual position.**

The custom Sankey layout engine:
1. Sorts nodes by Y-position (ascending)
2. Stacks them sequentially from top to bottom
3. Each node's height is determined by its scaled value
4. Larger values = taller nodes = push subsequent nodes lower

## The Key Insight
```
Y-position = Sort Index, NOT Visual Coordinate
```

When you set:
- Node A: y=0.30, value=10T
- Node B: y=0.60, value=50T (LARGE!)
- Node C: y=0.70, value=5T

The layout engine stacks them:
1. Node A at top (y=0.30 → sorted first)
2. Node B in middle (y=0.60 → sorted second, takes up HUGE space)
3. Node C at bottom (y=0.70 → sorted third, appears below Node B)

**Result:** Node C visually appears BELOW Node B, even though you might expect B to be at the bottom since it has the largest value.

## Solution Pattern
To control visual order in the presence of large nodes:

**Want visual order:** Tax → Oil → State Companies → Other → Ministry

**Set Y values based on desired stacking sequence:**
```typescript
tax-revenue:           y=0.15  // Stack 1st (top)
oil-gas-revenue:       y=0.30  // Stack 2nd
state-company-revenue: y=0.55  // Stack 3rd (LARGE, but in middle)
other-revenue:         y=0.65  // Stack 4th (appears below State Companies)
ministry-revenue:      y=0.75  // Stack 5th (appears at bottom)
```

## Files Modified
- `frontend/lib/budget-transform.ts`: All node Y-position assignments
- Commits: f9ff201, 34fda63

## Lessons Learned
1. **Y-position is not a coordinate** - it's a stacking order index
2. **Large values dominate visual space** - they push subsequent nodes down
3. **Test visual order with actual data** - small test values won't reveal stacking issues
4. **Document layout assumptions** - this is non-obvious behavior

## Future Considerations
If we ever need absolute positioning instead of stacking:
- Would need to modify CustomSankey.tsx layout algorithm
- Replace sequential stacking with direct Y-coordinate mapping
- Would break automatic vertical centering and gap management
