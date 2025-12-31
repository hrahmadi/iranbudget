# 🗄️ Iran Budget Database

A comprehensive PostgreSQL database containing 10 years of Iranian national budget data (1395-1404 / 2016-2025), designed for analysis, reporting, and dashboard development.

## 📊 Overview

This database provides normalized access to Iran's budget data with:
- **10 years** of verified budget data
- **Structured schema** optimized for analytical queries
- **Pre-built views** for common analyses
- **Example queries** for immediate insights
- **Deployment-ready** for web applications

All monetary values are in **billion rials**.

## 🚀 Quick Start

### Prerequisites
- PostgreSQL 12+ installed and running
- Python 3.8+ with required packages

### 1. Database Setup
```bash
# Create database (adjust connection details as needed)
createdb iran_budget

# Or use psql:
psql -c "CREATE DATABASE iran_budget;"
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create Schema
```bash
psql iran_budget < create_schema.sql
```

### 4. Import Data
```bash
python import_data.py
```

### 5. Verify Installation
```bash
psql iran_budget -c "SELECT COUNT(*) FROM budget_overview;"
```

## 📁 File Structure

```
├── create_schema.sql          # Database schema and views
├── import_data.py             # Data import script
├── example_queries.sql        # 32+ example queries
├── DATABASE_README.md         # This documentation
├── requirements.txt           # Python dependencies
└── data/processed/
    └── iran_budget_1395_1404_complete.json  # Source data
```

## 🏗️ Database Schema

### Core Tables

#### `years` - Time dimension
```sql
year_id        SERIAL PRIMARY KEY
year_persian   INTEGER UNIQUE    -- 1395-1404
year_gregorian VARCHAR(20)       -- Gregorian equivalent
currency       VARCHAR(50)       -- "billion rials"
data_source    TEXT              -- Data provenance
```

#### `revenues` - Revenue fact table
```sql
year_id              INTEGER REFERENCES years
total                DECIMAL(20,3)    -- Total revenue
tax_total            DECIMAL(20,3)    -- All tax revenue
oil_gas              DECIMAL(20,3)    -- Oil & gas revenue
other                DECIMAL(20,3)    -- Other revenues
tax_corporate        DECIMAL(20,3)    -- Corporate tax
tax_individual       DECIMAL(20,3)    -- Individual tax
tax_payroll          DECIMAL(20,3)    -- Payroll tax
tax_social_security  DECIMAL(20,3)    -- Social security tax
```

#### `expenditures` - Expenditure fact table
```sql
year_id           INTEGER REFERENCES years
total             DECIMAL(20,3)    -- Total expenditure
current_exp       DECIMAL(20,3)    -- Current expenditures
capital_exp       DECIMAL(20,3)    -- Capital expenditures
unclassified      DECIMAL(20,3)    -- Unclassified spending
subsidy_spending  DECIMAL(20,3)    -- Government subsidies
```

#### `budget_balance` - Balance fact table
```sql
year_id         INTEGER REFERENCES years
surplus_deficit DECIMAL(20,3)    -- Positive = surplus, negative = deficit
status          VARCHAR(20)      -- 'surplus' or 'deficit'
```

### Pre-built Views

#### `budget_overview` - Complete yearly summary
#### `revenue_trends` - Revenue analysis with percentages
#### `expenditure_analysis` - Expenditure breakdown
#### `balance_analysis` - Deficit/surplus analysis
#### `yoy_growth` - Year-over-year growth rates

## 🔍 Example Queries

### Basic Overview
```sql
-- Complete budget summary
SELECT * FROM budget_overview ORDER BY year_persian;

-- Years with surplus
SELECT year_persian, surplus_deficit, status
FROM budget_overview
WHERE status = 'surplus';
```

### Revenue Analysis
```sql
-- Oil vs tax revenue trends
SELECT year_persian, oil_gas, tax_total,
       ROUND((oil_gas/total_revenue)*100, 2) as oil_percentage
FROM revenue_trends;
```

### Growth Analysis
```sql
-- Year-over-year growth rates
SELECT year_persian, revenue_growth_pct, expenditure_growth_pct
FROM yoy_growth;
```

### Dashboard Queries
```sql
-- KPI summary
SELECT
    COUNT(*) as total_years,
    ROUND(AVG(revenue_total), 2) as avg_revenue,
    SUM(CASE WHEN status='surplus' THEN 1 ELSE 0 END) as surplus_years
FROM budget_overview;
```

See `example_queries.sql` for 32+ comprehensive examples.

## 🐍 Python Usage

### Basic Connection
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="iran_budget",
    user="postgres",
    password="your_password"
)

# Query data
with conn.cursor() as cursor:
    cursor.execute("SELECT * FROM budget_overview")
    results = cursor.fetchall()
```

### Pandas Integration
```python
import pandas as pd
import psycopg2

conn = psycopg2.connect(...)
df = pd.read_sql("SELECT * FROM budget_overview", conn)
print(df.head())
```

### Data Export
```python
# Export to CSV
df = pd.read_sql("SELECT * FROM budget_overview", conn)
df.to_csv('iran_budget_data.csv', index=False)

# Export to Excel
df.to_excel('iran_budget_data.xlsx', index=False)
```

## 📈 Data Insights

Based on the imported data:

- **Coverage**: 10 years (1395-1404)
- **Total Revenue**: ~45,000 billion rials annually
- **Total Expenditure**: ~49,000 billion rials annually
- **Fiscal Status**: Predominantly deficit (8/10 years)
- **Oil Dependency**: ~40-50% of revenue from oil/gas
- **Largest Deficit**: Year 1395 (~14.8k billion rials)
- **Subsidy Spending**: ~1-5% of total expenditure

## 📊 Sankey Diagram Visualization

Create interactive Sankey diagrams showing budget flow from revenue sources to spending categories:

### Quick Start
```bash
# Generate Sankey diagram for year 1404
python create_sankey_diagram.py --year 1404

# Generate comparison between 1395 and 1404
python create_sankey_diagram.py --compare

# Generate aggregate diagram for all years
python create_sankey_diagram.py --year all --output all_years_sankey.html
```

### Features
- **Interactive HTML diagrams** with hover details
- **Color-coded flows** distinguishing revenue sources and spending categories
- **Proportional widths** showing actual money amounts
- **Comparison views** between different years
- **PNG export** for static images

### Diagram Structure
```
Revenue Sources → Government Budget → Spending Categories

Revenue Sources:
• Tax Revenue (blue)
• Oil & Gas Revenue (orange)
• Other Revenue (green)

Spending Categories:
• Current Expenditures (red)
• Capital Expenditures (purple)
• Unclassified Spending (brown)
• Subsidy Spending (pink)
```

### Examples

**Single Year Diagram:**
```bash
python create_sankey_diagram.py --year 1404 --output iran_budget_1404.html
```

**Year Comparison:**
```bash
python create_sankey_diagram.py --compare --output budget_comparison_1395_1404.html
```

**All Years Aggregate:**
```bash
python create_sankey_diagram.py --year all --output decade_overview.html
```

## 🔧 Configuration

### Database Connection
Edit `import_data.py` to configure your database connection:

```python
db_config = {
    'host': 'localhost',
    'database': 'iran_budget',
    'user': 'your_username',
    'password': 'your_password',
    'port': 5432
}
```

### Environment Variables
For production deployments:

```bash
export DB_HOST=your_host
export DB_NAME=iran_budget
export DB_USER=your_user
export DB_PASSWORD=your_password
```

## 🚀 Deployment Options

### Local Development
- Use SQLite for testing (modify scripts as needed)
- Run PostgreSQL in Docker:

```bash
docker run --name postgres-budget -e POSTGRES_PASSWORD=mypass -d postgres:15
```

### Production Deployment
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Set up connection pooling (PgBouncer)
- Configure backups and monitoring

### Web Application Integration
The database is designed for dashboard applications:

```python
# Flask/Django example
from flask import Flask, jsonify
import psycopg2

app = Flask(__name__)

@app.route('/api/budget/overview')
def get_budget_overview():
    conn = psycopg2.connect(**db_config)
    df = pd.read_sql("SELECT * FROM budget_overview", conn)
    return jsonify(df.to_dict('records'))
```

## 🔍 Data Quality Notes

- **Units**: All values in billion rials
- **Year 1404**: Uses broader categories due to source limitations
- **Missing Data**: Some years have zeros for payroll/social security taxes
- **Validation**: Import script checks data integrity automatically

## 🛠️ Maintenance

### Adding New Years
1. Update the JSON data file
2. Run the import script again (handles updates via UPSERT)
3. Verify with validation queries

### Backup
```bash
# Database backup
pg_dump iran_budget > iran_budget_backup.sql

# Restore
psql iran_budget < iran_budget_backup.sql
```

### Performance Optimization
- Indexes are pre-created for common queries
- Use `EXPLAIN ANALYZE` to optimize slow queries
- Consider partitioning for larger datasets

## 📊 Analytical Use Cases

### Fiscal Policy Analysis
- Track deficit trends over time
- Analyze oil dependency reduction
- Monitor subsidy spending effectiveness

### Economic Indicators
- Revenue growth vs GDP growth correlation
- Tax policy effectiveness
- Expenditure prioritization

### Dashboard Development
- Real-time budget monitoring
- Year-over-year comparisons
- Predictive analytics foundation

## 🤝 Contributing

### Schema Updates
1. Modify `create_schema.sql`
2. Test with sample data
3. Update documentation
4. Run migration scripts

### Query Optimization
1. Use `EXPLAIN ANALYZE` to identify bottlenecks
2. Add indexes for new query patterns
3. Update example queries

## 📞 Support

### Common Issues

**Import fails with connection error:**
- Ensure PostgreSQL is running
- Check database credentials
- Verify database exists

**Data validation errors:**
- Check JSON file integrity
- Review import logs (`import_log.txt`)
- Validate totals manually

**Slow queries:**
- Check if indexes are created
- Use `EXPLAIN ANALYZE` for query optimization
- Consider adding composite indexes

## 📚 Additional Resources

- **Source Data**: `data/processed/IRAN_BUDGET_10_YEAR_SUMMARY.md`
- **Technical Spec**: `HANDOFF_PROMPT_DATABASE.md`
- **Data Dictionary**: See schema comments in `create_schema.sql`

## 🎯 Success Metrics

✅ **Database loads successfully** with all 10 years
✅ **Queries return results** in <100ms
✅ **Data integrity** validated (totals match)
✅ **Documentation** enables independent usage
✅ **Schema supports** planned analyses

---

**Ready to analyze Iran's budget data!** 🎉

For questions or issues, check the example queries and ensure PostgreSQL is properly configured.
