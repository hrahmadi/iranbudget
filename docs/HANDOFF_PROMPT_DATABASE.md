# 🗄️ Iran Budget Database - Build Task

## 📋 PROJECT CONTEXT

You are tasked with building a database for **Iran's National Budget data spanning 10 years (1395-1404 / 2016-2025)**. The data has been fully extracted, cleaned, and verified. Your job is to design and implement a database that makes this data easily queryable and usable for analysis and dashboards.

---

## 📊 CURRENT STATE

### What's Already Done ✅

1. **Data Extraction Complete**: All 10 years extracted from official government budget documents
2. **Data Cleaned & Verified**: Numbers cross-checked against official sources
3. **Consistent Format**: All data normalized to billion rials
4. **Quality Assured**: 1395-1403 from detailed CSV files, 1404 from official law text

### Data Location

**Primary Dataset**:
- `/Users/hamidreza/Documents/AI-Projects/IranBudget/data/processed/iran_budget_1395_1404_complete.json`
- Contains all 10 years in a single structured JSON file

**Individual Year Files**:
- `/Users/hamidreza/Documents/AI-Projects/IranBudget/data/processed/budget_13XX_final.json` (one per year)

**Source Data** (for reference):
- `/Users/hamidreza/Documents/AI-Projects/IranBudget/data/raw/unverified/*.csv` (revenues and expenses by year)

---

## 📐 DATA STRUCTURE

Each year contains:

```json
{
  "year": 1404,
  "year_gregorian": "2025-2026",
  "currency": "billion rials",
  "source": "Budget law + official sources",
  
  "revenues": {
    "total": 49565000.0,
    "tax_total": 17000000.0,
    "oil_gas": 21070000.0,
    "tax_breakdown": {
      "corporate": 8166500.0,
      "individual": 1818200.0,
      "payroll": 0.0,
      "social_security": 0.0
    },
    "other": 11495000.0
  },
  
  "expenditures": {
    "total": 53845000.0,
    "current": 22676000.0,
    "capital": 0.0,
    "unclassified": 31169000.0,
    "subsidy_spending": 10500.0
  },
  
  "balance": {
    "surplus_deficit": -4280000.0,
    "status": "deficit"
  }
}
```

---

## 🎯 YOUR TASK

### Primary Objective
Create a **SQLite or PostgreSQL database** that:
1. Stores all 10 years of budget data in a normalized schema
2. Supports efficient querying for analysis and reporting
3. Enables year-over-year comparisons
4. Can be easily updated with future years
5. Provides a clean API/interface for dashboards

### Requirements

#### 1. Database Design
- [ ] Design normalized schema (3NF or star schema)
- [ ] Create tables for: Years, Revenues, Expenditures, Balances
- [ ] Add appropriate indexes for common queries
- [ ] Include metadata table (sources, data quality notes)

#### 2. Data Import
- [ ] Write script to import from JSON files
- [ ] Handle all 10 years (1395-1404)
- [ ] Validate data integrity during import
- [ ] Log any issues or discrepancies

#### 3. Query Interface
- [ ] Create views for common queries:
  - Total revenue/expenditure by year
  - Tax vs oil revenue trends
  - Year-over-year growth rates
  - Deficit/surplus history
- [ ] Write example queries for:
  - "Show me all years with surplus"
  - "Compare tax growth 1399-1404"
  - "What % of revenue is oil/gas by year?"

#### 4. Documentation
- [ ] Schema diagram (ERD)
- [ ] Data dictionary
- [ ] Example queries with explanations
- [ ] Instructions for adding new years

#### 5. Testing
- [ ] Verify all 10 years imported correctly
- [ ] Run test queries and validate results
- [ ] Check data consistency (totals should match)

---

## 🛠️ TECHNICAL SPECIFICATIONS

### Recommended Tech Stack
- **Database**: SQLite (for simplicity) or PostgreSQL (for scalability)
- **Language**: Python 3.x with:
  - `sqlite3` or `psycopg2` for database
  - `pandas` for data manipulation
  - `json` for reading source files
- **Optional**: SQLAlchemy for ORM if preferred

### Schema Suggestions

**Option A: Normalized Schema**
```sql
-- Years dimension
CREATE TABLE years (
    year_id INTEGER PRIMARY KEY,
    year_persian INTEGER UNIQUE,
    year_gregorian VARCHAR(10),
    currency VARCHAR(50),
    data_source TEXT
);

-- Revenues fact table
CREATE TABLE revenues (
    id INTEGER PRIMARY KEY,
    year_id INTEGER REFERENCES years(year_id),
    total DECIMAL(20, 2),
    tax_total DECIMAL(20, 2),
    oil_gas DECIMAL(20, 2),
    other DECIMAL(20, 2),
    tax_corporate DECIMAL(20, 2),
    tax_individual DECIMAL(20, 2),
    tax_payroll DECIMAL(20, 2),
    tax_social_security DECIMAL(20, 2)
);

-- Expenditures fact table
CREATE TABLE expenditures (
    id INTEGER PRIMARY KEY,
    year_id INTEGER REFERENCES years(year_id),
    total DECIMAL(20, 2),
    current_exp DECIMAL(20, 2),
    capital_exp DECIMAL(20, 2),
    unclassified DECIMAL(20, 2),
    subsidy_spending DECIMAL(20, 2)
);

-- Balance table
CREATE TABLE budget_balance (
    id INTEGER PRIMARY KEY,
    year_id INTEGER REFERENCES years(year_id),
    surplus_deficit DECIMAL(20, 2),
    status VARCHAR(20)
);
```

**Option B: Star Schema** (for analytics)
- Fact table: `budget_facts` with all metrics
- Dimension tables: `dim_year`, `dim_revenue_type`, `dim_expenditure_type`

Choose what makes sense for the use case!

---

## 📈 SUCCESS CRITERIA

Your implementation is successful if:

1. ✅ All 10 years of data imported without errors
2. ✅ Schema is documented and logical
3. ✅ Can query any metric for any year in <100ms
4. ✅ Year-over-year growth calculations work correctly
5. ✅ Database file/connection works on the user's machine
6. ✅ Clear instructions provided for:
   - How to query the database
   - How to add new years
   - How to export data
7. ✅ At least 5 example queries demonstrating usefulness

---

## 🎁 DELIVERABLES

Please create:

1. **Database file** (`.db` for SQLite or connection script for PostgreSQL)
2. **Schema script** (`create_schema.sql`)
3. **Import script** (`import_data.py`)
4. **Query examples** (`example_queries.sql` or `.py`)
5. **Documentation** (`DATABASE_README.md`) with:
   - Schema overview
   - How to use
   - Example queries
   - How to update
6. **Validation report** showing data integrity checks

---

## 💡 NICE-TO-HAVE (Optional)

If time permits:
- [ ] Simple Python API wrapper for common queries
- [ ] Export functions (to CSV, Excel, JSON)
- [ ] Backup/restore scripts
- [ ] Data quality dashboard (simple HTML/Python)
- [ ] Jupyter notebook with analysis examples

---

## 📚 REFERENCE DOCUMENTS

For context, review:
- `data/processed/IRAN_BUDGET_10_YEAR_SUMMARY.md` - Overview of the data
- `data/processed/budget_1404_final.json` - Example of data structure
- `data/processed/iran_budget_1395_1404_complete.json` - Full dataset

---

## ⚠️ IMPORTANT NOTES

1. **Units**: All numbers are in **billion rials**. Keep this consistent!
2. **Missing Data**: Some years have zeros for certain categories (e.g., payroll tax not separately reported). This is expected.
3. **1404 Data Quality**: Year 1404 uses broader categories than 1395-1403 due to source limitations. Document this.
4. **Future Proofing**: Design should easily accommodate 1405, 1406, etc.

---

## 🚀 GETTING STARTED

1. Review the JSON data structure
2. Design your schema (sketch it out)
3. Get user approval on schema before implementing
4. Create database and import data
5. Test with example queries
6. Document everything

---

## 📞 QUESTIONS TO ASK USER

Before starting, confirm:
1. **Database type**: SQLite (simpler) or PostgreSQL (more powerful)?
2. **Primary use case**: 
   - Quick queries and reports?
   - Dashboard backend?
   - Research/analysis?
3. **Access method**: 
   - Direct SQL?
   - Python API?
   - Web interface?
4. **Update frequency**: Will new years be added annually?

---

## 🎯 USER'S ORIGINAL GOAL

Remember: The user wants to **"build different dashboards and reports"** from this data. Your database should make that easy!

---

**Good luck! This is clean, well-structured data ready for a great database implementation.** 🚀

