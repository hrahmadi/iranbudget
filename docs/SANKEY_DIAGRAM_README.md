# 📊 Iran Budget Sankey Diagrams

Interactive Sankey diagrams visualizing the flow of money through Iran's national budget from revenue sources to spending categories.

## 🎯 Overview

Sankey diagrams (also called alluvial diagrams) are perfect for showing resource flows. This tool creates visualizations that show:

- **Money flowing** from revenue sources (left side)
- **Through the government budget** (center)
- **To spending categories** (right side)

**Flow width** = proportional to actual money amounts in billion rials.

## 🚀 Quick Start

### Generate Your First Diagram
```bash
# Activate virtual environment
source venv/bin/activate

# Create Sankey diagram for latest year (1404)
python create_sankey_diagram.py --year 1404
```

This creates:
- `sankey_diagram.html` - Interactive web diagram
- `sankey_diagram.png` - Static image snapshot

### View the Results
Open `sankey_diagram.html` in your web browser to see the interactive diagram!

## 📖 Usage Examples

### Single Year Analysis
```bash
# Year 1404 (most recent)
python create_sankey_diagram.py --year 1404 --output budget_2025.html

# Year 1395 (for comparison)
python create_sankey_diagram.py --year 1395 --output budget_2017.html

# Any year 1395-1404
python create_sankey_diagram.py --year 1400
```

### Multi-Year Comparison
```bash
# Side-by-side comparison of 1395 vs 1404
python create_sankey_diagram.py --compare --output year_comparison.html
```

### Aggregate Analysis
```bash
# All 10 years combined
python create_sankey_diagram.py --year all --output decade_summary.html
```

## 🎨 Diagram Structure

### Flow Path
```
Revenue Sources → Government Budget → Spending Categories
```

### Revenue Sources (Left Side)
| Category | Color | Description |
|----------|-------|-------------|
| **Tax Revenue** | 🔵 Blue | All tax collections |
| **Oil & Gas Revenue** | 🟠 Orange | Oil and gas export revenues |
| **Other Revenue** | 🟢 Green | Other government income |

### Spending Categories (Right Side)
| Category | Color | Description |
|----------|-------|-------------|
| **Current Expenditures** | 🔴 Red | Day-to-day government operations |
| **Capital Expenditures** | 🟣 Purple | Infrastructure and development |
| **Unclassified Spending** | 🤎 Brown | Broad spending categories |
| **Subsidy Spending** | 🩷 Pink | Government subsidies and supports |

### Government Budget (Center)
- **Gray intermediate node** representing the consolidated budget
- All revenues flow here first, then distribute to spending categories

## 💡 Interpretation Guide

### Flow Width Meaning
- **Thicker flows** = larger amounts of money
- Compare relative importance of different revenue/spending categories

### Key Insights to Look For
1. **Oil Dependency**: How much of revenue comes from oil/gas?
2. **Tax vs Other**: Balance between tax revenue and other sources
3. **Spending Priorities**: Which categories get the most funding?
4. **Budget Balance**: Does revenue exceed expenditure?

### Year-over-Year Changes
- Compare diagrams from different years to see trends
- Use `--compare` for direct side-by-side visualization

## 🔧 Advanced Usage

### Command Line Options
```bash
python create_sankey_diagram.py [OPTIONS]

Options:
  --year YEAR       Year to analyze (1395-1404) or 'all' (default: 1404)
  --output FILE     Output filename (default: sankey_diagram.html)
  --compare         Create comparison between 1395 and 1404
  --help           Show help message
```

### Custom Output Names
```bash
# Save with descriptive names
python create_sankey_diagram.py --year 1404 --output iran_budget_2025_flow.html

# Comparison diagram
python create_sankey_diagram.py --compare --output budget_evolution_2017_2025.html
```

## 📊 Sample Insights

### Year 1404 (2025) Key Findings:
- **Total Revenue**: 49.6 trillion rials
- **Total Expenditure**: 53.8 trillion rials
- **Oil Dependency**: ~41% of revenue from oil/gas
- **Largest Spending**: Current expenditures (~47% of spending)
- **Deficit**: 4.3 trillion rials (surplus year: 1402)

### Trends Across Decade:
- Oil revenue fluctuates significantly year-to-year
- Tax revenue shows steady growth
- Current expenditures dominate spending
- Only 1 surplus year (1402) out of 10

## 🛠️ Technical Details

### Data Sources
- Revenue: tax_total, oil_gas, revenue_other
- Spending: current_exp, capital_exp, unclassified, subsidy_spending
- All values in billion rials

### Generated Files
- **HTML**: Interactive web diagram with hover details
- **PNG**: Static image for reports/documents
- Both files have matching names (e.g., `diagram.html` + `diagram.png`)

### Dependencies
- plotly: Interactive diagram generation
- kaleido: PNG export capability
- pandas: Data processing
- psycopg2: Database connectivity

## 🎨 Customization

### Colors
The diagram uses a predefined color scheme optimized for:
- **Color blindness accessibility**
- **Print-friendly** (works in black & white)
- **Web viewing** (bright, distinct colors)

### Interactivity
- **Hover** over flows to see exact amounts
- **Click legends** to hide/show categories
- **Zoom and pan** for detailed inspection

## 📈 Use Cases

### Fiscal Analysis
- Track revenue diversification efforts
- Monitor oil dependency reduction
- Analyze spending allocation changes

### Policy Research
- Compare budget priorities across years
- Study impact of economic changes on revenue
- Evaluate subsidy program effectiveness

### Public Communication
- Create clear visualizations for reports
- Explain budget complexity to stakeholders
- Show fiscal health trends over time

## 🔍 Troubleshooting

### Common Issues

**"Database connection failed"**
- Ensure PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l`

**"No data found for year"**
- Verify year is between 1395-1404
- Check data was imported correctly

**"Module not found"**
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

**PNG export fails**
- Ensure kaleido is installed: `pip install kaleido`
- Check Plotly version compatibility

### File Locations
- Scripts: Project root directory
- Output: Generated in project root
- Database: Local PostgreSQL `iran_budget`

## 📚 Related Documentation

- **Database Setup**: `DATABASE_README.md`
- **Data Import**: `import_data.py`
- **Schema Details**: `create_schema.sql`
- **Query Examples**: `example_queries.sql`

## 🎯 Next Steps

1. **Generate diagrams** for different years
2. **Compare trends** using the comparison feature
3. **Export for reports** using PNG files
4. **Integrate into dashboards** using the HTML files

---

**Ready to visualize Iran's budget flows!** 🎉

*Generated diagrams show the complex interplay between revenue sources and government spending priorities.*
