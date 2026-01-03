-- Update 1404 state companies expenditure breakdown
-- Values converted from thousand billion rials to billion rials (×1000)
-- Source: Corrected budget law state companies classification

UPDATE expenditures
SET
    -- State Companies Operating Costs: 48.594 * 1000 = 48,594,000
    state_comp_current_exp = 48594000.000,
    
    -- State Companies Taxes: 3.734 * 1000 = 3,734,000
    state_comp_taxes = 3734000.000,
    
    -- State Companies Dividends: 7.092 * 1000 = 7,092,000
    state_comp_dividends = 7092000.000,
    
    -- State Companies Capital Expenditure: 12.308 * 1000 = 12,308,000
    state_comp_capital_exp = 12308000.000,
    
    -- State Companies Loan Repayment: 2.334 * 1000 = 2,334,000
    -- Split between domestic and foreign (assume 50/50 for now)
    state_comp_domestic_repay = 1167000.000,
    state_comp_foreign_repay = 1167000.000,
    
    -- State Companies Asset Accumulation: 0.532 * 1000 = 532,000
    state_comp_current_assets_increase = 532000.000,
    
    -- Recalculate totals
    state_comp_exp_total = 74594000.000,  -- Sum of all above: 48.594 + 3.734 + 7.092 + 12.308 + 2.334 + 0.532 = 74.594 * 1000
    
    updated_at = CURRENT_TIMESTAMP
WHERE year_id = 10;

-- Verification query
SELECT 
    'STATE COMPANIES VALIDATION' as check_type,
    state_comp_current_exp as "Operating Costs",
    state_comp_taxes as "Taxes",
    state_comp_dividends as "Dividends",
    state_comp_capital_exp as "Capital Expenditure",
    (state_comp_domestic_repay + state_comp_foreign_repay) as "Loan Repayment",
    state_comp_current_assets_increase as "Asset Accumulation",
    state_comp_exp_total as "Total Expenditure",
    (state_comp_current_exp + state_comp_taxes + state_comp_dividends + state_comp_capital_exp + 
     state_comp_domestic_repay + state_comp_foreign_repay + state_comp_current_assets_increase) as "Sum Check"
FROM expenditures
WHERE year_id = 10;

-- Expected Total: 74,594,000 (74.594T)
