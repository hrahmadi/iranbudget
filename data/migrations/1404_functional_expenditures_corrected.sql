-- Update 1404 functional expenditures with corrected values
-- Values converted from thousand billion rials to billion rials (×1000)
-- Source: Corrected budget law functional classification

UPDATE functional_expenditures
SET
    -- Public Budget categories (7 categories)
    defense = 7850000.000,                    -- Defense & Security: 7.850 * 1000
    education = 10200000.000,                 -- Education & Research: 10.200 * 1000
    health = 15300000.000,                    -- Health & Welfare: 15.300 * 1000
    economic_affairs = 6900000.000,           -- Infrastructure: 6.900 * 1000
    general_public_services = 11495000.000,   -- Governance + Financial Obligations: 5.400 + 6.095 = 11.495 * 1000
    recreation_culture = 2100000.000,         -- Culture: 2.100 * 1000
    
    -- Sub-functions for Public Services
    gps_executive_legislative = 5400000.000,  -- Governance: 5.400 * 1000
    gps_public_debt = 6095000.000,            -- Financial Obligations: 6.095 * 1000
    
    -- State Companies categories (6 categories) - stored in economic classification table
    -- Note: These will be handled separately in expenditures table
    
    updated_at = CURRENT_TIMESTAMP
WHERE year_id = 10;

-- Verification query
SELECT 
    'PUBLIC BUDGET VALIDATION' as check_type,
    defense as "Defense & Security",
    education as "Education & Research", 
    health as "Health & Welfare",
    economic_affairs as "Infrastructure",
    general_public_services as "Governance + Financial",
    recreation_culture as "Culture",
    (defense + education + health + economic_affairs + general_public_services + recreation_culture) as "Public Budget Total"
FROM functional_expenditures
WHERE year_id = 10;

-- Expected Public Budget Total: 55,845,000 (55.845T)
-- State Companies Total: 74,594,000 (74.594T) - handled in expenditures table
