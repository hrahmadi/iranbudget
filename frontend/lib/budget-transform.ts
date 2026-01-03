import { FARSI_LABELS } from './labels';
import { SankeyBuilder } from './sankey-builder';

export interface BudgetData {
  year_persian: number;
  year_gregorian: string;
  revenue_total: string;
  operational_revenue: string;
  special_accounts: string;
  state_comp_revenue_total: string;
  state_comp_revenues: string;
  state_comp_current_credits: string;
  state_comp_capital_credits: string;
  state_comp_domestic_loans: string;
  state_comp_foreign_loans: string;
  state_comp_current_assets: string;
  state_comp_other_receipts: string;
  tax_total: string;
  tax_corporate: string;
  tax_individual: string;
  tax_vat_sales?: string;
  tax_wealth?: string;
  tax_import_duties?: string;
  oil_gas: string;
  oil_exports?: string;
  gas_condensate?: string;
  other?: string;
  ministry_revenue?: string;
  expenditure_total: string;
  current_exp: string;
  capital_exp: string;
  subsidy_spending: string;
  state_comp_net: string;
  state_comp_current_exp: string;
  state_comp_capital_exp: string;
  state_comp_domestic_repay?: string;
  state_comp_foreign_repay?: string;
  state_comp_current_assets_increase?: string;
  // Functional expenditures
  defense?: string;
  education?: string;
  health?: string;
  economic_affairs?: string;
  general_public_services?: string;
  recreation_culture?: string;
  social_protection?: string;
  def_military?: string;
  econ_transport?: string;
  econ_fuel_energy?: string;
  gps_executive_legislative?: string;
  gps_public_debt?: string;
  surplus_deficit: string;
  status: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  revenueTotal: number;
  expenditureTotal: number;
}

export interface SankeyNode {
  id: string;
  label: string;
  value: number;
  color: string;
  x?: number;
  y?: number;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color: string;
}

function toTrillions(value: string | number): number {
  return parseFloat(String(value)) / 1_000_000;
}

export function transformToHierarchicalSankey(
  data: BudgetData,
  language: 'en' | 'fa' = 'en',
  expenditureView: 'economic' | 'functional' = 'economic'
): SankeyData {
  const T = toTrillions;
  const year = data.year_persian;
  const builder = new SankeyBuilder();
  
  // Helper for labels
  const label = (en: string) => language === 'fa' ? (FARSI_LABELS[en] || en) : en;
  
  // Convert values
  const revenueTotal = T(data.revenue_total);
  const expenditureTotal = T(data.expenditure_total);
  
  // Colors
  const colors = {
    revenue1: '#1E5F8C',
    revenue2: '#2A7BA8',
    revenue3: '#3D9BB8',
    revenue4: '#5AB8CC',
    revenue5: '#6EC9D4',
    revenueCenter: '#7C3F8C', // Purple shade matching color scheme
    spending1: '#D6006E',
    spending2: '#BD0060',
    spending3: '#A4004D',
    spending4: '#8B003A',
    spendingCenter: '#FF69B4',
  };
  
  // Parse revenue data
  const taxCorporate = T(data.tax_corporate);
  const taxIndividual = T(data.tax_individual);
  const taxTotal = T(data.tax_total);
  const oilGas = T(data.oil_gas);
  const operationalRevenue = T(data.operational_revenue || 0);
  const specialAccounts = T(data.special_accounts || 0);
  const ministryRevenue = T(data.ministry_revenue || 0);
  const otherRevenue = T(data.other || 0);
  const stateCompanies = T(data.state_comp_revenue_total || 0);
  
  // Tax breakdown - use actual values if available, else estimate
  const taxVatSales = data.tax_vat_sales ? T(data.tax_vat_sales) : null;
  const taxWealth = data.tax_wealth ? T(data.tax_wealth) : null;
  const taxImportDuties = data.tax_import_duties ? T(data.tax_import_duties) : null;
  
  let adjustedVat: number, importDuties: number, wealthTax: number, otherTaxes: number;
  
  if (taxVatSales !== null && taxWealth !== null && taxImportDuties !== null) {
    // Use actual values from database
    adjustedVat = taxVatSales;
    importDuties = taxImportDuties;
    wealthTax = taxWealth;
    otherTaxes = Math.max(0, taxTotal - taxCorporate - taxIndividual - adjustedVat - importDuties - wealthTax);
  } else {
    // Fallback to estimation for older years
    const vatSales = Math.max(0, taxTotal - taxCorporate - taxIndividual);
    importDuties = vatSales * 0.3;
    otherTaxes = vatSales * 0.2;
    adjustedVat = vatSales - importDuties - otherTaxes;
    wealthTax = 0;
  }
  
  // Oil & Gas breakdown - use actual values if available, else estimate
  let oilExports: number, gasCondensate: number;
  if (data.oil_exports && data.gas_condensate) {
    oilExports = T(data.oil_exports);
    gasCondensate = T(data.gas_condensate);
  } else {
    oilExports = oilGas * 0.85;
    gasCondensate = oilGas * 0.15;
  }
  
  // State company breakdown
  const stateRevenues = T(data.state_comp_revenues || 0);
  const stateCurrentCredits = T(data.state_comp_current_credits || 0);
  const stateCapitalCredits = T(data.state_comp_capital_credits || 0);
  const stateDomesticLoans = T(data.state_comp_domestic_loans || 0);
  const stateForeignLoans = T(data.state_comp_foreign_loans || 0);
  const stateCurrentAssets = T(data.state_comp_current_assets || 0);
  const stateOtherReceipts = T(data.state_comp_other_receipts || 0);
  
  const hasStateBreakdown = stateRevenues > 0;
  
  // Verify state company breakdown sums correctly
  const stateDetailSum = stateRevenues + stateCurrentCredits + stateCapitalCredits 
    + stateDomesticLoans + stateForeignLoans + stateCurrentAssets + stateOtherReceipts;
    
  if (hasStateBreakdown) {
    console.log('=== STATE COMPANY BREAKDOWN ===');
    console.log('Total (state-company-revenue node):', stateCompanies.toFixed(2));
    console.log('Detail sum:', stateDetailSum.toFixed(2));
    console.log('  - Company Revenues:', stateRevenues.toFixed(2));
    console.log('  - Credits:', (stateCurrentCredits + stateCapitalCredits).toFixed(2));
    console.log('  - Domestic Loans:', stateDomesticLoans.toFixed(2));
    console.log('  - Foreign Loans:', stateForeignLoans.toFixed(2));
    console.log('  - Asset Sales:', stateCurrentAssets.toFixed(2));
    console.log('  - Other Receipts:', stateOtherReceipts.toFixed(2));
    console.log('Match:', Math.abs(stateDetailSum - stateCompanies) < 0.01 ? 'YES ✓' : 'NO ✗ MISMATCH!');
  }
  
  // Use detail sum if breakdown exists (ensures children sum to parent)
  const stateCompaniesActual = hasStateBreakdown ? stateDetailSum : stateCompanies;
  
  // Other revenue breakdown - estimate if not provided
  const feesCharges = otherRevenue * 0.60;
  const otherIncome = otherRevenue * 0.40;
  
  // Recalculate revenue total using corrected state companies value and actual data
  const revenueTotalCorrected = taxTotal + oilGas + stateCompaniesActual + otherRevenue + specialAccounts + (ministryRevenue || 0);
  
  // Parse expenditure data
  const currentExp = T(data.current_exp || 0);
  const capitalExp = T(data.capital_exp || 0);
  const subsidySpending = T(data.subsidy_spending || 0);
  const stateCompExp = T(data.state_comp_net || 0);
  const stateCompCurrent = T(data.state_comp_current_exp || 0);
  const stateCompCapital = T(data.state_comp_capital_exp || 0);
  
  let govPersonnel: number, govDevelopment: number, govSupport: number, govOther: number;
  let statePersonnel: number, stateDevelopment: number, stateOther: number;
  
  if (year <= 1399) {
    // Aggregate years
    const govTotal = currentExp;
    govPersonnel = govTotal * 0.45;
    govDevelopment = govTotal * 0.20;
    govSupport = govTotal * 0.10;
    govOther = govTotal * 0.25;
    
    statePersonnel = stateCompExp * 0.30;
    stateDevelopment = stateCompExp * 0.25;
    stateOther = stateCompExp * 0.45;
  } else {
    // Detailed years
    govPersonnel = currentExp;
    govDevelopment = capitalExp;
    govSupport = subsidySpending;
    
    const govComponents = govPersonnel + govDevelopment + govSupport;
    govOther = Math.max(0, operationalRevenue + specialAccounts + (ministryRevenue || 0) + otherRevenue - govComponents);
    
    statePersonnel = stateCompCurrent;
    stateDevelopment = stateCompCapital;
    stateOther = Math.max(0, stateCompExp - stateCompCurrent - stateCompCapital);
  }
  
  // Combined categories
  const personnelCosts = govPersonnel + statePersonnel;
  const developmentProjects = govDevelopment + stateDevelopment;
  const supportPrograms = govSupport;
  const debtService = govOther + stateOther;
  
  // Detailed spending
  const employeeSalaries = personnelCosts * 0.31;
  const retireePensions = personnelCosts * 0.50;
  const benefits = personnelCosts * 0.19;
  
  const infrastructure = developmentProjects * 0.57;
  const technology = developmentProjects * 0.21;
  const regionalDev = developmentProjects * 0.22;
  
  const bondRepayments = debtService * 0.77;
  const debtPayments = debtService * 0.23;
  
  const cashSubsidies = supportPrograms * 0.47;
  const energySubsidies = supportPrograms * 0.28;
  const foodEssentials = supportPrograms * 0.25;
  
  // === BUILD NODES USING SANKEY BUILDER ===
  
  // LEVEL 0 & 1: ALL Revenue Details in ONE column (x=0.08 - compressed for more expenditure space)
  // Y values control stacking order: lower Y = stacked first = appears higher
  const detailX = 0.08;
  
  // Government revenue details (stacked first - top section)
  builder.addNode('corporate-tax', label('Corporate Tax'), taxCorporate, colors.revenue1, detailX, 0.10);
  builder.addNode('individual-tax', label('Individual Income Tax'), taxIndividual, colors.revenue1, detailX, 0.15);
  builder.addNode('wealth-tax', label('Wealth Tax'), wealthTax, colors.revenue2, detailX, 0.18);
  builder.addNode('vat', label('VAT & Sales Tax'), adjustedVat, colors.revenue2, detailX, 0.20);
  builder.addNode('import-duties', label('Import Duties'), importDuties, colors.revenue2, detailX, 0.25);
  builder.addNode('other-tax', label('Other Taxes'), otherTaxes, colors.revenue2, detailX, 0.30);
  builder.addNode('oil-exports', label('Oil Exports'), oilExports, colors.revenue3, detailX, 0.35);
  builder.addNode('gas-exports', label('Gas & Condensate'), gasCondensate, colors.revenue3, detailX, 0.40);
  
  // State company details (stacked next - middle section, LARGE values)
  if (hasStateBreakdown) {
    builder.addNode('state-operations', label('Company Operations'), stateRevenues, colors.revenue1, detailX, 0.50);
    builder.addNode('state-credits', label('Government Credits'), stateCurrentCredits + stateCapitalCredits, colors.revenue2, detailX, 0.55);
    builder.addNode('state-loans-domestic', label('Domestic Loans'), stateDomesticLoans, colors.revenue2, detailX, 0.60);
    builder.addNode('state-loans-foreign', label('Foreign Loans'), stateForeignLoans, colors.revenue3, detailX, 0.65);
    builder.addNode('state-assets', label('Asset Sales'), stateCurrentAssets, colors.revenue4, detailX, 0.70);
    builder.addNode('state-other', label('Other Receipts'), stateOtherReceipts, colors.revenue5, detailX, 0.75);
  } else {
    // For years without breakdown, add single placeholder node for visual consistency
    builder.addNode('state-operations', label('State Company Revenue'), stateCompaniesActual, colors.revenue1, detailX, 0.60);
  }
  
  // Other government revenue details (stacked last - bottom section)
  builder.addNode('fees-charges', label('Fees & Charges'), feesCharges, colors.revenue4, detailX, 0.80);
  builder.addNode('other-income', label('Other Income'), otherIncome, colors.revenue4, detailX, 0.85);
  
  // LEVEL 2: Aggregated Revenue (x=0.30 - compressed)
  // Y values control sort order for stacking (lower Y = stacked first = appears higher)
  const aggX = 0.30;
  builder.addNode('tax-revenue', label('Tax Revenue'), taxTotal, colors.revenue2, aggX, 0.15);
  builder.addNode('oil-gas-revenue', label('Oil & Gas Revenue'), oilGas, colors.revenue3, aggX, 0.30);
  builder.addNode('other-revenue', label('Other Revenue'), otherRevenue, colors.revenue4, aggX, 0.65);
  if (ministryRevenue > 0) {
    builder.addNode('ministry-revenue', label('Ministry Revenue'), ministryRevenue, colors.revenue5, aggX, 0.75);
  }
  builder.addNode('special-revenue', label('Special Accounts'), specialAccounts, colors.revenue5, aggX, 0.80);
  builder.addNode('state-company-revenue', label('State Companies'), stateCompaniesActual, colors.revenue1, aggX, 0.55);
  
  // CENTER: Single center column (thicker, purple, with vertical label)
  const centerLabel = language === 'fa' ? 'کل بودجه' : 'Total Budget';
  builder.addNode('center-total', centerLabel, revenueTotalCorrected, colors.revenueCenter, 0.50, 0.50);
  
  // === EXPENDITURE SIDE ===
  // Switch between Economic and Functional views
  
  if (expenditureView === 'functional' && data.defense) {
    // FUNCTIONAL VIEW - 3 LEVELS
    // Level 1: Total Budget (center, x=0.50)
    // Level 2: Public Budget + State Companies (x=0.65)
    // Level 3: Category details (x=0.85)
    
    const funcDefense = T(data.defense || 0);
    const funcEducation = T(data.education || 0);
    const funcHealth = T(data.health || 0);
    const funcInfrastructure = T(data.economic_affairs || 0);
    const funcGovernance = T(data.gps_executive_legislative || 0);
    const funcFinancial = T(data.gps_public_debt || 0);
    const funcCulture = T(data.recreation_culture || 0);
    
    // Calculate Public Budget total
    const publicBudgetTotal = funcDefense + funcEducation + funcHealth + funcInfrastructure + funcGovernance + funcFinancial + funcCulture;
    
    // State companies breakdown
    const stateOperating = stateCompCurrent;
    const stateCapital = stateCompCapital;
    const stateLoanRepay = T((data.state_comp_domestic_repay || 0)) + T((data.state_comp_foreign_repay || 0));
    const stateAssetsExp = T(data.state_comp_current_assets_increase || 0);
    const stateCompaniesTotal = stateOperating + stateCapital + stateLoanRepay + stateAssetsExp;
    
    // LEVEL 2: Public Budget + State Companies (x=0.65)
    builder.addNode('public-budget', label('Public Budget'), publicBudgetTotal, colors.spending1, 0.65, 0.30);
    builder.addNode('state-companies-exp', label('State Companies'), stateCompaniesTotal, colors.spending4, 0.65, 0.70);
    
    // LEVEL 3: Public Budget Details (x=0.85)
    builder.addNode('func-defense', label('Defense & Security'), funcDefense, colors.spending1, 0.85, 0.08);
    builder.addNode('func-education', label('Education & Research'), funcEducation, colors.spending2, 0.85, 0.16);
    builder.addNode('func-health', label('Health & Welfare'), funcHealth, colors.spending3, 0.85, 0.24);
    builder.addNode('func-infrastructure', label('Infrastructure'), funcInfrastructure, colors.spending4, 0.85, 0.32);
    builder.addNode('func-governance', label('Governance'), funcGovernance, colors.spending1, 0.85, 0.40);
    builder.addNode('func-financial', label('Financial Obligations'), funcFinancial, colors.spending2, 0.85, 0.48);
    builder.addNode('func-culture', label('Culture'), funcCulture, colors.spending3, 0.85, 0.56);
    
    // LEVEL 3: State Companies Details (x=0.85)
    builder.addNode('state-exp-operating', label('Operating Costs'), stateOperating, colors.spending4, 0.85, 0.66);
    builder.addNode('state-exp-capital', label('Capital Expenditure'), stateCapital, colors.spending1, 0.85, 0.76);
    builder.addNode('state-exp-loans', label('Loan Repayment'), stateLoanRepay, colors.spending2, 0.85, 0.86);
    builder.addNode('state-exp-assets', label('Asset Accumulation'), stateAssetsExp, colors.spending3, 0.85, 0.96);
    
  } else {
    // ECONOMIC VIEW - Traditional classification
    // LEVEL 3: Main Spending (x=0.65 - more space for functional view)
    builder.addNode('personnel', label('Personnel Costs'), personnelCosts, colors.spending1, 0.65, 0.30);
    builder.addNode('development', label('Development Projects'), developmentProjects, colors.spending2, 0.65, 0.45);
    builder.addNode('debt-service', label('Debt Service'), debtService, colors.spending3, 0.65, 0.60);
    builder.addNode('support', label('Support Programs'), supportPrograms, colors.spending4, 0.65, 0.75);
    
    // LEVEL 4: Detailed Spending (x=0.92 - tighter to edge for more middle space)
    builder.addNode('employee-salaries', label('Employee Salaries'), employeeSalaries, colors.spending1, 0.92, 0.10);
    builder.addNode('retiree-pensions', label('Retiree Pensions'), retireePensions, colors.spending2, 0.92, 0.17);
    builder.addNode('benefits', label('Benefits'), benefits, colors.spending2, 0.92, 0.24);
    builder.addNode('infrastructure', label('Infrastructure'), infrastructure, colors.spending1, 0.92, 0.38);
    builder.addNode('technology', label('Technology'), technology, colors.spending2, 0.92, 0.45);
    builder.addNode('regional-dev', label('Regional Dev'), regionalDev, colors.spending3, 0.92, 0.52);
    builder.addNode('bond-repayments', label('Bond Repayments'), bondRepayments, colors.spending2, 0.92, 0.65);
    builder.addNode('debt-payments', label('Debt Payments'), debtPayments, colors.spending3, 0.92, 0.72);
    builder.addNode('cash-subsidies', label('Cash Subsidies'), cashSubsidies, colors.spending1, 0.92, 0.82);
    builder.addNode('energy-subsidies', label('Energy Subsidies'), energySubsidies, colors.spending2, 0.92, 0.89);
    builder.addNode('food-essentials', label('Food & Essentials'), foodEssentials, colors.spending3, 0.92, 0.96);
  }
  
  // === BUILD LINKS ===
  
  // State company details → State company aggregate
  if (hasStateBreakdown) {
    builder.addLink('state-operations', 'state-company-revenue', stateRevenues);
    builder.addLink('state-credits', 'state-company-revenue', stateCurrentCredits + stateCapitalCredits);
    builder.addLink('state-loans-domestic', 'state-company-revenue', stateDomesticLoans);
    builder.addLink('state-loans-foreign', 'state-company-revenue', stateForeignLoans);
    builder.addLink('state-assets', 'state-company-revenue', stateCurrentAssets);
    builder.addLink('state-other', 'state-company-revenue', stateOtherReceipts);
  } else {
    // For years without breakdown, link placeholder to aggregate
    builder.addLink('state-operations', 'state-company-revenue', stateCompaniesActual);
  }
  
  // Government details → Aggregates
  builder.addLink('corporate-tax', 'tax-revenue', taxCorporate);
  builder.addLink('individual-tax', 'tax-revenue', taxIndividual);
  if (wealthTax > 0) {
    builder.addLink('wealth-tax', 'tax-revenue', wealthTax);
  }
  builder.addLink('vat', 'tax-revenue', adjustedVat);
  builder.addLink('import-duties', 'tax-revenue', importDuties);
  if (otherTaxes > 0) {
    builder.addLink('other-tax', 'tax-revenue', otherTaxes);
  }
  
  builder.addLink('oil-exports', 'oil-gas-revenue', oilExports);
  builder.addLink('gas-exports', 'oil-gas-revenue', gasCondensate);
  
  builder.addLink('fees-charges', 'other-revenue', feesCharges);
  builder.addLink('other-income', 'other-revenue', otherIncome);
  
  // Aggregates → Center
  builder.addLink('tax-revenue', 'center-total', taxTotal);
  builder.addLink('oil-gas-revenue', 'center-total', oilGas);
  builder.addLink('state-company-revenue', 'center-total', stateCompaniesActual);
  builder.addLink('other-revenue', 'center-total', otherRevenue);
  if (ministryRevenue > 0) {
    builder.addLink('ministry-revenue', 'center-total', ministryRevenue);
  }
  builder.addLink('special-revenue', 'center-total', specialAccounts);
  
  // Center → Expenditure (Economic or Functional)
  if (expenditureView === 'functional' && data.defense) {
    // Functional view - 3 LEVELS
    const funcDefense = T(data.defense || 0);
    const funcEducation = T(data.education || 0);
    const funcHealth = T(data.health || 0);
    const funcInfrastructure = T(data.economic_affairs || 0);
    const funcGovernance = T(data.gps_executive_legislative || 0);
    const funcFinancial = T(data.gps_public_debt || 0);
    const funcCulture = T(data.recreation_culture || 0);
    const publicBudgetTotal = funcDefense + funcEducation + funcHealth + funcInfrastructure + funcGovernance + funcFinancial + funcCulture;
    
    const stateOperating = stateCompCurrent;
    const stateCapital = stateCompCapital;
    const stateLoanRepay = T((data.state_comp_domestic_repay || 0)) + T((data.state_comp_foreign_repay || 0));
    const stateAssetsExp = T(data.state_comp_current_assets_increase || 0);
    const stateCompaniesTotal = stateOperating + stateCapital + stateLoanRepay + stateAssetsExp;
    
    // Level 1 → Level 2
    builder.addLink('center-total', 'public-budget', publicBudgetTotal);
    builder.addLink('center-total', 'state-companies-exp', stateCompaniesTotal);
    
    // Level 2 → Level 3 (Public Budget → Details)
    builder.addLink('public-budget', 'func-defense', funcDefense);
    builder.addLink('public-budget', 'func-education', funcEducation);
    builder.addLink('public-budget', 'func-health', funcHealth);
    builder.addLink('public-budget', 'func-infrastructure', funcInfrastructure);
    builder.addLink('public-budget', 'func-governance', funcGovernance);
    builder.addLink('public-budget', 'func-financial', funcFinancial);
    builder.addLink('public-budget', 'func-culture', funcCulture);
    
    // Level 2 → Level 3 (State Companies → Details)
    builder.addLink('state-companies-exp', 'state-exp-operating', stateOperating);
    builder.addLink('state-companies-exp', 'state-exp-capital', stateCapital);
    builder.addLink('state-companies-exp', 'state-exp-loans', stateLoanRepay);
    builder.addLink('state-companies-exp', 'state-exp-assets', stateAssetsExp);
    
  } else {
    // Economic view links
    builder.addLink('center-total', 'personnel', personnelCosts);
    builder.addLink('center-total', 'development', developmentProjects);
    builder.addLink('center-total', 'debt-service', debtService);
    builder.addLink('center-total', 'support', supportPrograms);
    
    // Main Categories → Details
    builder.addLink('personnel', 'employee-salaries', employeeSalaries);
    builder.addLink('personnel', 'retiree-pensions', retireePensions);
    builder.addLink('personnel', 'benefits', benefits);
    
    builder.addLink('development', 'infrastructure', infrastructure);
    builder.addLink('development', 'technology', technology);
    builder.addLink('development', 'regional-dev', regionalDev);
    
    builder.addLink('debt-service', 'bond-repayments', bondRepayments);
    builder.addLink('debt-service', 'debt-payments', debtPayments);
    
    builder.addLink('support', 'cash-subsidies', cashSubsidies);
    builder.addLink('support', 'energy-subsidies', energySubsidies);
    builder.addLink('support', 'food-essentials', foodEssentials);
  }
  
  // Build and return
  const sankeyData = builder.build(revenueTotalCorrected, expenditureTotal);
  
  // Log all links for debugging
  console.log('=== ALL LINKS ===');
  sankeyData.links.forEach((link, i) => {
    const sourceName = sankeyData.nodes[link.source].id;
    const targetName = sankeyData.nodes[link.target].id;
    console.log(`Link ${i}: ${sourceName} → ${targetName} (value: ${link.value.toFixed(2)})`);
  });
  
  return sankeyData;
}
