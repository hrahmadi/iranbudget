-- =====================================================
-- IRAN BUDGET DATABASE - EXAMPLE QUERIES
-- =====================================================
--
-- These queries demonstrate how to extract insights from
-- the Iranian budget data (1395-1404 / 2016-2025).
--
-- All monetary values are in BILLION RIALS.
--
-- Run these queries against your PostgreSQL database
-- after importing the data with import_data.py
--
-- =====================================================

-- =====================================================
-- BASIC OVERVIEW QUERIES
-- =====================================================

-- 1. Complete budget overview for all years
SELECT * FROM budget_overview ORDER BY year_persian;

-- 2. Show only years with surplus
SELECT year_persian, year_gregorian, surplus_deficit, status
FROM budget_overview
WHERE status = 'surplus'
ORDER BY year_persian;

-- 3. Show only deficit years
SELECT year_persian, year_gregorian, surplus_deficit, status
FROM budget_overview
WHERE status = 'deficit'
ORDER BY year_persian DESC;

-- 4. Quick summary statistics
SELECT
    COUNT(*) as total_years,
    SUM(CASE WHEN status = 'surplus' THEN 1 ELSE 0 END) as surplus_years,
    SUM(CASE WHEN status = 'deficit' THEN 1 ELSE 0 END) as deficit_years,
    ROUND(AVG(surplus_deficit), 2) as avg_balance,
    ROUND(MIN(surplus_deficit), 2) as worst_deficit,
    ROUND(MAX(surplus_deficit), 2) as best_surplus
FROM budget_balance b
JOIN years y ON b.year_id = y.year_id;

-- =====================================================
-- REVENUE ANALYSIS QUERIES
-- =====================================================

-- 5. Revenue trends - total and by type
SELECT * FROM revenue_trends ORDER BY year_persian;

-- 6. Oil vs Tax revenue comparison
SELECT
    year_persian,
    total_revenue,
    oil_gas,
    tax_total,
    ROUND((oil_gas / total_revenue) * 100, 2) as oil_percentage,
    ROUND((tax_total / total_revenue) * 100, 2) as tax_percentage
FROM revenue_trends
ORDER BY year_persian;

-- 7. Which years had highest oil dependency?
SELECT
    year_persian,
    oil_gas_percentage,
    total_revenue
FROM revenue_trends
ORDER BY oil_gas_percentage DESC
LIMIT 5;

-- 8. Tax breakdown by type over time
SELECT
    year_persian,
    tax_corporate,
    tax_individual,
    tax_payroll,
    tax_social_security,
    (tax_corporate + tax_individual + tax_payroll + tax_social_security) as tax_total_check
FROM revenues r
JOIN years y ON r.year_id = y.year_id
ORDER BY year_persian;

-- 9. Years with highest corporate tax revenue
SELECT
    year_persian,
    tax_corporate,
    total_revenue,
    ROUND((tax_corporate / total_revenue) * 100, 2) as corporate_tax_percentage
FROM revenue_trends
ORDER BY tax_corporate DESC
LIMIT 5;

-- =====================================================
-- EXPENDITURE ANALYSIS QUERIES
-- =====================================================

-- 10. Expenditure breakdown over time
SELECT * FROM expenditure_analysis ORDER BY year_persian;

-- 11. Current vs Capital expenditure trends
SELECT
    year_persian,
    current_exp,
    capital_exp,
    current_percentage,
    capital_percentage,
    CASE
        WHEN current_percentage > capital_percentage THEN 'Current-Heavy'
        WHEN capital_percentage > current_percentage THEN 'Capital-Heavy'
        ELSE 'Balanced'
    END as spending_focus
FROM expenditure_analysis
ORDER BY year_persian;

-- 12. Subsidy spending as percentage of total expenditure
SELECT
    year_persian,
    subsidy_spending,
    total_expenditure,
    subsidy_percentage,
    ROUND(subsidy_spending / total_expenditure * 100, 2) as subsidy_pct
FROM expenditure_analysis
ORDER BY subsidy_percentage DESC;

-- 13. Years with highest subsidy spending
SELECT
    year_persian,
    subsidy_spending,
    total_expenditure
FROM expenditures e
JOIN years y ON e.year_id = y.year_id
ORDER BY subsidy_spending DESC
LIMIT 5;

-- =====================================================
-- BALANCE & DEFICIT ANALYSIS
-- =====================================================

-- 14. Balance analysis for all years
SELECT * FROM balance_analysis ORDER BY year_persian;

-- 15. Deficit trends - magnitude and ranking
SELECT
    year_persian,
    surplus_deficit,
    deficit_magnitude,
    RANK() OVER (ORDER BY deficit_magnitude DESC) as deficit_rank
FROM balance_analysis
WHERE status = 'deficit'
ORDER BY deficit_magnitude DESC;

-- 16. Average deficit by period
SELECT
    CASE
        WHEN year_persian BETWEEN 1395 AND 1399 THEN '1395-1399'
        WHEN year_persian BETWEEN 1400 AND 1404 THEN '1400-1404'
    END as period,
    COUNT(*) as years,
    ROUND(AVG(surplus_deficit), 2) as avg_balance,
    ROUND(MIN(surplus_deficit), 2) as worst_year,
    ROUND(MAX(surplus_deficit), 2) as best_year
FROM budget_balance b
JOIN years y ON b.year_id = y.year_id
GROUP BY CASE
    WHEN year_persian BETWEEN 1395 AND 1399 THEN '1395-1399'
    WHEN year_persian BETWEEN 1400 AND 1404 THEN '1400-1404'
END;

-- =====================================================
-- YEAR-OVER-YEAR GROWTH ANALYSIS
-- =====================================================

-- 17. Year-over-year growth rates
SELECT * FROM yoy_growth ORDER BY year_persian;

-- 18. Revenue growth ranking
SELECT
    year_persian,
    revenue,
    prev_revenue,
    revenue_growth_pct,
    RANK() OVER (ORDER BY revenue_growth_pct DESC) as growth_rank
FROM yoy_growth
WHERE revenue_growth_pct IS NOT NULL
ORDER BY revenue_growth_pct DESC;

-- 19. Expenditure growth vs Revenue growth
SELECT
    year_persian,
    revenue_growth_pct,
    expenditure_growth_pct,
    (expenditure_growth_pct - revenue_growth_pct) as growth_difference
FROM yoy_growth
WHERE revenue_growth_pct IS NOT NULL AND expenditure_growth_pct IS NOT NULL
ORDER BY year_persian;

-- =====================================================
-- COMPARATIVE ANALYSIS QUERIES
-- =====================================================

-- 20. Compare 1399 (pre-COVID) vs 1400 (COVID year)
SELECT
    y.year_persian,
    '1399 vs 1400' as comparison,
    r.total as revenue,
    e.total as expenditure,
    b.surplus_deficit,
    b.status
FROM years y
LEFT JOIN revenues r ON y.year_id = r.year_id
LEFT JOIN expenditures e ON y.year_id = e.year_id
LEFT JOIN budget_balance b ON y.year_id = b.year_id
WHERE y.year_persian IN (1399, 1400)
ORDER BY y.year_persian;

-- 21. Oil price impact analysis - compare oil-dependent years
WITH oil_impact AS (
    SELECT
        year_persian,
        oil_gas,
        total_revenue,
        ROUND((oil_gas / total_revenue) * 100, 2) as oil_dependency,
        surplus_deficit
    FROM budget_overview
)
SELECT
    CASE
        WHEN oil_dependency >= 50 THEN 'High Oil (>50%)'
        WHEN oil_dependency >= 30 THEN 'Medium Oil (30-50%)'
        ELSE 'Low Oil (<30%)'
    END as oil_category,
    COUNT(*) as years,
    ROUND(AVG(oil_dependency), 2) as avg_oil_pct,
    ROUND(AVG(surplus_deficit), 2) as avg_balance
FROM oil_impact
GROUP BY CASE
    WHEN oil_dependency >= 50 THEN 'High Oil (>50%)'
    WHEN oil_dependency >= 30 THEN 'Medium Oil (30-50%)'
    ELSE 'Low Oil (<30%)'
END;

-- 22. Tax efficiency analysis
SELECT
    year_persian,
    tax_total,
    total_revenue,
    ROUND((tax_total / total_revenue) * 100, 2) as tax_ratio,
    surplus_deficit,
    CASE
        WHEN surplus_deficit > 0 THEN 'Surplus'
        ELSE 'Deficit'
    END as fiscal_status
FROM budget_overview
ORDER BY tax_ratio DESC;

-- =====================================================
-- DASHBOARD-READY QUERIES
-- =====================================================

-- 23. Monthly dashboard data (aggregated by year for simplicity)
SELECT
    year_persian,
    revenue_total,
    expenditure_total,
    surplus_deficit,
    oil_gas,
    tax_total,
    subsidy_spending,
    status
FROM budget_overview
ORDER BY year_persian DESC;

-- 24. Trend analysis for charts
SELECT
    year_persian,
    revenue_total,
    oil_gas as oil_revenue,
    tax_total as tax_revenue,
    expenditure_total,
    surplus_deficit,
    subsidy_spending
FROM budget_overview
ORDER BY year_persian;

-- 25. Key performance indicators (KPIs)
WITH kpis AS (
    SELECT
        COUNT(*) as total_years,
        AVG(revenue_total) as avg_revenue,
        AVG(expenditure_total) as avg_expenditure,
        AVG(surplus_deficit) as avg_balance,
        SUM(CASE WHEN status = 'surplus' THEN 1 ELSE 0 END) as surplus_count,
        SUM(CASE WHEN status = 'deficit' THEN 1 ELSE 0 END) as deficit_count
    FROM budget_overview
)
SELECT
    total_years,
    ROUND(avg_revenue, 2) as avg_annual_revenue_billion_rials,
    ROUND(avg_expenditure, 2) as avg_annual_expenditure_billion_rials,
    ROUND(avg_balance, 2) as avg_annual_balance_billion_rials,
    surplus_count,
    deficit_count,
    ROUND((surplus_count::decimal / total_years) * 100, 1) as surplus_percentage
FROM kpis;

-- =====================================================
-- DATA QUALITY CHECKS
-- =====================================================

-- 26. Check for data completeness
SELECT
    'Years' as table_name, COUNT(*) as record_count FROM years
UNION ALL
SELECT
    'Revenues' as table_name, COUNT(*) as record_count FROM revenues
UNION ALL
SELECT
    'Expenditures' as table_name, COUNT(*) as record_count FROM expenditures
UNION ALL
SELECT
    'Budget Balance' as table_name, COUNT(*) as record_count FROM budget_balance;

-- 27. Check for NULL values in critical fields
SELECT
    y.year_persian,
    CASE WHEN r.total IS NULL THEN 'Missing Revenue' ELSE 'OK' END as revenue_status,
    CASE WHEN e.total IS NULL THEN 'Missing Expenditure' ELSE 'OK' END as expenditure_status,
    CASE WHEN b.surplus_deficit IS NULL THEN 'Missing Balance' ELSE 'OK' END as balance_status
FROM years y
LEFT JOIN revenues r ON y.year_id = r.year_id
LEFT JOIN expenditures e ON y.year_id = e.year_id
LEFT JOIN budget_balance b ON y.year_id = b.year_id
ORDER BY y.year_persian;

-- 28. View data quality notes
SELECT * FROM data_quality_notes ORDER BY created_at DESC;

-- =====================================================
-- EXPORT QUERIES (for CSV/Excel export)
-- =====================================================

-- 29. Export complete dataset
SELECT
    y.year_persian,
    y.year_gregorian,
    y.currency,
    y.data_source,
    r.total as revenue_total,
    r.tax_total,
    r.oil_gas,
    r.other as revenue_other,
    r.tax_corporate,
    r.tax_individual,
    r.tax_payroll,
    r.tax_social_security,
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

-- =====================================================
-- ADVANCED ANALYTICS QUERIES
-- =====================================================

-- 30. Correlation analysis setup (revenue vs expenditure growth)
WITH growth_data AS (
    SELECT
        year_persian,
        revenue_growth_pct,
        expenditure_growth_pct
    FROM yoy_growth
    WHERE revenue_growth_pct IS NOT NULL AND expenditure_growth_pct IS NOT NULL
)
SELECT
    COUNT(*) as data_points,
    ROUND(AVG(revenue_growth_pct), 2) as avg_revenue_growth,
    ROUND(AVG(expenditure_growth_pct), 2) as avg_expenditure_growth,
    ROUND(STDDEV(revenue_growth_pct), 2) as revenue_volatility,
    ROUND(STDDEV(expenditure_growth_pct), 2) as expenditure_volatility
FROM growth_data;

-- 31. Fiscal policy effectiveness (deficit reduction years)
SELECT
    year_persian,
    surplus_deficit,
    prev_year_deficit,
    (prev_year_deficit - surplus_deficit) as deficit_reduction
FROM (
    SELECT
        year_persian,
        surplus_deficit,
        LAG(surplus_deficit) OVER (ORDER BY year_persian) as prev_year_deficit
    FROM budget_balance b
    JOIN years y ON b.year_id = y.year_id
) deficit_trend
WHERE surplus_deficit < 0 AND prev_year_deficit < 0
ORDER BY deficit_reduction DESC;

-- =====================================================
-- USEFUL FOR DEBUGGING/VALIDATION
-- =====================================================

-- 32. Quick data validation - check totals match
SELECT
    y.year_persian,
    r.total + b.surplus_deficit as revenue_plus_deficit,
    e.total as expenditure_total,
    CASE
        WHEN ABS((r.total + b.surplus_deficit) - e.total) < 0.01 THEN '✓ Balanced'
        ELSE '✗ Mismatch'
    END as validation_status
FROM years y
JOIN revenues r ON y.year_id = r.year_id
JOIN expenditures e ON y.year_id = e.year_id
JOIN budget_balance b ON y.year_id = b.year_id
ORDER BY y.year_persian;
