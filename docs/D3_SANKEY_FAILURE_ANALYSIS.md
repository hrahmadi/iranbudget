# D3-Sankey Layout Problem - Technical Handoff

## Current State: BLOCKED

**Date:** January 1, 2026  
**Status:** D3-sankey implementation failing - worse than Plotly  
**Blocker:** Node positioning and link routing fundamentally broken

---

## Problem Summary

After migrating from Plotly to D3-sankey to fix overlapping flows, the visualization is now **unreadable** with scattered nodes and chaotic link paths. The D3 layout computation conflicts with our manual positioning requirements.

---

## Visual Comparison

### Plotly (Original - flawed but readable)
- ✅ Nodes in correct horizontal positions
- ✅ Reasonable vertical spacing
- ❌ Links overlap and cross unnecessarily
- ❌ No control over link ordering

### D3-Sankey (Current - broken)
- ❌ Nodes scattered vertically despite position overrides
- ❌ Links routing incorrectly
- ❌ Node heights calculated wrong
- ❌ Overall layout chaotic and unreadable
- **Worse than original Plotly version**

---

## Root Cause Analysis

### The Fundamental Conflict

**What we need:**
- Manual control over ALL node positions (x, y)
- Nodes stay exactly where we place them
- D3 only routes the links between fixed nodes
- Node heights proportional to flow values

**What D3-sankey does:**
- Optimizes layout globally to minimize crossings
- Calculates node positions based on graph topology
- Expects nodes to be flexible and movable
- Our position overrides break its internal assumptions

### Code Issues

**File:** `frontend/components/D3HierarchicalSankey.tsx`

**Attempted fix (failed):**
```typescript
// Force our manual positions - override D3's auto-layout
graph.nodes.forEach((node: any, i: number) => {
  const originalNode = sankeyData.nodes[i];
  const nodeHeight = node.y1 - node.y0;
  
  node.x0 = originalNode.x * dimensions.width;
  node.x1 = node.x0 + 25;
  node.y0 = originalNode.y * dimensions.height;
  node.y1 = node.y0 + nodeHeight;
});
```

**Why it fails:**
1. D3 calculates link paths BEFORE we override positions
2. Links are drawn to the wrong node positions
3. Node heights are based on auto-layout, not our positioning
4. The order of operations is fundamentally wrong

---

## What We've Tried

### Attempt 1: Use D3's auto-layout
- **Result:** Completely ignored our semantic grouping
- **Outcome:** Nodes scattered randomly

### Attempt 2: Override positions after layout
- **Result:** Nodes move but links don't update
- **Outcome:** Disconnected mess (current state)

### Attempt 3: Use `.nodeSort()` for ordering
- **Result:** Only affects vertical order within columns, not positions
- **Outcome:** Minimal improvement

---

## The Hard Truth

**D3-sankey is designed for automatic layout, not manual positioning.**

From D3-sankey documentation:
> "The sankey layout computes the depth (x-position) of each node based on the graph topology."

Our use case violates D3-sankey's core assumptions. We're trying to force it to do something it wasn't designed for.

---

## Options Going Forward

### Option A: Custom SVG Implementation ⭐ RECOMMENDED
**Approach:** Build Sankey manually with D3 primitives (not d3-sankey)

**What we control:**
- Exact node positions (our manual x, y)
- Node heights calculated from flow values
- Link paths using `d3.linkHorizontal()` or custom Bezier curves
- Complete control over rendering order

**Effort:** 2-3 days
**Quality:** Professional, production-ready
**Maintainability:** Full control, no library constraints

**Implementation:**
```typescript
// Pseudo-code
nodes.forEach(node => {
  // Draw rectangle at exact position
  svg.append('rect')
    .attr('x', node.x * width)
    .attr('y', node.y * height)
    .attr('width', nodeWidth)
    .attr('height', calculateHeight(node.value, totalValue, availableHeight));
});

links.forEach(link => {
  // Calculate Bezier path between fixed nodes
  const path = createLinkPath(
    sourceNode.position,
    targetNode.position,
    link.value
  );
  svg.append('path').attr('d', path);
});
```

### Option B: Accept Plotly Limitations ⚠️ FALLBACK
**Approach:** Revert to Plotly, optimize what we can control

**Changes to make:**
- Use `arrangement: 'snap'` (prevents overlaps)
- Accept that node positions will be adjusted
- Increase height to 1200px for more spacing
- Simplify data structure (merge small categories)

**Effort:** 1 day (mostly reverting changes)
**Quality:** "Good enough" but not ideal
**Maintainability:** Stuck with Plotly's limitations

### Option C: Highcharts Sankey 💰 COMMERCIAL
**Approach:** Try Highcharts (commercial library, better than Plotly)

**Pros:**
- Better link routing than Plotly
- More configuration options
- Professional support

**Cons:**
- License cost (~$500-1000/year)
- Still may not support full manual positioning
- Learning curve for new library

**Effort:** 2-4 days
**Quality:** Unknown until tested
**Risk:** May have same fundamental issues

### Option D: Simplify Visualization 🔄 COMPROMISE
**Approach:** Reduce complexity to fit library constraints

**Changes:**
- Collapse detail levels (show only 3 levels instead of 5)
- Merge small categories into "Other"
- Reduce node count from 37 to ~20
- Accept some information loss

**Effort:** 1-2 days
**Quality:** Less detailed but cleaner
**Trade-off:** Lose granularity that was a project goal

---

## Recommended Path: Custom SVG Implementation

### Why This Is The Right Choice

1. **We already have the data structure** - `SankeyBuilder` creates perfect node/link definitions
2. **D3 primitives are well-documented** - `d3.linkHorizontal()`, path generation
3. **Full control over aesthetics** - Gradients, colors, animations, everything
4. **Production examples exist** - NYT, FT visualizations use custom implementations
5. **Long-term maintainability** - No library constraints or breaking changes

### Implementation Phases

**Phase 1: Node Rendering (4 hours)**
- Draw rectangles at exact positions
- Calculate heights from flow values
- Add labels with proper positioning

**Phase 2: Link Paths (6 hours)**
- Implement Bezier curve generation
- Calculate link widths from values
- Handle vertical stacking within nodes

**Phase 3: Gradients & Styling (4 hours)**
- Linear gradients for links
- Match current visual design
- Hover effects and interactions

**Phase 4: Integration (4 hours)**
- Replace D3HierarchicalSankey component
- Test with all control modes (percentage, units, languages)
- Performance optimization

**Total:** ~18 hours = 2-3 days

---

## Technical Specifications

### Current Data Structure (WORKS - Keep This)
```typescript
interface SankeyNode {
  id: string;
  label: string;
  value: number;
  color: string;
  x: number;  // 0-1, horizontal position
  y: number;  // 0-1, vertical position
}

interface SankeyLink {
  source: number;  // Index in nodes array
  target: number;  // Index in nodes array
  value: number;
  color: string;
}
```

### Custom Implementation Requirements

**Node Layout:**
```typescript
const nodeHeight = (node.value / totalValue) * availableHeight;
const nodeX = node.x * width;
const nodeY = node.y * height - (nodeHeight / 2); // Center on y position
```

**Link Path Algorithm:**
```typescript
// Bezier curve connecting two nodes
const linkPath = (source, target, value) => {
  const sourceY = calculateLinkYOffset(source, linkIndex);
  const targetY = calculateLinkYOffset(target, linkIndex);
  const thickness = (value / totalValue) * maxThickness;
  
  return `M ${source.x1} ${sourceY}
          C ${source.x1 + 100} ${sourceY},
            ${target.x0 - 100} ${targetY},
            ${target.x0} ${targetY}`;
};
```

**Link Stacking:**
- Links must stack vertically within each node
- Calculate cumulative offsets for each link entering/leaving
- Maintain consistent ordering (top to bottom)

---

## Code to Delete

If we go with **Option A (Custom SVG)**:

**Delete:**
- `frontend/components/D3HierarchicalSankey.tsx` (274 lines - failed implementation)
- D3-sankey dependencies from `package.json`

**Keep:**
- `frontend/lib/budget-transform.ts` (data structure is perfect)
- `frontend/lib/sankey-builder.ts` (SankeyBuilder pattern)
- All existing controls and state management

---

## Decision Matrix

| Criteria | Custom SVG | Plotly | Highcharts | Simplify |
|----------|-----------|---------|------------|----------|
| Visual Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Manual Control | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Development Time | 2-3 days | 1 day | 2-4 days | 1-2 days |
| Maintainability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Future-Proof | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Cost | Free | Free | $500-1000/yr | Free |
| **TOTAL** | **25/25** | **11/25** | **17/25** | **15/25** |

---

## Questions for Decision Maker

1. **Timeline:** Do we have 2-3 days for custom implementation? Or need immediate fallback?

2. **Quality bar:** Is "good enough" Plotly acceptable, or do we need professional quality?

3. **Budget:** Is $500-1000/year for Highcharts license an option?

4. **Data detail:** Can we sacrifice granularity (37 nodes → 20 nodes) for cleaner layout?

5. **Risk tolerance:** Comfortable with custom code vs. relying on library?

---

## Immediate Next Steps

**If Option A (Custom SVG) - RECOMMENDED:**
1. Create new `CustomSankey.tsx` component
2. Implement node rendering with exact positioning
3. Add Bezier link paths with vertical stacking
4. Test and iterate

**If Option B (Revert to Plotly):**
1. Set feature flag `USE_D3_SANKEY = false`
2. Update Plotly config: `arrangement: 'snap'`, `height: 1200`
3. Document limitations for future reference

**If Option C (Try Highcharts):**
1. Evaluate trial license
2. Prototype basic implementation
3. Assess positioning control capabilities

**If Option D (Simplify):**
1. Create simplified data structure (3 levels)
2. Merge small categories
3. Re-test with Plotly

---

## Current File State

**Repository:** `/Users/hamidreza/Documents/AI-Projects/IranBudget`

**Recent commits:**
- `b445838` - Fix: Force manual node positions (FAILED)
- `d382269` - Fix: Convert link indices to node IDs
- `476b8e7` - Fix: Move getNodeGroup function
- `7ed5817` - Implement D3-sankey component (FAILED APPROACH)

**Feature flag:** `frontend/app/page.tsx` line 14
```typescript
const USE_D3_SANKEY = true; // Set to false to revert to Plotly
```

---

## Recommended Action

**IMPLEMENT CUSTOM SVG SOLUTION**

This is the only path to production-quality visualization with the control we need. D3-sankey is the wrong tool for our use case. We have solid data structures and clear requirements - we just need to render them directly.

**Estimated time to working prototype:** 1 day  
**Estimated time to production quality:** 2-3 days  
**Long-term benefit:** Full control, no library limitations

---

**Contact:** Hamidreza  
**Status:** BLOCKED - Awaiting decision on path forward  
**Urgency:** HIGH - Core feature broken  
**Impact:** Visualization completely unusable in current state
