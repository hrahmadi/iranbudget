-- Functional expenditure data for 1404
-- Values converted from thousand billion rials to billion rials (x1000)
-- Source: Budget Law functional classification

-- Insert year 1404 functional expenditures
INSERT INTO functional_expenditures (
    year_id,
    total,
    
    -- Major functions (Level 2)
    defense,
    education,
    health,
    economic_affairs,  -- Infrastructure & Transport + Energy & Environment
    general_public_services,  -- Governance & Administration + Financial Obligations
    recreation_culture,  -- Culture Religion & Media
    social_protection,  -- Part of Health & Welfare
    
    -- Sub-functions (Level 3)
    def_military,
    edu_primary,
    edu_secondary,
    edu_tertiary,
    health_hospital,
    health_public,
    econ_transport,
    econ_fuel_energy,
    gps_executive_legislative,
    gps_public_debt
) VALUES (
    10,  -- year_id for 1404
    112795309.000,  -- Total Budget (112.795309 * 1000)
    
    -- Major functions
    10230000.000,   -- Defense & Security (10.23 * 1000)
    5380000.000,    -- Education & Research (5.38 * 1000)
    18660000.000,   -- Health & Welfare (18.66 * 1000) - will split between health and social protection
    8120000.000,    -- Economic Affairs combined (6.01 + 2.11) * 1000
    9750000.000,    -- General Public Services combined (4.75 + 5.00) * 1000
    690000.000,     -- Culture Religion & Media (0.69 * 1000)
    NULL,           -- Social Protection - to be split from health_welfare
    
    -- Sub-functions (estimated breakdowns - awaiting detailed data)
    10230000.000,   -- Military defense (all of defense for now)
    NULL,           -- Primary education
    NULL,           -- Secondary education  
    NULL,           -- Tertiary education
    NULL,           -- Hospital services
    NULL,           -- Public health
    6010000.000,    -- Infrastructure & Transport (6.01 * 1000)
    2110000.000,    -- Energy & Environment (2.11 * 1000)
    4750000.000,    -- Governance & Administration (4.75 * 1000)
    5000000.000     -- Financial Obligations & Debt (5.00 * 1000)
)
ON CONFLICT (year_id) 
DO UPDATE SET
    total = EXCLUDED.total,
    defense = EXCLUDED.defense,
    education = EXCLUDED.education,
    health = EXCLUDED.health,
    economic_affairs = EXCLUDED.economic_affairs,
    general_public_services = EXCLUDED.general_public_services,
    recreation_culture = EXCLUDED.recreation_culture,
    def_military = EXCLUDED.def_military,
    econ_transport = EXCLUDED.econ_transport,
    econ_fuel_energy = EXCLUDED.econ_fuel_energy,
    gps_executive_legislative = EXCLUDED.gps_executive_legislative,
    gps_public_debt = EXCLUDED.gps_public_debt,
    updated_at = CURRENT_TIMESTAMP;

-- Verification query
SELECT 
    'FUNCTIONAL EXPENDITURES VALIDATION' as check_type,
    total,
    defense + education + health + economic_affairs + general_public_services + recreation_culture as sum_major_functions,
    total - (defense + education + health + economic_affairs + general_public_services + recreation_culture) as difference
FROM functional_expenditures
WHERE year_id = 10;

-- Notes on the data:
-- 1. Public Budget: 53,844,550 billion rials (53.84455 * 1000)
-- 2. State-Owned Companies: 63,773,759 billion rials (63.773759 * 1000)
-- 3. Double-Counting Adjustment: -4,823,000 billion rials (handled in visualization, not stored here)
-- 4. Major functions sum to Public Budget amount
-- 5. State companies are handled separately in economic classification
-- 6. Detailed sub-function breakdowns need source document data
