# D3-Sankey Migration Plan

## Decision: Migrate from Plotly to D3-Sankey

**Rationale:** Plotly's link routing is fundamentally incompatible with our requirements. D3-sankey provides the control we need for production-quality visualization.

**Timeline:** 3-5 days
**Status:** APPROVED - Ready to implement

---

## Phase 1: Initial D3-Sankey Component (Days 1-2)

### 1.1 Install Dependencies
```bash
cd frontend
npm install d3-sankey d3-scale d3-shape d3-selection
npm install --save-dev @types/d3-sankey @types/d3-scale @types/d3-shape @types/d3-selection
```

### 1.2 Create New Component
**File:** `frontend/components/D3HierarchicalSankey.tsx`

**Key Features:**
- SVG-based rendering (not Plotly)
- Direct D3-sankey API access
- Same props interface as current component
- Responsive container

**Critical D3 Configuration:**
```typescript
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const sankeyGenerator = sankey()
  .nodeWidth(25)
  .nodePadding(30)
  .extent([[0, 0], [width, height]])
  .nodeSort((a, b) => d3.ascending(a.order, b.order))  // LOCK NODE ORDER
  .linkSort(null);  // DISABLE LINK REORDERING
```

### 1.3 Data Transformation
**No changes needed!** Our existing `budget-transform.ts` already provides:
- Node positions (x, y)
- Link definitions (source, target, value)
- Colors
- Labels

**Minor addition:** Add `order` field to nodes
```typescript
// In budget-transform.ts
let nodeOrder = 0;
builder.addNode = (id, label, value, color, x, y) => {
  nodes.push({ id, label, value, color, x, y, order: nodeOrder++ });
};
```

---

## Phase 2: Styling Recreation (Day 3)

### 2.1 Visual Parity Checklist
- ✅ Node rectangles with rounded corners
- ✅ Linear gradients on links (not geometric slopes)
- ✅ Link colors with transparency
- ✅ Node border styling
- ✅ Label positioning (left/right based on side)
- ✅ Dark background (#1a1a1a)

### 2.2 Gradient Implementation
```typescript
// Define gradients in SVG defs
<defs>
  {links.map((link, i) => (
    <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor={sourceColor} stopOpacity={0.5} />
      <stop offset="100%" stopColor={targetColor} stopOpacity={0.5} />
    </linearGradient>
  ))}
</defs>

// Apply to link paths
<path
  d={sankeyLinkHorizontal()(link)}
  fill={`url(#gradient-${i})`}
  stroke="none"
/>
```

### 2.3 Center Column Annotations
```typescript
// Custom text elements for "Total Revenue" / "Total Spending"
<text
  x={centerX}
  y={height / 2}
  textAnchor="middle"
  transform={`rotate(-90, ${centerX}, ${height / 2})`}
>
  {displayMode === 'percentage' ? '100%' : formatValue(total)}
</text>
```

---

## Phase 3: Ordering & Grouping Logic (Day 4)

### 3.1 Semantic Groups
**Add to budget-transform.ts:**
```typescript
const groups = {
  // Revenue
  'corporate-tax': 'tax',
  'individual-tax': 'tax',
  'vat': 'tax',
  'oil-exports': 'oil-gas',
  'gas-exports': 'oil-gas',
  // ... etc
};

builder.addNode = (id, label, value, color, x, y) => {
  nodes.push({ 
    id, label, value, color, x, y, 
    order: nodeOrder++,
    group: groups[id] || 'other'
  });
};
```

### 3.2 Enhanced NodeSort
```typescript
.nodeSort((a, b) => {
  // First sort by depth (x-position)
  if (a.depth !== b.depth) return a.depth - b.depth;
  
  // Within same depth, sort by group
  if (a.group !== b.group) return d3.ascending(a.group, b.group);
  
  // Within same group, use manual order
  return a.order - b.order;
})
```

### 3.3 Link Sort Disabled
```typescript
.linkSort(null)  // Critical: prevents braiding
```

---

## Phase 4: Interactions (Day 4-5)

### 4.1 Hover Effects
```typescript
<path
  onMouseEnter={() => setHoveredLink(i)}
  onMouseLeave={() => setHoveredLink(null)}
  opacity={hoveredLink === null || hoveredLink === i ? 1 : 0.3}
/>
```

### 4.2 Tooltips
**Use existing patterns:**
- Show source → target
- Display value with unit
- Format based on display mode (percentage/absolute)

```typescript
<Tooltip>
  <div>
    {link.source.label} → {link.target.label}<br/>
    {displayMode === 'percentage' 
      ? `${(link.value / total * 100).toFixed(1)}%`
      : formatValue(link.value, unit)}
  </div>
</Tooltip>
```

### 4.3 Click Interactions (Optional)
- Highlight path from source to target
- Dim other flows
- Reset on second click

---

## Phase 5: Integration & Migration

### 5.1 Side-by-Side Testing
**Temporarily support both:**
```typescript
// In page.tsx
const useLegacyPlotly = false; // Feature flag

{useLegacyPlotly ? (
  <HierarchicalSankey {...props} />
) : (
  <D3HierarchicalSankey {...props} />
)}
```

### 5.2 Comparison Checklist
- [ ] Visual appearance matches
- [ ] All controls work (language, unit, display mode)
- [ ] Performance acceptable (< 100ms render)
- [ ] Hover/tooltips functional
- [ ] Responsive layout
- [ ] RTL/LTR switching

### 5.3 Remove Plotly
```bash
npm uninstall react-plotly.js plotly.js
rm frontend/components/HierarchicalSankey.tsx
mv frontend/components/D3HierarchicalSankey.tsx frontend/components/HierarchicalSankey.tsx
```

---

## File Changes Summary

### New Files
- `frontend/components/D3HierarchicalSankey.tsx` (new implementation)

### Modified Files
- `frontend/lib/budget-transform.ts` (add `order` and `group` fields)
- `frontend/package.json` (dependency changes)

### Deleted Files
- `frontend/components/HierarchicalSankey.tsx` (old Plotly version)

---

## Risk Mitigation

### Potential Issues
1. **Performance with 50+ links**
   - Solution: Virtual rendering if needed
   - Benchmark: Should render < 100ms

2. **Browser compatibility**
   - D3 SVG works in all modern browsers
   - Test: Chrome, Firefox, Safari

3. **Responsive behavior**
   - Use ResizeObserver to redraw on container resize
   - Maintain aspect ratio

4. **State management complexity**
   - Keep hover state simple (single useState)
   - Memo expensive calculations

---

## Code Skeleton (Day 1 Starting Point)

```typescript
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';
import { select } from 'd3-selection';
import { SankeyData } from '@/lib/budget-transform';

interface Props {
  data: SankeyData;
  year: string;
  language: 'en' | 'fa';
  displayMode: 'absolute' | 'percentage';
  unit: Unit;
}

export default function D3HierarchicalSankey({ data, year, language, displayMode, unit }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 900 });

  // Transform data for D3
  const sankeyData = useMemo(() => {
    const nodes = data.nodes.map((n, i) => ({
      ...n,
      order: i,
      depth: Math.round(n.x * 5) // Convert x position to depth level
    }));

    const links = data.links.map(l => ({
      source: l.source,
      target: l.target,
      value: l.value
    }));

    return { nodes, links };
  }, [data]);

  // D3 layout
  const { nodes, links } = useMemo(() => {
    const sankeyGenerator = sankey()
      .nodeWidth(25)
      .nodePadding(30)
      .extent([[0, 0], [dimensions.width, dimensions.height]])
      .nodeSort((a, b) => a.order - b.order)
      .linkSort(null);

    return sankeyGenerator(sankeyData);
  }, [sankeyData, dimensions]);

  // Render SVG
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Draw links
    const linkGroup = svg.append('g').attr('class', 'links');
    linkGroup.selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', d => d.color)
      .attr('opacity', 0.5);

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    nodeGroup.selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => d.color);

    // Draw labels
    nodeGroup.selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => d.x0 < dimensions.width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('text-anchor', d => d.x0 < dimensions.width / 2 ? 'start' : 'end')
      .text(d => d.label);

  }, [nodes, links, dimensions]);

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
}
```

---

## Success Criteria

### Day 3 Checkpoint
- [ ] D3-sankey renders without crashes
- [ ] Nodes appear in correct positions
- [ ] Links connect properly
- [ ] Basic styling applied

### Day 5 Final
- [ ] NO overlapping flows
- [ ] Nodes stay in semantic order
- [ ] Visual parity with design reference
- [ ] All controls functional
- [ ] Performance < 100ms
- [ ] Production ready

---

## Rollback Plan

If D3 implementation fails:
1. Keep Plotly version in git history
2. Feature flag allows instant revert
3. Max 1 day lost if we abort early

**Decision point:** End of Day 2
- If basic rendering not working → investigate issues
- If fundamental blocker → revert and reconsider

---

## Next Immediate Action

**START HERE:**
```bash
cd /Users/hamidreza/Documents/AI-Projects/IranBudget/frontend
npm install d3-sankey d3-scale d3-shape d3-selection
npm install --save-dev @types/d3-sankey
```

Then create `frontend/components/D3HierarchicalSankey.tsx` with the skeleton above.

**Estimated time to first render:** 2-4 hours
**Estimated time to production quality:** 3-5 days

---

**Ready to begin implementation?**
