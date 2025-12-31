"""
Example: Build 1404 Hierarchical Sankey with State Company Breakdown
Uses SankeyBuilder to auto-manage indices
"""

import sys
sys.path.append('/Users/hamidreza/Documents/AI-Projects/IranBudget/scripts')

from sankey_builder import SankeyBuilder
import plotly.graph_objects as go

# Initialize builder
builder = SankeyBuilder()

# === LEVEL 1: Detailed Revenue Sources (11 nodes on far left) ===

# Tax breakdown (5 items)
builder.add_node('corporate-tax', 'مالیات شرکت‌ها', 8.17, '#1E5F8C', 0.05, 0.10)
builder.add_node('individual-tax', 'مالیات بر درآمد', 1.82, '#1E5F8C', 0.05, 0.15)
builder.add_node('vat', 'مالیات بر کالا و خدمات', 4.5, '#2A7BA8', 0.05, 0.20)
builder.add_node('import-duties', 'عوارض گمرکی', 1.5, '#2A7BA8', 0.05, 0.25)
builder.add_node('other-tax', 'سایر مالیات‌ها', 1.01, '#2A7BA8', 0.05, 0.30)

# Oil & Gas (2 items)
builder.add_node('oil-exports', 'صادرات نفت خام', 18.0, '#3D9BB8', 0.05, 0.40)
builder.add_node('gas-exports', 'گاز و میعانات', 3.07, '#3D9BB8', 0.05, 0.45)

# **NEW: State Company Revenue Breakdown (from Table 11)**
# These come from state_comp_revenues, state_comp_current_credits, etc.
builder.add_node('state-operations', 'درآمد عملیاتی شرکت‌ها', 50.4, '#1E5F8C', 0.05, 0.55)
builder.add_node('state-credits', 'اعتبارات هزینه‌ای', 0.5, '#2A7BA8', 0.05, 0.60)
builder.add_node('state-loans-domestic', 'تسهیلات داخلی', 4.6, '#2A7BA8', 0.05, 0.65)
builder.add_node('state-loans-foreign', 'وام خارجی', 3.2, '#3D9BB8', 0.05, 0.70)
builder.add_node('state-assets', 'واگذاری دارایی‌ها', 2.0, '#5AB8CC', 0.05, 0.75)
builder.add_node('state-other', 'سایر منابع', 3.0, '#6EC9D4', 0.05, 0.80)

# Other revenue
builder.add_node('fees-charges', 'حق و عوارض', 3.5, '#5AB8CC', 0.05, 0.87)
builder.add_node('other-income', 'سایر درآمدها', 2.0, '#6EC9D4', 0.05, 0.92)
builder.add_node('special-revenue', 'درآمد اختصاصی', 4.28, '#6EC9D4', 0.05, 0.97)

# === LEVEL 2: Aggregated Revenue Categories (4 nodes left-center) ===

builder.add_node('tax-revenue', 'درآمد مالیاتی', 17.0, '#2A7BA8', 0.28, 0.35)
builder.add_node('oil-gas-revenue', 'درآمد نفت و گاز', 21.07, '#3D9BB8', 0.28, 0.50)
builder.add_node('state-company-revenue', 'درآمد شرکت‌های دولتی', 63.7, '#1E5F8C', 0.28, 0.65)
builder.add_node('other-revenue', 'سایر درآمدها', 11.5, '#5AB8CC', 0.28, 0.80)

# === LEVEL 3: Total Budget (2 nodes at center) ===

builder.add_node('total-revenue', 'کل منابع\n112.8 هزار میلیارد', 112.8, '#3D9BB8', 0.48, 0.50)
builder.add_node('total-spending', 'کل مصارف\n112.8 هزار میلیارد', 112.8, '#FF69B4', 0.52, 0.50)

# === LEVEL 4: Main Spending Categories (4 nodes right-center) ===

builder.add_node('personnel', 'هزینه‌های پرسنلی', 19.3, '#D6006E', 0.72, 0.30)
builder.add_node('development', 'طرح‌های عمرانی', 11.9, '#BD0060', 0.72, 0.45)
builder.add_node('debt-service', 'بازپرداخت بدهی', 13.7, '#A4004D', 0.72, 0.60)
builder.add_node('support', 'برنامه‌های حمایتی', 8.9, '#8B003A', 0.72, 0.75)

# === LEVEL 5: Detailed Spending (11 nodes far right) ===

# Personnel breakdown
builder.add_node('salaries', 'حقوق کارکنان', 6.0, '#D6006E', 0.95, 0.20)
builder.add_node('pensions', 'بازنشستگی', 9.6, '#C20064', 0.95, 0.28)
builder.add_node('benefits', 'مزایا', 3.7, '#D6006E', 0.95, 0.36)

# Development breakdown
builder.add_node('infrastructure', 'زیرساخت', 6.8, '#BD0060', 0.95, 0.42)
builder.add_node('technology', 'فناوری', 2.5, '#C20064', 0.95, 0.47)
builder.add_node('regional-dev', 'توسعه منطقه‌ای', 2.6, '#BD0060', 0.95, 0.52)

# Debt service breakdown
builder.add_node('bonds', 'بازپرداخت اوراق', 10.5, '#A4004D', 0.95, 0.58)
builder.add_node('debt-payments', 'بازپرداخت بدهی', 3.2, '#8B003A', 0.95, 0.64)

# Support breakdown
builder.add_node('cash-subsidies', 'یارانه نقدی', 4.2, '#8B003A', 0.95, 0.72)
builder.add_node('energy-subsidies', 'یارانه انرژی', 2.5, '#6B002A', 0.95, 0.78)
builder.add_node('food-subsidies', 'یارانه مواد اساسی', 2.2, '#8B003A', 0.95, 0.84)

# === ADD ALL LINKS (using node names!) ===

# Level 1 → 2: Tax flows
builder.add_link('corporate-tax', 'tax-revenue', 8.17)
builder.add_link('individual-tax', 'tax-revenue', 1.82)
builder.add_link('vat', 'tax-revenue', 4.5)
builder.add_link('import-duties', 'tax-revenue', 1.5)
builder.add_link('other-tax', 'tax-revenue', 1.01)

# Level 1 → 2: Oil & Gas flows
builder.add_link('oil-exports', 'oil-gas-revenue', 18.0)
builder.add_link('gas-exports', 'oil-gas-revenue', 3.07)

# Level 1 → 2: State company flows (NEW!)
builder.add_link('state-operations', 'state-company-revenue', 50.4)
builder.add_link('state-credits', 'state-company-revenue', 0.5)
builder.add_link('state-loans-domestic', 'state-company-revenue', 4.6)
builder.add_link('state-loans-foreign', 'state-company-revenue', 3.2)
builder.add_link('state-assets', 'state-company-revenue', 2.0)
builder.add_link('state-other', 'state-company-revenue', 3.0)

# Level 1 → 2: Other revenue flows
builder.add_link('fees-charges', 'other-revenue', 3.5)
builder.add_link('other-income', 'other-revenue', 2.0)
builder.add_link('special-revenue', 'other-revenue', 4.28)

# NOTE: Special revenue bypasses Level 2 and goes directly to Total Revenue
builder.add_link('special-revenue', 'total-revenue', 4.28)

# Level 2 → 3: To total revenue
builder.add_link('tax-revenue', 'total-revenue', 17.0)
builder.add_link('oil-gas-revenue', 'total-revenue', 21.07)
builder.add_link('state-company-revenue', 'total-revenue', 63.7)
builder.add_link('other-revenue', 'total-revenue', 7.22)  # 11.5 - 4.28 special

# Level 3: Budget flow (Revenue → Spending at center)
# This is implicit in the center column visualization

# Level 3 → 4: To main spending categories
builder.add_link('total-spending', 'personnel', 19.3)
builder.add_link('total-spending', 'development', 11.9)
builder.add_link('total-spending', 'debt-service', 13.7)
builder.add_link('total-spending', 'support', 8.9)

# Level 4 → 5: Personnel breakdown
builder.add_link('personnel', 'salaries', 6.0)
builder.add_link('personnel', 'pensions', 9.6)
builder.add_link('personnel', 'benefits', 3.7)

# Level 4 → 5: Development breakdown
builder.add_link('development', 'infrastructure', 6.8)
builder.add_link('development', 'technology', 2.5)
builder.add_link('development', 'regional-dev', 2.6)

# Level 4 → 5: Debt service breakdown
builder.add_link('debt-service', 'bonds', 10.5)
builder.add_link('debt-service', 'debt-payments', 3.2)

# Level 4 → 5: Support breakdown
builder.add_link('support', 'cash-subsidies', 4.2)
builder.add_link('support', 'energy-subsidies', 2.5)
builder.add_link('support', 'food-subsidies', 2.2)

# === BUILD AND VISUALIZE ===

# Get Plotly-compatible structure
sankey_data = builder.build()

# Create figure
fig = go.Figure(data=[go.Sankey(
    arrangement='freeform',
    node=sankey_data['node'],
    link=sankey_data['link']
)])

# Update layout
fig.update_layout(
    title={
        'text': 'بودجه سال ۱۴۰۴ کل کشور - نمایش کامل با جزئیات شرکت‌های دولتی',
        'font': {'size': 24, 'family': 'Vazir, Tahoma, Arial'},
        'x': 0.5
    },
    font={'size': 11, 'family': 'Vazir, Tahoma, Arial'},
    paper_bgcolor='#1a1a1a',
    plot_bgcolor='#1a1a1a',
    height=1000,
    margin={'l': 20, 'r': 20, 't': 80, 'b': 60}
)

# Show statistics
print("=== Sankey Builder Statistics ===")
builder.stats()

# Save to HTML
output_path = '/Users/hamidreza/Documents/AI-Projects/IranBudget/output/iran_budget_1404_hierarchical_with_state_breakdown.html'
fig.write_html(output_path)
print(f"\n✅ Saved to: {output_path}")

# Also save as PNG
png_path = '/Users/hamidreza/Documents/AI-Projects/IranBudget/output/iran_budget_1404_hierarchical_with_state_breakdown.png'
fig.write_image(png_path, width=1800, height=1000)
print(f"✅ Saved PNG: {png_path}")

# Show in browser
fig.show()
