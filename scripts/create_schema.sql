-- Iran Budget Database Schema
-- PostgreSQL normalized schema for 10 years of budget data (1395-1404)

-- Create database and user (run these manually if needed)
-- CREATE DATABASE iran_budget;
-- CREATE USER budget_user WITH PASSWORD 'your_password';
-- GRANT ALL PRIVILEGES ON DATABASE iran_budget TO budget_user;

-- =====================================================
-- YEARS DIMENSION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS years (
    year_id SERIAL PRIMARY KEY,
    year_persian INTEGER UNIQUE NOT NULL,
    year_gregorian VARCHAR(20),
    currency VARCHAR(50) DEFAULT 'billion rials',
    data_source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REVENUES FACT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS revenues (
    revenue_id SERIAL PRIMARY KEY,
    year_id INTEGER REFERENCES years(year_id) ON DELETE CASCADE,
    total DECIMAL(20, 3),
    tax_total DECIMAL(20, 3),
    oil_gas DECIMAL(20, 3),
    other DECIMAL(20, 3),
    -- Tax breakdown
    tax_corporate DECIMAL(20, 3),
    tax_individual DECIMAL(20, 3),
    tax_payroll DECIMAL(20, 3),
    tax_social_security DECIMAL(20, 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year_id)
);

-- =====================================================
-- EXPENDITURES FACT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenditures (
    expenditure_id SERIAL PRIMARY KEY,
    year_id INTEGER REFERENCES years(year_id) ON DELETE CASCADE,
    total DECIMAL(20, 3),
    current_exp DECIMAL(20, 3),
    capital_exp DECIMAL(20, 3),
    unclassified DECIMAL(20, 3),
    subsidy_spending DECIMAL(20, 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year_id)
);

-- =====================================================
-- BUDGET BALANCE FACT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS budget_balance (
    balance_id SERIAL PRIMARY KEY,
    year_id INTEGER REFERENCES years(year_id) ON DELETE CASCADE,
    surplus_deficit DECIMAL(20, 3),
    status VARCHAR(20), -- 'surplus' or 'deficit'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary key indexes (automatically created by PostgreSQL)
-- Additional indexes for common queries

-- Index for year lookups
CREATE INDEX IF NOT EXISTS idx_years_persian ON years(year_persian);
CREATE INDEX IF NOT EXISTS idx_years_gregorian ON years(year_gregorian);

-- Index for revenue queries
CREATE INDEX IF NOT EXISTS idx_revenues_year ON revenues(year_id);
CREATE INDEX IF NOT EXISTS idx_revenues_total ON revenues(total);
CREATE INDEX IF NOT EXISTS idx_revenues_tax ON revenues(tax_total);
CREATE INDEX IF NOT EXISTS idx_revenues_oil_gas ON revenues(oil_gas);

-- Index for expenditure queries
CREATE INDEX IF NOT EXISTS idx_expenditures_year ON expenditures(year_id);
CREATE INDEX IF NOT EXISTS idx_expenditures_total ON expenditures(total);
CREATE INDEX IF NOT EXISTS idx_expenditures_current ON expenditures(current_exp);

-- Index for balance queries
CREATE INDEX IF NOT EXISTS idx_balance_year ON budget_balance(year_id);
CREATE INDEX IF NOT EXISTS idx_balance_status ON budget_balance(status);
CREATE INDEX IF NOT EXISTS idx_balance_deficit ON budget_balance(surplus_deficit);

-- =====================================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- =====================================================

-- Complete budget overview
CREATE OR REPLACE VIEW budget_overview AS
SELECT
    y.year_persian,
    y.year_gregorian,
    y.currency,
    y.data_source,
    r.total as revenue_total,
    r.tax_total,
    r.oil_gas,
    r.other as revenue_other,
    e.total as expenditure_total,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    b.surplus_deficit,
    b.status
FROM years y
LEFT JOIN revenues r ON y.year_id = r.year_id
LEFT JOIN expenditures e ON y.year_id = e.year_id
LEFT JOIN budget_balance b ON y.year_id = b.year_id
ORDER BY y.year_persian;

-- Revenue trends analysis
CREATE OR REPLACE VIEW revenue_trends AS
SELECT
    y.year_persian,
    y.year_gregorian,
    r.total as total_revenue,
    r.tax_total,
    r.oil_gas,
    ROUND((r.oil_gas / r.total) * 100, 2) as oil_gas_percentage,
    ROUND((r.tax_total / r.total) * 100, 2) as tax_percentage,
    r.tax_corporate,
    r.tax_individual,
    r.tax_payroll,
    r.tax_social_security
FROM years y
LEFT JOIN revenues r ON y.year_id = r.year_id
ORDER BY y.year_persian;

-- Expenditure analysis
CREATE OR REPLACE VIEW expenditure_analysis AS
SELECT
    y.year_persian,
    y.year_gregorian,
    e.total as total_expenditure,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    ROUND((e.current_exp / e.total) * 100, 2) as current_percentage,
    ROUND((e.capital_exp / e.total) * 100, 2) as capital_percentage,
    ROUND((e.subsidy_spending / e.total) * 100, 2) as subsidy_percentage
FROM years y
LEFT JOIN expenditures e ON y.year_id = e.year_id
ORDER BY y.year_persian;

-- Balance analysis
CREATE OR REPLACE VIEW balance_analysis AS
SELECT
    y.year_persian,
    y.year_gregorian,
    b.surplus_deficit,
    b.status,
    CASE
        WHEN b.surplus_deficit > 0 THEN 'Surplus'
        WHEN b.surplus_deficit < 0 THEN 'Deficit'
        ELSE 'Balanced'
    END as balance_type,
    ABS(b.surplus_deficit) as deficit_magnitude
FROM years y
LEFT JOIN budget_balance b ON y.year_id = b.year_id
ORDER BY y.year_persian;

-- Year-over-year growth rates
CREATE OR REPLACE VIEW yoy_growth AS
WITH yearly_totals AS (
    SELECT
        y.year_persian,
        r.total as revenue,
        e.total as expenditure,
        b.surplus_deficit as balance
    FROM years y
    LEFT JOIN revenues r ON y.year_id = r.year_id
    LEFT JOIN expenditures e ON y.year_id = e.year_id
    LEFT JOIN budget_balance b ON y.year_id = b.year_id
)
SELECT
    current.year_persian,
    current.revenue,
    previous.revenue as prev_revenue,
    ROUND(
        CASE
            WHEN previous.revenue > 0
            THEN ((current.revenue - previous.revenue) / previous.revenue) * 100
            ELSE NULL
        END, 2
    ) as revenue_growth_pct,
    current.expenditure,
    previous.expenditure as prev_expenditure,
    ROUND(
        CASE
            WHEN previous.expenditure > 0
            THEN ((current.expenditure - previous.expenditure) / previous.expenditure) * 100
            ELSE NULL
        END, 2
    ) as expenditure_growth_pct
FROM yearly_totals current
LEFT JOIN yearly_totals previous ON current.year_persian = previous.year_persian + 1
ORDER BY current.year_persian;

-- =====================================================
-- METADATA TABLE FOR DATA QUALITY NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS data_quality_notes (
    note_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    year_persian INTEGER,
    note_type VARCHAR(20), -- 'warning', 'info', 'error'
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial data quality notes
INSERT INTO data_quality_notes (table_name, year_persian, note_type, note) VALUES
('general', NULL, 'info', 'All monetary values are in billion rials'),
('revenues', 1404, 'warning', 'Year 1404 uses broader tax categories due to source limitations'),
('expenditures', NULL, 'info', 'Some years have zero values for certain categories (e.g., payroll tax not separately reported)');

-- =====================================================
-- GRANT PERMISSIONS (uncomment if needed)
-- =====================================================
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO budget_user;
-- GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO budget_user;
