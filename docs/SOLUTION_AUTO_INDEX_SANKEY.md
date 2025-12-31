# Solution: Auto-Index Sankey Builder

## The Fix: Use a Node Registry System

Instead of manually tracking indices, create a builder that auto-assigns them.

### Step 1: Create Node Registry

```python
class SankeyBuilder:
    def __init__(self):
        self.nodes = []
        self.node_map = {}  # name -> index
        self.links = []
    
    def add_node(self, name, label, value, color, x, y):
        """Add node and auto-assign index"""
        index = len(self.nodes)
        self.node_map[name] = index
        self.nodes.append({
            'name': name,
            'label': label,
            'value': value,
            'color': color,
            'x': x,
            'y': y
        })
        return index
    
    def add_link(self, source_name, target_name, value):
        """Add link using node names, not indices"""
        self.links.append({
            'source': self.node_map[source_name],
            'target': self.node_map[target_name],
            'value': value
        })
    
    def build(self):
        """Generate Plotly-compatible structure"""
        return {
            'node': {
                'label': [n['label'] for n in self.nodes],
                'color': [n['color'] for n in self.nodes],
                'x': [n['x'] for n in self.nodes],
                'y': [n['y'] for n in self.nodes]
            },
            'link': {
                'source': [l['source'] for l in self.links],
                'target': [l['target'] for l in self.links],
                'value': [l['value'] for l in self.links]
            }
        }
```

### Step 2: Build the Diagram

```python
# Initialize builder
builder = SankeyBuilder()

# === LEVEL 1: Detailed Revenue (Left Side) ===

# Tax breakdown
builder.add_node('corporate-tax', 'مالیات شرکت‌ها', 8.17, '#1E5F8C', 0.05, 0.10)
builder.add_node('individual-tax', 'مالیات بر درآمد', 1.82, '#1E5F8C', 0.05, 0.15)
builder.add_node('vat', 'مالیات بر کالا و خدمات', 4.5, '#1E5F8C', 0.05, 0.20)
builder.add_node('import-duties', 'عوارض گمرکی', 1.5, '#1E5F8C', 0.05, 0.25)
builder.add_node('other-tax', 'سایر مالیات‌ها', 1.01, '#1E5F8C', 0.05, 0.30)

# Oil & Gas breakdown
builder.add_node('oil-exports', 'صادرات نفت خام', 18.0, '#3D9BB8', 0.05, 0.40)
builder.add_node('gas-exports', 'گاز و میعانات', 3.07, '#3D9BB8', 0.05, 0.45)

# **NEW: State Company breakdown**
builder.add_node('state-operations', 'درآمد عملیاتی شرکت‌ها', 50.4, '#2A7BA8', 0.05, 0.55)
builder.add_node('state-credits', 'اعتبارات دولتی', 0.5, '#2A7BA8', 0.05, 0.60)
builder.add_node('state-domestic-loans', 'تسهیلات داخلی', 4.6, '#2A7BA8', 0.05, 0.65)
builder.add_node('state-foreign-loans', 'وام خارجی', 3.2, '#2A7BA8', 0.05, 0.70)
builder.add_node('state-asset-sales', 'واگذاری دارایی', 2.0, '#2A7BA8', 0.05, 0.75)
builder.add_node('state-other', 'سایر منابع', 3.0, '#2A7BA8', 0.05, 0.80)

# Other revenue sources
builder.add_node('fees-charges', 'حق و عوارض', 3.5, '#5AB8CC', 0.05, 0.87)
builder.add_node('other-income', 'سایر درآمدها', 2.0, '#5AB8CC', 0.05, 0.92)

# === LEVEL 2: Revenue Categories (Left-Center) ===
builder.add_node('tax-revenue', 'درآمد مالیاتی', 17.0, '#2A7BA8', 0.28, 0.35)
builder.add_node('oil-gas-revenue', 'درآمد نفت و گاز', 21.07, '#3D9BB8', 0.28, 0.50)
builder.add_node('state-company-revenue', 'درآمد شرکت‌های دولتی', 63.7, '#1E5F8C', 0.28, 0.65)
builder.add_node('other-revenue', 'سایر درآمدها', 11.5, '#5AB8CC', 0.28, 0.80)

# === LEVEL 3: Total Budget (Center) ===
builder.add_node('total-revenue', 'کل منابع', 112.8, '#3D9BB8', 0.48, 0.50)
builder.add_node('total-spending', 'کل مصارف', 112.8, '#FF69B4', 0.52, 0.50)

# === LEVEL 4: Main Spending Categories ===
builder.add_node('personnel', 'هزینه‌های پرسنلی', 19.3, '#D6006E', 0.72, 0.30)
builder.add_node('development', 'طرح‌های عمرانی', 11.9, '#BD0060', 0.72, 0.45)
builder.add_node('debt-service', 'بازپرداخت بدهی', 13.7, '#A4004D', 0.72, 0.60)
builder.add_node('support', 'برنامه‌های حمایتی', 8.9, '#8B003A', 0.72, 0.75)

# === LEVEL 5: Detailed Spending ===
builder.add_node('salaries', 'حقوق کارکنان', 6.0, '#D6006E', 0.95, 0.20)
builder.add_node('pensions', 'بازنشستگی', 9.6, '#D6006E', 0.95, 0.28)
# ... etc

# === ADD LINKS (using names, not indices!) ===

# Tax flows
builder.add_link('corporate-tax', 'tax-revenue', 8.17)
builder.add_link('individual-tax', 'tax-revenue', 1.82)
builder.add_link('vat', 'tax-revenue', 4.5)
builder.add_link('import-duties', 'tax-revenue', 1.5)
builder.add_link('other-tax', 'tax-revenue', 1.01)

# Oil flows
builder.add_link('oil-exports', 'oil-gas-revenue', 18.0)
builder.add_link('gas-exports', 'oil-gas-revenue', 3.07)

# **NEW: State company flows**
builder.add_link('state-operations', 'state-company-revenue', 50.4)
builder.add_link('state-credits', 'state-company-revenue', 0.5)
builder.add_link('state-domestic-loans', 'state-company-revenue', 4.6)
builder.add_link('state-foreign-loans', 'state-company-revenue', 3.2)
builder.add_link('state-asset-sales', 'state-company-revenue', 2.0)
builder.add_link('state-other', 'state-company-revenue', 3.0)

# Other revenue flows
builder.add_link('fees-charges', 'other-revenue', 3.5)
builder.add_link('other-income', 'other-revenue', 2.0)

# Level 2 → 3
builder.add_link('tax-revenue', 'total-revenue', 17.0)
builder.add_link('oil-gas-revenue', 'total-revenue', 21.07)
builder.add_link('state-company-revenue', 'total-revenue', 63.7)
builder.add_link('other-revenue', 'total-revenue', 11.5)

# Center → Spending
builder.add_link('total-spending', 'personnel', 19.3)
builder.add_link('total-spending', 'development', 11.9)
builder.add_link('total-spending', 'debt-service', 13.7)
builder.add_link('total-spending', 'support', 8.9)

# Spending details
builder.add_link('personnel', 'salaries', 6.0)
builder.add_link('personnel', 'pensions', 9.6)
# ... etc

# Generate final structure
sankey_data = builder.build()
```

### Step 3: Use with Plotly

```python
import plotly.graph_objects as go

fig = go.Figure(data=[go.Sankey(
    arrangement='freeform',
    node=sankey_data['node'],
    link=sankey_data['link']
)])

fig.show()
```

## Benefits

✅ **No manual index tracking** - indices auto-assigned  
✅ **Easy to add nodes** - just insert anywhere, indices adjust  
✅ **Readable code** - `add_link('corporate-tax', 'tax-revenue', 8.17)`  
✅ **Less error-prone** - no off-by-one mistakes  
✅ **Self-documenting** - names describe the connections  

## State Company Data from Database

```python
# Query for 1404 state company breakdown
query = """
SELECT 
    state_comp_revenues,
    state_comp_current_credits,
    state_comp_capital_credits,
    state_comp_domestic_loans,
    state_comp_foreign_loans,
    state_comp_current_assets,
    state_comp_other_receipts,
    state_comp_financial_assets
FROM revenues
WHERE year_id = 10;
"""

# Use these values in builder.add_node() calls
```

## Migration Path

1. Create `sankey_builder.py` with the SankeyBuilder class
2. Convert existing diagram to use builder (one-time effort)
3. Add new state company nodes (easy!)
4. All indices auto-update

## Example: Adding One More Node

**Old way (manual indices):**
```python
# Add new node at position 5
# Renumber nodes 5-30 to 6-31
# Update 40+ link definitions
# Hope you didn't miss any
```

**New way (builder):**
```python
builder.add_node('new-revenue', 'منبع جدید', 5.0, '#color', 0.05, 0.35)
builder.add_link('new-revenue', 'tax-revenue', 5.0)
# Done! Indices auto-update
```

---

**File to create:** `/scripts/sankey_builder.py`  
**Then update:** `create_hierarchical_sankey.py` to use it  

This is a **one-time refactor** that makes all future changes trivial!