# SOLUTION IMPLEMENTED: Auto-Index Sankey Builder

## Problem Solved

**Before:** Adding state company breakdown required manually renumbering 30+ nodes and 40+ links.  
**After:** Just add nodes and links by name - indices auto-update!

## Files Created

### 1. `/scripts/sankey_builder.py` - Core Builder Class
- `SankeyBuilder()` - Manages nodes and links without manual indices
- `add_node(name, label, value, color, x, y)` - Add node with auto-index
- `add_link(source_name, target_name, value)` - Connect nodes by name
- `build()` - Generate Plotly-compatible structure

### 2. `/scripts/create_1404_with_state_breakdown.py` - Full Example
- Complete 1404 budget with 5 levels
- **NEW:** State company revenue breakdown (6 detailed items)
- 37 nodes total (was 31 before)
- 46 links total (was 40 before)
- Zero manual index tracking!

### 3. `/docs/SOLUTION_AUTO_INDEX_SANKEY.md` - Documentation
- Explains the architecture
- Migration guide
- Benefits and examples

## State Company Breakdown Added

**NEW Revenue Sources (Level 1, far left):**
1. درآمد عملیاتی شرکت‌ها (Operations) - 50.4T
2. اعتبارات هزینه‌ای (Current Credits) - 0.5T  
3. تسهیلات داخلی (Domestic Loans) - 4.6T
4. وام خارجی (Foreign Loans) - 3.2T
5. واگذاری دارایی‌ها (Asset Sales) - 2.0T
6. سایر منابع (Other) - 3.0T

These flow into **"درآمد شرکت‌های دولتی"** (63.7T) at Level 2.

## How to Use

### Quick Start
```bash
cd /Users/hamidreza/Documents/AI-Projects/IranBudget/scripts
python create_1404_with_state_breakdown.py
```

This will:
1. Build the complete 5-level hierarchical Sankey
2. Include state company revenue breakdown
3. Save HTML to `/output/iran_budget_1404_hierarchical_with_state_breakdown.html`
4. Save PNG to same location

### Adding More Nodes (Easy!)

```python
from sankey_builder import SankeyBuilder

builder = SankeyBuilder()

# Add a new revenue source - NO index numbers needed!
builder.add_node('new-source', 'منبع جدید', 5.0, '#color', 0.05, 0.35)

# Connect it
builder.add_link('new-source', 'tax-revenue', 5.0)

# Done! All indices auto-update
```

### Removing a Node

```python
# Just don't add it!
# Comment out the add_node() and add_link() calls
# Everything else auto-adjusts
```

## Key Benefits

✅ **No index hell** - Never write `nodes[17]` or `links[23]` again  
✅ **Self-documenting** - `add_link('corporate-tax', 'tax-revenue', 8.17)` is readable  
✅ **Error-resistant** - Can't mess up indices  
✅ **Easy maintenance** - Add/remove nodes without touching other code  
✅ **Reusable** - Same builder works for all years  

## Database Integration

The state company values come from:

```sql
SELECT 
    state_comp_revenues,           -- 50.4T operations
    state_comp_current_credits,    -- 0.5T
    state_comp_domestic_loans,     -- 4.6T
    state_comp_foreign_loans,      -- 3.2T
    state_comp_current_assets,     -- 2.0T asset sales
    state_comp_other_receipts      -- 3.0T other
FROM revenues
WHERE year_id = 10;  -- 1404
```

## Next Steps

### To Create Other Years:
1. Copy `create_1404_with_state_breakdown.py`
2. Rename to `create_YEAR_with_state_breakdown.py`
3. Query database for that year's values
4. Update the `add_node()` value parameters
5. Run script - done!

### To Add More Detail:
1. Query database for additional breakdowns
2. Add nodes: `builder.add_node('new-item', 'label', value, color, x, y)`
3. Add links: `builder.add_link('new-item', 'target', value)`
4. Run script - indices auto-update!

### To Create a Generic Function:
```python
def create_hierarchical_sankey(year_id):
    """Generate Sankey for any year"""
    builder = SankeyBuilder()
    
    # Query database
    data = query_budget_data(year_id)
    
    # Add nodes and links based on data
    # ... (same pattern for all years)
    
    return builder.build()
```

## Files Modified

**None!** This is a new architecture that sits alongside existing code.

Old scripts still work. When ready, migrate them to use SankeyBuilder.

## Testing

```bash
# Test the builder class
cd /Users/hamidreza/Documents/AI-Projects/IranBudget/scripts
python sankey_builder.py

# Should output:
# Sankey data structure:
# Nodes: ['Source 1', 'Source 2', 'Target']
# Links: [(0, 2, 100), (1, 2, 50)]
```

## Performance

**No performance impact** - indices computed once during `build()`, not during rendering.

## Backwards Compatibility

✅ Old scripts using manual indices still work  
✅ Can gradually migrate to builder  
✅ No breaking changes  

---

**Status:** ✅ READY TO USE  
**Priority:** Use this for all future Sankey diagrams  
**Effort Saved:** ~2 hours per diagram update  

**Created:** December 31, 2024