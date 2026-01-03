-- Update 1404 state companies - remove taxes and dividends
-- Keep only: Operating Costs, Capital Expenditure, Loan Repayment, Asset Accumulation
-- Total: 63.77T (matches official budget law)

UPDATE expenditures
SET
    -- State Companies breakdown (4 categories only)
    state_comp_current_exp = 48590000.000,           -- Operating Costs: 48.59 * 1000
    state_comp_capital_exp = 12310000.000,           -- Capital Expenditure: 12.31 * 1000
    state_comp_domestic_repay = 1165000.000,         -- Loan Repayment (domestic): 2.33/2 * 1000
    state_comp_foreign_repay = 1165000.000,          -- Loan Repayment (foreign): 2.33/2 * 1000
    state_comp_current_assets_increase = 540000.000, -- Asset Accumulation: 0.54 * 1000
    
    -- Remove taxes and dividends (set to 0)
    state_comp_taxes = 0,
    state_comp_dividends = 0,
    state_comp_special_dividend = 0,
    
    -- Update totals
    state_comp_exp_total = 63770000.000,             -- Total: 63.77 * 1000
    state_comp_net = 63770000.000,
    
    updated_at = CURRENT_TIMESTAMP
WHERE year_id = 10;

-- Verification
SELECT 
    'STATE COMPANIES UPDATED' as check_type,
    state_comp_current_exp as "Operating Costs",
    state_comp_capital_exp as "Capital Expenditure",
    (state_comp_domestic_repay + state_comp_foreign_repay) as "Loan Repayment",
    state_comp_current_assets_increase as "Asset Accumulation",
    state_comp_exp_total as "Total",
    (state_comp_current_exp + state_comp_capital_exp + state_comp_domestic_repay + 
     state_comp_foreign_repay + state_comp_current_assets_increase) as "Sum Check"
FROM expenditures
WHERE year_id = 10;

-- Expected: 63,770,000 (63.77T)
