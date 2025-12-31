# PostgreSQL Database Documentation - Iran Budget

**Database Name:** `iran_budget`  
**Owner:** `hamidreza`  
**Encoding:** UTF8  
**Total Years:** 10 (1395-1404)

---

## 📊 Database Overview

The database stores 10 years of Iranian national budget data in a normalized star schema optimized for analytical queries and dashboard applications.

**All monetary values are in billion rials.**

---

## 🗄️ Schema Structure

### Core Tables (4 Fact Tables + 1 Dimension)

```
years (dimension)
  ↓
├─ revenues (fact)
├─ expenditures (fact)
├─ budget_balance (fact)
└─ data_quality_notes (metadata)
```

---

## 📋 Table Details

### 1. `years` (Dimension Table)
**Purpose:** Time dimension for all budget data

| Column | Type | Description |
|--------|------|-------------|
| `year_id` | SERIAL PK | Auto-increment primary key |
| `year_persian` | INTEGER UNIQUE | Persian calendar year (1395-1404) |
| `year_gregorian` | VARCHAR(20) | Gregorian equivalent (e.g., "2025-2026") |
| `currency` | VARCHAR(50) | Default: "billion rials" |
| `data_source` | TEXT | Origin of data |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Primary: `year_id`
- Unique: `year_persian`
- Index: `year_gregorian`

**Records:** 10 rows (1395-1404)

**Sample Data:**
```
year_id | year_persian | year_gregorian | data_source
--------|--------------|----------------|-------------
1       | 1395         | 774-775        | CSV data from official budget tables
10      | 1404         | 2025-2026      | Budget law (Part 1) + official web sources
```

---

### 2. `revenues` (Fact Table)
**Purpose:** Store all revenue data including tax breakdown

| Column | Type | Description |
|--------|------|-------------|
| `revenue_id` | SERIAL PK | Auto-increment primary key |
| `year_id` | INTEGER FK | References `years.year_id` |
| `total` | DECIMAL(20,3) | Total revenue |
| `tax_total` | DECIMAL(20,3) | All tax revenue combined |
| `oil_gas` | DECIMAL(20,3) | Oil & gas exports revenue |
| `other` | DECIMAL(20,3) | Other revenue sources |
| `tax_corporate` | DECIMAL(20,3) | Corporate tax |
| `tax_individual` | DECIMAL(20,3) | Individual income tax |
| `tax_payroll` | DECIMAL(20,3) | Payroll tax |
| `tax_social_security` | DECIMAL(20,3) | Social security tax |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Primary: `revenue_id`
- Unique: `year_id`
- Performance indexes on: `total`, `tax_total`, `oil_gas`

**Foreign Keys:**
- `year_id` → `years.year_id` (CASCADE DELETE)

**Sample Data (Year 1404):**
```
total: 49,565,000 billion rials
tax_total: 17,000,000 billion rials (34.3%)
oil_gas: 21,070,000 billion rials (42.5%)
other: 11,495,000 billion rials (23.2%)
```

---

### 3. `expenditures` (Fact Table)
**Purpose:** Store all spending/expenditure data

| Column | Type | Description |
|--------|------|-------------|
| `expenditure_id` | SERIAL PK | Auto-increment primary key |
| `year_id` | INTEGER FK | References `years.year_id` |
| `total` | DECIMAL(20,3) | Total expenditure |
| `current_exp` | DECIMAL(20,3) | Current/operational expenses |
| `capital_exp` | DECIMAL(20,3) | Capital investments |
| `unclassified` | DECIMAL(20,3) | Unclassified/other spending |
| `subsidy_spending` | DECIMAL(20,3) | Government subsidies |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Primary: `expenditure_id`
- Unique: `year_id`
- Performance indexes on: `total`, `current_exp`

**Foreign Keys:**
- `year_id` → `years.year_id` (CASCADE DELETE)

**Sample Data (Year 1404):**
```
total: 53,845,000 billion rials
current_exp: 22,676,000 billion rials (42.1%)
capital_exp: 20,700,000 billion rials (38.5%)
unclassified: 10,469,000 billion rials (19.4%)
subsidy_spending: 10,500,000 billion rials (19.5% - overlaps with unclassified)
```

**Note:** Year 1404 has significantly higher values and proper categorization compared to earlier years.

---

### 4. `budget_balance` (Fact Table)
**Purpose:** Track surplus/deficit for each year

| Column | Type | Description |
|--------|------|-------------|
| `balance_id` | SERIAL PK | Auto-increment primary key |
| `year_id` | INTEGER FK | References `years.year_id` |
| `surplus_deficit` | DECIMAL(20,3) | Positive = surplus, Negative = deficit |
| `status` | VARCHAR(20) | "surplus" or "deficit" |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Primary: `balance_id`
- Unique: `year_id`
- Performance indexes on: `status`, `surplus_deficit`

**Foreign Keys:**
- `year_id` → `years.year_id` (CASCADE DELETE)

**Historical Overview:**
```
Year 1395-1401: All deficits
Year 1402: ONLY SURPLUS year (1,196,967.549 billion rials)
Year 1403: Deficit
Year 1404: Largest deficit (-4,280,000 billion rials)
```

**Surplus Years:** 1 out of 10 (10%)  
**Deficit Years:** 9 out of 10 (90%)

---

### 5. `data_quality_notes` (Metadata Table)
**Purpose:** Track data quality issues and notes

| Column | Type | Description |
|--------|------|-------------|
| `note_id` | SERIAL PK | Auto-increment primary key |
| `table_name` | VARCHAR(50) | Which table the note refers to |
| `year_persian` | INTEGER | Specific year (NULL = all years) |
| `note_type` | VARCHAR(20) | "warning", "info", "error" |
| `note` | TEXT | Description of the issue |
| `created_at` | TIMESTAMP | Record creation time |

**Sample Notes:**
- All monetary values are in billion rials (info)
- Year 1404 uses broader tax categories due to source limitations (warning)
- Some years have zero values for certain categories (info)

---

## 📊 Pre-Built Views (5 Analytical Views)

### 1. `budget_overview`
**Purpose:** Complete yearly summary joining all tables

**Columns:**
- Year info (persian, gregorian, currency, source)
- Revenue: total, tax_total, oil_gas, other
- Expenditure: total, current_exp, capital_exp, unclassified, subsidy_spending
- Balance: surplus_deficit, status

**Usage:**
```sql
SELECT * FROM budget_overview WHERE year_persian = 1404;
```

---

### 2. `revenue_trends`
**Purpose:** Revenue analysis with percentages

**Key Metrics:**
- Oil/gas percentage of total
- Tax percentage of total
- Tax breakdown by type

**Usage:**
```sql
SELECT year_persian, oil_gas_percentage, tax_percentage 
FROM revenue_trends 
ORDER BY year_persian;
```

---

### 3. `expenditure_analysis`
**Purpose:** Expenditure breakdown with percentages

**Key Metrics:**
- Current spending %
- Capital spending %
- Subsidy spending %

**Usage:**
```sql
SELECT year_persian, current_percentage, capital_percentage 
FROM expenditure_analysis 
WHERE year_persian BETWEEN 1400 AND 1404;
```

---

### 4. `balance_analysis`
**Purpose:** Deficit/surplus analysis

**Key Metrics:**
- Balance type (Surplus/Deficit/Balanced)
- Deficit magnitude (absolute value)

**Usage:**
```sql
SELECT * FROM balance_analysis 
WHERE status = 'surplus';
```

---

### 5. `yoy_growth`
**Purpose:** Year-over-year growth rates

**Key Metrics:**
- Revenue growth %
- Expenditure growth %
- Comparison with previous year

**Usage:**
```sql
SELECT year_persian, revenue_growth_pct, expenditure_growth_pct 
FROM yoy_growth 
WHERE revenue_growth_pct > 50;
```

---

## 📈 Data Insights

### Revenue Composition (Year 1404):
- **Oil Dependency:** 42.5% (21,070,000 billion rials)
- **Tax Base:** 34.3% (17,000,000 billion rials)
- **Other Sources:** 23.2% (11,495,000 billion rials)

### Expenditure Composition (Year 1404):
- **Current Expenses:** 42.1% (22,676,000 billion rials)
- **Capital Investments:** 38.5% (20,700,000 billion rials)
- **Unclassified:** 19.4% (10,469,000 billion rials)

### Historical Trends:
- **Inflation Impact:** Year 1404 values are ~4-10x higher than 1395-1403
- **Oil Revenue Volatility:** Ranges from 115,812 (1399) to 21,070,000 (1404)
- **Deficit Trend:** Increasing deficits over time, with 1402 as anomaly

### Data Quality Notes:
- Years 1395-1403: Values in millions/billions scale
- Year 1404: Values jump to trillions scale (unit change or inflation)
- Gregorian years for 1395-1403 appear incorrect (774-783 should be 2016-2024)

---

## 🔧 Connection Details

**Database:** `iran_budget`  
**Host:** `localhost`  
**Port:** `5432` (default PostgreSQL)  
**Owner:** `hamidreza`

**Python Connection:**
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="iran_budget",
    user="hamidreza",
    password="" 
)
```

---

## 🚀 Usage for React App

### Option 1: Direct Query (Recommended)
Export data to JSON for frontend:

```bash
psql -d iran_budget -t -A -F"," -c "SELECT row_to_json(t) FROM (SELECT * FROM budget_overview) t" > budget_data.json
```

### Option 2: API Backend
Create a simple API server (Flask/FastAPI) to serve data:

```python
from flask import Flask, jsonify
import psycopg2

app = Flask(__name__)

@app.route('/api/budget/<int:year>')
def get_budget(year):
    conn = psycopg2.connect(database="iran_budget", user="hamidreza")
    cur = conn.cursor()
    cur.execute("SELECT * FROM budget_overview WHERE year_persian = %s", (year,))
    result = cur.fetchone()
    return jsonify(result)
```

### Option 3: Export All Years
Create a comprehensive JSON export:

```sql
COPY (
    SELECT json_agg(t) FROM (
        SELECT * FROM budget_overview ORDER BY year_persian
    ) t
) TO '/tmp/all_budget_data.json';
```

---

## 🔍 Key Queries for App

### Get Year 1404 Complete Data:
```sql
SELECT * FROM budget_overview WHERE year_persian = 1404;
```

### Get All Years Revenue:
```sql
SELECT year_persian, total, tax_total, oil_gas, other 
FROM revenues 
ORDER BY year_persian;
```

### Get Deficit/Surplus History:
```sql
SELECT year_persian, surplus_deficit, status 
FROM budget_balance 
ORDER BY year_persian;
```

### Calculate Oil Dependency:
```sql
SELECT year_persian, 
       ROUND((oil_gas / total) * 100, 2) as oil_percentage
FROM revenue_trends;
```

---

## ⚠️ Important Notes

1. **Unit Consistency:** All values in billion rials
2. **Year 1404 Scaling:** 10-100x larger than previous years
3. **Missing Tax Breakdown:** Some years have 0.000 for payroll/social_security taxes
4. **Gregorian Years:** Need correction for years 1395-1403
5. **Unclassified Category:** Large in 1404, represents broad spending categories

---

**Database Status:** ✅ Operational and populated with 10 years of data
