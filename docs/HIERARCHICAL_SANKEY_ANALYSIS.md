# Hierarchical Sankey Analysis - Year 1404

**Source File:** `/output/iran_budget_hierarchical_sankey.html`  
**Created by:** `create_hierarchical_sankey.py`

---

## 📊 Diagram Structure

### Multi-Level Architecture (5 Levels)

```
Level 1 (Far Left)    → Level 2 (Left-Center) → Level 3 (Center)    → Level 4 (Right-Center) → Level 5 (Far Right)
Detailed Revenue (11) → Revenue Categories (3) → Budget Split (2)    → Main Spending (4)      → Detailed Spending (11)
```

---

## 🎨 Color Scheme

### Revenue Side (Blues/Cyans)
- **Level 1 - Detailed Revenue Sources:**
  - Corporate Tax: `#1E5F8C` (Dark blue)
  - Individual Income Tax: `#1E5F8C` (Dark blue)
  - VAT & Sales Tax: `#2A7BA8` (Medium blue)
  - Import Duties: `#2A7BA8` (Medium blue)
  - Other Taxes: `#2A7BA8` (Medium blue)
  - Oil Exports: `#3D9BB8` (Teal)
  - Gas & Condensate: `#3D9BB8` (Teal)
  - State Enterprise: `#5AB8CC` (Light cyan)
  - Fees & Charges: `#5AB8CC` (Light cyan)
  - Other Income: `#5AB8CC` (Light cyan)
  - Special Revenue: `#6EC9D4` (Lightest cyan)

- **Level 2 - Aggregated Revenue:**
  - Tax Revenue: `#2A7BA8` (Medium blue)
  - Oil & Gas Revenue: `#3D9BB8` (Teal)
  - Other Revenue: `#5AB8CC` (Light cyan)

- **Level 3 - Budget (Revenue Side):**
  - Total Revenue: `#3D9BB8` (Darker blue)

### Spending Side (Magentas/Pinks)
- **Level 3 - Budget (Spending Side):**
  - Total Spending: `#FF69B4` (Light magenta)

- **Level 4 - Main Categories:**
  - Personnel Costs: `#D6006E` (Hot pink)
  - Development Projects: `#BD0060` (Magenta)
  - Debt Service: `#A4004D` (Deep magenta)
  - Support Programs: `#8B003A` (Darker magenta)

- **Level 5 - Detailed Spending:**
  - Various shades: `#D6006E`, `#C20064`, `#BD0060`, `#A4004D`

### Link Colors
- Inherit source node color with 40% transparency: `rgba(r,g,b,0.4)`

---

## 📐 Layout & Positioning

### Manual Positioning (Freeform)

**X-axis positioning:**
- Level 1 (Detailed Revenue): `x = 0.05` (far left)
- Level 2 (Revenue Categories): `x = 0.28` (left-center)
- Level 3 (Total Revenue): `x = 0.48` (left of center)
- Level 3 (Total Spending): `x = 0.52` (right of center)
- Level 4 (Main Categories): `x = 0.72` (right-center)
- Level 5 (Detailed Spending): `x = 0.95` (far right)

**Y-axis spacing:**
- Level 1 & 5: 11 items, spaced `y = 0.1 + i * 0.07` (vertical stack)
- Level 2: 3 items, spaced `y = 0.35 + i * 0.12` (more space between)
- Level 3: Centered at `y = 0.5`
- Level 4: 4 items, spaced `y = 0.3 + i * 0.13`

### Node Styling
- **Thickness:** 60px (much wider central columns for prominence)
- **Padding:** 15px between nodes
- **Border:** `#2a2a2a` color, 0.5px width (subtle dark border)

---

## 💰 Data Values (All in Trillion Rials)

### Level 1: Detailed Revenue Sources (11 items)
| Source | Amount (T) | Category |
|--------|------------|----------|
| Corporate Tax | 8.17 | Tax |
| Individual Income Tax | 1.82 | Tax |
| VAT & Sales Tax | 4.5 | Tax |
| Import Duties | 1.5 | Tax |
| Other Taxes | 1.01 | Tax |
| Oil Exports | 18.0 | Oil/Gas |
| Gas & Condensate | 3.07 | Oil/Gas |
| State Enterprise Revenue | 6.0 | Other |
| Fees & Charges | 3.5 | Other |
| Other Income | 2.0 | Other |
| Special Revenue | 4.28 | Special |
| **TOTAL** | **53.85** | |

### Level 2: Aggregated Revenue (3 items)
| Category | Amount (T) | % of Total |
|----------|------------|------------|
| Tax Revenue | 17.0 | 31.6% |
| Oil & Gas Revenue | 21.07 | 39.1% |
| Other Revenue | 11.495 | 21.3% |
| **Subtotal (Level 2)** | **49.565** | **92.0%** |
| Special Revenue (bypasses L2) | 4.28 | 8.0% |
| **TOTAL to Budget** | **53.845** | **100%** |

### Level 3: Budget Split (2 nodes)
- **Total Revenue:** 53.8T (rounded)
- **Total Spending:** 53.8T (rounded)
- **Balance:** 0.0T (balanced budget)

### Level 4: Main Spending Categories (4 items)
| Category | Amount (T) | % of Total |
|----------|------------|------------|
| Personnel Costs | 19.3 | 35.9% |
| Development Projects | 11.9 | 22.1% |
| Debt Service | 13.7 | 25.5% |
| Support Programs | 8.9 | 16.5% |
| **TOTAL** | **53.8** | **100%** |

### Level 5: Detailed Spending (11 items)
| Subcategory | Amount (T) | Parent |
|-------------|------------|--------|
| Employee Salaries | 6.0 | Personnel |
| Retiree Pensions | 9.6 | Personnel |
| Benefits | 3.7 | Personnel |
| Infrastructure | 6.8 | Development |
| Technology | 2.5 | Development |
| Regional Dev | 2.6 | Development |
| Bond Repayments | 10.5 | Debt Service |
| Debt Payments | 3.2 | Debt Service |
| Cash Subsidies | 4.2 | Support |
| Energy Subsidies | 2.5 | Support |
| Food & Essentials | 2.2 | Support |
| **TOTAL** | **53.8** | |

---

## 🌐 Farsi Label Mapping

### Complete Translation Dictionary
The script includes full Persian translations for all nodes:

**Revenue Terms:**
- Corporate Tax → مالیات شرکت‌ها
- Individual Income Tax → مالیات بر درآمد
- VAT & Sales Tax → مالیات بر کالا و خدمات
- Oil Exports → صادرات نفت خام
- Gas & Condensate → گاز و میعانات
- Tax Revenue → درآمد مالیاتی
- Oil & Gas Revenue → درآمد نفت و گاز
- Total Revenue → کل درآمد

**Spending Terms:**
- Personnel Costs → هزینه‌های پرسنلی
- Development Projects → طرح‌های عمرانی
- Debt Service → بازپرداخت بدهی
- Support Programs → برنامه‌های حمایتی
- Employee Salaries → حقوق کارکنان
- Retiree Pensions → بازنشستگی
- Cash Subsidies → یارانه نقدی
- Total Spending → کل هزینه

---

## 🎯 Design Features

### 1. **Vertical Central Columns**
- Two separate nodes for Revenue and Spending at center
- Text rotated 90° counter-clockwise for vertical display
- Labels show "کل درآمد: 53.8 هزار میلیارد" and "کل هزینه: 53.8 هزار میلیارد"

### 2. **Flow Logic**

```
Detailed Revenue (L1) → Revenue Categories (L2) → Total Revenue (L3) 
                                                         ↓
                                                    [Budget Flow]
                                                         ↓
                                                  Total Spending (L3) → Main Categories (L4) → Detailed Spending (L5)
```

**Special Case:** Special Revenue (4.28T) bypasses Level 2 and flows directly to Total Revenue

### 3. **Dark Theme (USAFacts Style)**
- Background: `#1a1a1a` (very dark gray)
- Text: `#ffffff` (white)
- Subtle borders: `#2a2a2a`
- High contrast for readability

### 4. **Typography**
- **Font Family:** "Vazir, Tahoma, Arial, sans-serif"
- **Vazir CDN:** `https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css`
- **Title:** 20px bold
- **Labels:** 10px standard
- **Annotations:** 12-14px

### 5. **Annotations**
Six text labels positioned around the diagram:
1. "منابع درآمدی" (Revenue Sources) - Far left, blue
2. "دسته‌بندی درآمدها" (Revenue Categories) - Left-center, cyan
3. "کل درآمد: 53.8 هزار میلیارد" (Total Revenue) - Center left, vertical, white
4. "کل هزینه: 53.8 هزار میلیارد" (Total Spending) - Center right, vertical, white
5. "دسته‌بندی هزینه‌ها" (Spending Categories) - Right-center, magenta
6. "جزئیات هزینه‌ها" (Spending Details) - Far right, magenta
7. Data source attribution at bottom

### 6. **Interactivity**
- **Hover tooltips:** Show node label and value in trillion rials
- **Link hover:** Shows source → target with value
- **Custom template:** `'%{source.label} → %{target.label}<br>%{value:.1f}T rials'`

---

## 📏 Dimensions

- **Height:** 1000px (taller for 5 levels)
- **Width:** Responsive (default Plotly width)
- **Margins:** l=10, r=10, t=100, b=50
- **PNG Export:** 1800x1000px

---

## 🔄 Data Flow Summary

### Revenue Path:
1. **11 detailed sources** → **3 categories** (+ 1 special direct)
2. All converge at **Total Revenue (53.8T)**
3. Passes through **center budget node**

### Spending Path:
1. **Total Spending (53.8T)** receives full budget
2. Splits into **4 main categories**
3. Each category breaks into **2-3 subcategories** (11 total)

---

## 💡 Key Insights from Structure

### Revenue Composition:
- **Oil dependency:** 39.1% (21.07T from oil/gas)
- **Tax base:** 31.6% (17T from all taxes)
- **Other sources:** 29.3% (11.5T other + 4.28T special)

### Spending Priorities:
1. **Personnel (35.9%)** - Largest: salaries + pensions
2. **Debt Service (25.5%)** - Second: bonds + repayments
3. **Development (22.1%)** - Third: infrastructure
4. **Support (16.5%)** - Fourth: subsidies

### Detailed Breakdowns:
- **Pensions dominate personnel** (9.6T of 19.3T = 49.7%)
- **Bond repayments dominate debt** (10.5T of 13.7T = 76.6%)
- **Infrastructure dominates development** (6.8T of 11.9T = 57.1%)

---

## 🎨 Visual Design Philosophy

### Color Strategy:
1. **Blue gradient** for money coming IN (revenue)
2. **Magenta gradient** for money going OUT (spending)
3. **Clear visual separation** between revenue and expenditure sides
4. **Darker shades** = higher level aggregation
5. **Lighter shades** = more detailed breakdown

### Layout Strategy:
1. **Left-to-right flow** = intuitive money movement
2. **Width hierarchy** = central columns wider for emphasis
3. **Vertical stacking** = clear categorization
4. **Manual positioning** = precise control over spacing

---

## 🔧 Technical Implementation

### Key Functions:
- `create_hierarchical_sankey_1404()` - Main diagram generator
- `apply_farsi_labels()` - Translates English labels to Persian
- `add_link()` - Helper to build source→target connections

### Libraries:
- `plotly.graph_objects` - Sankey diagram rendering
- `json` - Data loading (not used in this script, but available)

### Export Formats:
- HTML with embedded Plotly.js and custom CSS
- PNG via `fig.write_image()` (requires kaleido)

---

## 📊 Comparison with Simple Sankey

| Feature | Simple Sankey (current app) | Hierarchical Sankey |
|---------|----------------------------|---------------------|
| Levels | 3 (Revenue → Budget → Spending) | 5 (Detailed breakdown) |
| Revenue nodes | 3 | 11 + 3 aggregated |
| Spending nodes | 4 | 4 + 11 detailed |
| Color scheme | Basic | Gradient blues → magentas |
| Central node | 1 gray | 2 colored (revenue/spending) |
| Positioning | Auto | Manual (freeform) |
| Font | System | Vazir (web font) |
| Theme | Light | Dark (USAFacts style) |
| Detail level | Summary | Comprehensive |

---

## 🚀 Recommendations for App Integration

### 1. **Adopt Hierarchical Structure**
   - Implement 5-level flow instead of 3-level
   - Add toggle between "Simple" and "Detailed" views

### 2. **Use Color Gradients**
   - Replace current basic colors with blue→magenta gradient
   - Implement color interpolation for intermediate levels

### 3. **Manual Positioning**
   - Switch from `arrangement='snap'` to `arrangement='freeform'`
   - Define precise x/y coordinates for each node

### 4. **Add Detailed Breakdowns**
   - Store subcategory data in JSON
   - Create collapsible/expandable categories

### 5. **Implement Dark Theme**
   - Match the dark background (#1a1a1a)
   - High contrast colors for better visibility

### 6. **Persian Typography**
   - Load Vazir font from CDN
   - Apply to all Persian text elements

### 7. **Vertical Central Columns**
   - Create two separate budget nodes (revenue/spending)
   - Rotate text 90° for vertical labels

### 8. **Enhanced Tooltips**
   - Show percentage of total
   - Show breakdown within category
   - Add year-over-year comparison

---

**Analysis Complete!** 📊
