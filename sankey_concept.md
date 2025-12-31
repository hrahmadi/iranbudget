# Iran Budget Sankey - Design Spec

## Inspiration
US Federal Budget style with:
- Sloped/curved flow paths (Bézier curves)
- Gradients within flows
- Multi-tier hierarchy
- Dark background with vibrant colors

## Data Structure for Iran Budget

### Tier 1: Revenue Sources → Total
- درآمدهای عملیاتی (Operational Revenue)
- واگذاری دارایی (Asset Sales)
- استقراض (Borrowing)
- درآمدهای اختصاصی (Special Accounts)
- درآمدهای شرکت‌های دولتی (State Companies Revenue)

### Tier 2: Total → Major Categories
- هزینه‌های جاری (Current Expenditures)
- هزینه‌های سرمایه‌ای (Capital Expenditures)
- یارانه‌ها (Subsidies)
- انتقالی به شرکت‌ها (Transfers to SOEs)
- سایر هزینه‌ها (Other)

### Tier 3: Major Categories → Detailed Breakdown
- Current → (تنخواه، حقوق، خدمات، کالا و خدمات)
- Capital → (تملک سرمایه، طرح‌ها)
- Subsidies → (نقدی، کالایی، اقتصادی)
- etc.

## Technical Stack Options

### Option 1: D3.js + Sankey Plugin (Most Flexible)
```javascript
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
```
- Full control over gradients
- Custom node/link rendering
- RTL support needed

### Option 2: Plotly Sankey (Easier)
```javascript
import Plotly from 'plotly.js-dist';
```
- Built-in Sankey type
- Less customization
- No gradient support

### Option 3: Google Charts Sankey (Simple)
- Limited styling
- No gradients

## Recommended: D3.js Sankey

**Pros:**
- Matches reference image perfectly
- Full gradient control
- Custom positioning
- Persian font support

**Cons:**
- More complex code
- Need to handle RTL manually

## Color Scheme (Persian Context)

**Revenues (Cool Blues/Greens):**
- درآمدهای نفتی: #1f77b4 (deep blue)
- درآمدهای مالیاتی: #2ca02c (green)
- سایر درآمدها: #17becf (cyan)

**Expenditures (Warm Pinks/Reds):**
- جاری: #d62728 (red)
- عمرانی: #ff7f0e (orange)
- یارانه: #e377c2 (pink)

## Next Steps

1. Export data from PostgreSQL in Sankey format
2. Build D3.js React component with gradients
3. Add Persian labels with proper RTL
4. Deploy as artifact

Ready to build?
