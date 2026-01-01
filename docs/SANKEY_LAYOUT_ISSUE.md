# Sankey Diagram Layout Issue - Technical Handoff

## Project Context
Iran National Budget visualization using Plotly Sankey diagrams to show flow of government revenue (10 detail nodes → 4 aggregate nodes → center) to expenditure (center → 4 categories → 11 detail nodes).

**Tech Stack:**
- Frontend: React Next.js (TypeScript)
- Visualization: Plotly.js (react-plotly.js wrapper)
- Data: PostgreSQL → Python transform → JSON API
- Repository: `/Users/hamidreza/Documents/AI-Projects/IranBudget`

## The Problem

### Current State
The Sankey diagram renders with **overlapping and messy flow paths** despite well-defined node positions. The flows cross over each other, creating visual chaos especially in the middle section where many paths converge/diverge.

**Visual Issues:**
1. Links overlap each other vertically
2. Some flows cross unnecessarily  
3. Dense areas have braided/tangled paths
4. Overall readability is poor

### What We've Tried

#### Attempt 1: `arrangement: 'freeform'`
- **Result:** Messy overlaps, nodes moved from intended positions
- **Settings:** `pad: 25, thickness: 35`

#### Attempt 2: `arrangement: 'snap'` 
- **Result:** Better spacing but completely ignores our manual y-positions, reorders nodes
- **Settings:** `pad: 30, thickness: 25`

#### Attempt 3: `arrangement: 'fixed'`
- **Result:** Respects positions but links still overlap, can't manually adjust
- **Settings:** `pad: 30, thickness: 25`

#### Configuration Tweaks
- Height: 1400px → 1000px → 900px
- Node padding: 15 → 20 → 25 → 30
- Node thickness: 60 → 35 → 30 → 25
- Added `arrowlen: 0` to remove arrow artifacts

### Root Cause Analysis

From research on Plotly Sankey limitations:

1. **Plotly doesn't expose link ordering controls** - Unlike raw D3-sankey which has `nodeSort()` and `linkSort()`, Plotly's wrapper doesn't allow control over link routing
2. **Arrangement modes have trade-offs:**
   - `snap`: Prevents overlaps BUT ignores manual positions
   - `freeform`: Respects positions BUT doesn't prevent overlaps
   - `fixed`: Respects positions BUT still auto-routes links
   - `perpendicular`: Limited usefulness for our layout
3. **No `linkSort` equivalent** - Can't control the order links enter/exit nodes, which causes braiding
4. **Complex multi-level flows** - Our 5-level hierarchy (detail → aggregate → center → category → detail) is more complex than typical Sankey examples

## Current Implementation

### File Structure
```
frontend/
├── app/page.tsx              # Main page with controls
├── components/
│   └── HierarchicalSankey.tsx  # Plotly component
└── lib/
    ├── budget-transform.ts    # Data transformation & SankeyBuilder
    └── conversions.ts         # Unit conversions

backend/
└── sankey_builder.py         # Python data processor
```

### Node Positioning (budget-transform.ts)
```typescript
// Y-positions are manually set, well-distributed 0.05 to 0.98
// Example:
builder.addNode('corporate-tax', label, value, color, 0.15, 0.53);
builder.addNode('individual-tax', label, value, color, 0.15, 0.58);
// ... spacing of 0.05 between nodes
```

### Plotly Configuration (HierarchicalSankey.tsx)
```typescript
{
  type: 'sankey',
  orientation: 'h',
  arrangement: 'fixed',  // Current setting
  node: {
    pad: 30,           // Space between nodes
    thickness: 25,     // Node width
    x: nodeX,          // Manual x positions
    y: nodeY,          // Manual y positions
  },
  link: {
    source: [...],
    target: [...],
    value: [...],
    color: [...],
    arrowlen: 0
  }
}
```

## Research Findings

From web search on Plotly Sankey best practices:

### Key Insight from D3 Expert
> "If you want perfectly aligned, symmetric, narrative-driven, magazine-quality Sankeys, you are no longer 'using Sankey' - you are using Sankey as a starting scaffold. Professional examples (NYT, FT, Bloomberg) routinely override y-positions, hand-sort flows, collapse micro-categories, duplicate nodes for clarity."

### What D3-Sankey Allows (that Plotly doesn't expose)
```javascript
// In raw D3-sankey (not available in Plotly):
sankey
  .nodeSort((a, b) => d3.ascending(a.order, b.order))  // Lock node order
  .linkSort(null);  // Disable link reordering to prevent braiding
```

### Alternative Approaches Mentioned
1. **Custom SVG rendering** - Build Sankey manually with D3.js for full control
2. **Alternative libraries:**
   - react-flow (node-based diagrams)
   - Highcharts Sankey (may have better link routing)
   - Google Charts Sankey
   - Raw D3-sankey with React wrapper
3. **Simplify the data** - Reduce number of nodes/links to minimize overlaps
4. **Accept Plotly limitations** - Focus on getting "good enough" with available controls

## Questions for Colleague

1. **Library alternatives:** Should we stick with Plotly or consider switching to:
   - Raw D3-sankey for full control?
   - Highcharts or other commercial library?
   - Custom SVG rendering?

2. **Layout approach:** For Plotly specifically:
   - Is there a way to control link ordering we're missing?
   - Should we recalculate y-positions with a different algorithm?
   - Any undocumented Plotly Sankey parameters?

3. **Acceptable compromise:** 
   - What's "good enough" for production?
   - Is manual post-processing (editing SVG) acceptable?
   - Should we simplify the hierarchy (fewer levels)?

4. **Performance vs quality:**
   - Worth the effort to switch libraries?
   - Timeline: How long to implement D3-sankey solution vs fixing Plotly?

## Data Structure

### Node Count by Level
- Level 0 (State Co. details): 6 nodes (when hasStateBreakdown)
- Level 1 (Gov revenue details): 10 nodes
- Level 2 (Aggregates): 4 nodes
- Center: 2 nodes (total revenue, total spending)
- Level 3 (Main spending): 4 nodes
- Level 4 (Detail spending): 11 nodes

**Total:** ~37 nodes with ~50 links in complex years

### Sample Node Definition
```typescript
{
  id: 'corporate-tax',
  label: 'Corporate Tax',
  value: 15.2,  // Trillion Rials
  color: '#1E5F8C',
  x: 0.15,      // Horizontal position (0-1)
  y: 0.53       // Vertical position (0-1)
}
```

## Current Configuration Files

**HierarchicalSankey.tsx:** 179 lines
- Plotly React wrapper
- Handles display modes (percentage/absolute)
- Unit conversions (Trillion Rials/Hemmat/USD)
- Language switching (EN/FA)

**budget-transform.ts:** 295 lines
- SankeyBuilder pattern
- Node/link construction
- Color assignments
- Y-position calculations

## How to Reproduce

```bash
cd /Users/hamidreza/Documents/AI-Projects/IranBudget/frontend
npm run dev
# Visit http://localhost:3000
# Select year 1404 to see complex diagram
```

## Ideal Outcome

Clean, professional Sankey diagram where:
- ✅ Flows don't overlap
- ✅ Paths are smooth and predictable
- ✅ Related categories visually grouped
- ✅ Readable without scrolling (900px height)
- ✅ Maintains our manual node positioning

## Next Steps Options

**Option A: Persist with Plotly**
- Try different y-position calculation algorithms
- Experiment with node grouping/clustering
- Simplify data (merge small categories)

**Option B: Switch to D3**
- Implement raw D3-sankey with full control
- 2-3 days development time
- Better long-term quality

**Option C: Hybrid Approach**
- Use Plotly for simple years (pre-1400)
- Custom D3 for complex years (1400+)
- Maintain consistency between approaches

**Option D: Accept Current State**
- Focus on other features
- Document known limitation
- Revisit if user feedback demands it

## Contact

**Developer:** Hamidreza
**Date:** January 1, 2026
**Status:** Blocked - seeking architectural guidance
**Priority:** High (affects core visualization quality)
