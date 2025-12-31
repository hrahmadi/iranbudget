-- Schema Update: Add Missing Revenue and Expenditure Categories
-- Date: 2025-12-30
-- Purpose: Expand schema to include asset sales, borrowing, and other missing categories

-- =====================================================
-- ADD NEW COLUMNS TO REVENUES TABLE
-- =====================================================

ALTER TABLE revenues 
ADD COLUMN IF NOT EXISTS asset_sales DECIMAL(20, 3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS borrowing DECIMAL(20, 3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS development_fund DECIMAL(20, 3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS special_accounts DECIMAL(20, 3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS operational_revenue DECIMAL(20, 3);

-- Add comments to explain new columns
COMMENT ON COLUMN revenues.asset_sales IS 'واگذاری دارایی‌های سرمایه‌ای - Asset sales (capital assets)';
COMMENT ON COLUMN revenues.borrowing IS 'استقراض - Government borrowing';
COMMENT ON COLUMN revenues.development_fund IS 'برداشت از صندوق توسعه ملی - National Development Fund withdrawals';
COMMENT ON COLUMN revenues.special_accounts IS 'حساب‌های ویژه - Special government accounts';
COMMENT ON COLUMN revenues.operational_revenue IS 'درآمدهای عملیاتی - Operational revenues (tax + oil + other)';

-- Update operational_revenue to be calculated field for existing data
UPDATE revenues 
SET operational_revenue = COALESCE(tax_total, 0) + COALESCE(oil_gas, 0) + COALESCE(other, 0);

-- Update total to include new categories (for future data)
-- Note: For years 1395-1403, total currently equals operational_revenue
-- For year 1404, total should include all sources

-- Add index for new columns
CREATE INDEX IF NOT EXISTS idx_revenues_asset_sales ON revenues(asset_sales);
CREATE INDEX IF NOT EXISTS idx_revenues_borrowing ON revenues(borrowing);

-- =====================================================
-- UPDATE COLUMN COMMENTS FOR CLARITY
-- =====================================================

COMMENT ON COLUMN revenues.total IS 'Total revenues including operational + asset sales + borrowing + special accounts';
COMMENT ON COLUMN revenues.tax_total IS 'Total tax revenues (all categories combined)';
COMMENT ON COLUMN revenues.oil_gas IS 'Oil and gas export revenues';
COMMENT ON COLUMN revenues.other IS 'Other operational revenues (fees, state enterprises, etc.)';

-- =====================================================
-- ADD SCOPE TRACKING TO YEARS TABLE
-- =====================================================

ALTER TABLE years
ADD COLUMN IF NOT EXISTS revenue_scope VARCHAR(100) DEFAULT 'operational_only',
ADD COLUMN IF NOT EXISTS expenditure_scope VARCHAR(100) DEFAULT 'government_general';

COMMENT ON COLUMN years.revenue_scope IS 'Scope of revenue data: operational_only, منابع_عمومی, or full_national';
COMMENT ON COLUMN years.expenditure_scope IS 'Scope of expenditure data: government_general or full_national';

-- Update scope for existing years
UPDATE years 
SET revenue_scope = 'operational_only',
    expenditure_scope = 'government_general'
WHERE year_persian BETWEEN 1395 AND 1403;

UPDATE years 
SET revenue_scope = 'منابع_عمومی',
    expenditure_scope = 'government_general'  
WHERE year_persian = 1404;

-- =====================================================
-- CREATE BUDGET SCOPE METADATA TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS budget_scope_notes (
    note_id SERIAL PRIMARY KEY,
    year_id INTEGER REFERENCES years(year_id) ON DELETE CASCADE,
    category VARCHAR(50), -- 'revenue' or 'expenditure'
    scope_type VARCHAR(100),
    included_items TEXT[],
    excluded_items TEXT[],
    percentage_of_total DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert scope notes for historical years
INSERT INTO budget_scope_notes (year_id, category, scope_type, included_items, excluded_items, percentage_of_total, notes)
SELECT 
    year_id,
    'revenue',
    'operational_only',
    ARRAY['Tax revenues', 'Oil & gas revenues', 'Other operational revenues'],
    ARRAY['Asset sales', 'Borrowing', 'Development fund', 'Financial operations'],
    50.8,
    'Data from CSV files contains only operational revenues (~51% of منابع عمومی)'
FROM years 
WHERE year_persian BETWEEN 1395 AND 1403;

-- =====================================================
-- CREATE ENHANCED VIEWS
-- =====================================================

-- Updated budget overview with scope information
CREATE OR REPLACE VIEW budget_overview_detailed AS
SELECT
    y.year_persian,
    y.year_gregorian,
    y.currency,
    y.data_source,
    y.revenue_scope,
    y.expenditure_scope,
    -- Operational revenues
    r.tax_total,
    r.oil_gas,
    r.other as operational_other,
    r.operational_revenue,
    -- Additional revenues
    r.asset_sales,
    r.borrowing,
    r.development_fund,
    r.special_accounts,
    -- Total
    r.total as total_revenue,
    -- Expenditures
    e.total as expenditure_total,
    e.current_exp,
    e.capital_exp,
    e.unclassified,
    e.subsidy_spending,
    -- Balance
    b.surplus_deficit,
    b.status
FROM years y
LEFT JOIN revenues r ON y.year_id = r.year_id
LEFT JOIN expenditures e ON y.year_id = e.year_id
LEFT JOIN budget_balance b ON y.year_id = b.year_id
ORDER BY y.year_persian;

-- View for operational revenues only (consistent across all years)
CREATE OR REPLACE VIEW operational_revenues_view AS
SELECT
    y.year_persian,
    y.year_gregorian,
    r.operational_revenue,
    r.tax_total,
    r.oil_gas,
    r.other,
    ROUND((r.tax_total / NULLIF(r.operational_revenue, 0)) * 100, 2) as tax_percentage,
    ROUND((r.oil_gas / NULLIF(r.operational_revenue, 0)) * 100, 2) as oil_percentage,
    ROUND((r.other / NULLIF(r.operational_revenue, 0)) * 100, 2) as other_percentage
FROM years y
JOIN revenues r ON y.year_id = r.year_id
ORDER BY y.year_persian;

-- =====================================================
-- UPDATE DATA QUALITY NOTES
-- =====================================================

DELETE FROM data_quality_notes WHERE note_type = 'scope';

INSERT INTO data_quality_notes (table_name, year_persian, note_type, note) VALUES
('revenues', NULL, 'scope', 'Years 1395-1403: Contains operational revenues only (~51% of منابع عمومی). Missing: asset sales, borrowing, development fund withdrawals.'),
('revenues', 1404, 'scope', 'Year 1404: Contains full منابع عمومی (general resources). Operational revenues only.'),
('revenues', NULL, 'info', 'operational_revenue = tax_total + oil_gas + other (consistent across all years)'),
('revenues', NULL, 'info', 'For years 1395-1403: total = operational_revenue (asset_sales, borrowing = 0)'),
('revenues', NULL, 'info', 'To get full منابع عمومی: multiply operational_revenue by ~1.95 (approximate)');

-- =====================================================
-- GRANT PERMISSIONS (if needed)
-- =====================================================
-- GRANT SELECT ON budget_scope_notes TO budget_user;
-- GRANT SELECT ON budget_overview_detailed TO budget_user;
-- GRANT SELECT ON operational_revenues_view TO budget_user;
