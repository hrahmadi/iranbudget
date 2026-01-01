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
  oil_gas: string;
  tax_corporate: string;
  tax_individual: string;
  expenditure_total: string;
  current_exp: string;
  capital_exp: string;
  subsidy_spending: string;
  state_comp_net: string;
  state_comp_current_exp: string;
  state_comp_capital_exp: string;
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
  language: 'en' | 'fa' = 'en'
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
    revenueCenter: '#3D9BB8',
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
  const stateCompanies = T(data.state_comp_revenue_total || 0);
  
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
  
  // Recalculate revenue total using corrected state companies value
  const revenueTotalCorrected = taxTotal + oilGas + stateCompaniesActual + otherGovRevenue + specialAccounts;
  
  // Tax breakdown
  const vatSales = Math.max(0, taxTotal - taxCorporate - taxIndividual);
  const importDuties = vatSales * 0.3;
  const otherTaxes = vatSales * 0.2;
  const adjustedVat = vatSales - importDuties - otherTaxes;
  
  const oilExports = oilGas * 0.85;
  const gasCondensate = oilGas * 0.15;
  
  // Other gov revenue
  const otherGovRevenue = Math.max(0, operationalRevenue - taxTotal - oilGas);
  const feesCharges = otherGovRevenue * 0.60;
  const otherIncome = otherGovRevenue * 0.40;
  
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
    govOther = Math.max(0, operationalRevenue + specialAccounts - govComponents);
    
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
  
  // LEVEL 0: State Company Revenue Details (if available)
  if (hasStateBreakdown) {
    builder.addNode('state-operations', label('Company Operations'), stateRevenues, colors.revenue1, 0.02, 0.05);
    builder.addNode('state-credits', label('Government Credits'), stateCurrentCredits + stateCapitalCredits, colors.revenue2, 0.02, 0.13);
    builder.addNode('state-loans-domestic', label('Domestic Loans'), stateDomesticLoans, colors.revenue2, 0.02, 0.21);
    builder.addNode('state-loans-foreign', label('Foreign Loans'), stateForeignLoans, colors.revenue3, 0.02, 0.29);
    builder.addNode('state-assets', label('Asset Sales'), stateCurrentAssets, colors.revenue4, 0.02, 0.37);
    builder.addNode('state-other', label('Other Receipts'), stateOtherReceipts, colors.revenue5, 0.02, 0.45);
  }
  
  // LEVEL 1: Government Revenue Details
  const govX = hasStateBreakdown ? 0.15 : 0.05;
  builder.addNode('corporate-tax', label('Corporate Tax'), taxCorporate, colors.revenue1, govX, 0.53);
  builder.addNode('individual-tax', label('Individual Income Tax'), taxIndividual, colors.revenue1, govX, 0.58);
  builder.addNode('vat', label('VAT & Sales Tax'), adjustedVat, colors.revenue2, govX, 0.63);
  builder.addNode('import-duties', label('Import Duties'), importDuties, colors.revenue2, govX, 0.68);
  builder.addNode('other-tax', label('Other Taxes'), otherTaxes, colors.revenue2, govX, 0.73);
  builder.addNode('oil-exports', label('Oil Exports'), oilExports, colors.revenue3, govX, 0.78);
  builder.addNode('gas-exports', label('Gas & Condensate'), gasCondensate, colors.revenue3, govX, 0.83);
  builder.addNode('fees-charges', label('Fees & Charges'), feesCharges, colors.revenue4, govX, 0.88);
  builder.addNode('other-income', label('Other Income'), otherIncome, colors.revenue4, govX, 0.93);
  builder.addNode('special-revenue', label('Ministry Revenue'), specialAccounts, colors.revenue5, govX, 0.98);
  
  // LEVEL 2: Aggregated Revenue
  const aggX = hasStateBreakdown ? 0.30 : 0.28;
  builder.addNode('tax-revenue', label('Tax Revenue'), taxTotal, colors.revenue2, aggX, 0.60);
  builder.addNode('oil-gas-revenue', label('Oil & Gas Revenue'), oilGas, colors.revenue3, aggX, 0.75);
  builder.addNode('state-company-revenue', label('State Companies'), stateCompaniesActual, colors.revenue1, aggX, 0.20);
  builder.addNode('other-revenue', label('Other Revenue'), otherGovRevenue, colors.revenue4, aggX, 0.85);
  
  // CENTER: Single center column (merge revenue and spending into one visual node)
  builder.addNode('center-total', '', revenueTotalCorrected, colors.revenueCenter, 0.50, 0.50);
  
  // LEVEL 3: Main Spending
  builder.addNode('personnel', label('Personnel Costs'), personnelCosts, colors.spending1, 0.72, 0.30);
  builder.addNode('development', label('Development Projects'), developmentProjects, colors.spending2, 0.72, 0.45);
  builder.addNode('debt-service', label('Debt Service'), debtService, colors.spending3, 0.72, 0.60);
  builder.addNode('support', label('Support Programs'), supportPrograms, colors.spending4, 0.72, 0.75);
  
  // LEVEL 4: Detailed Spending
  builder.addNode('employee-salaries', label('Employee Salaries'), employeeSalaries, colors.spending1, 0.95, 0.10);
  builder.addNode('retiree-pensions', label('Retiree Pensions'), retireePensions, colors.spending2, 0.95, 0.17);
  builder.addNode('benefits', label('Benefits'), benefits, colors.spending2, 0.95, 0.24);
  builder.addNode('infrastructure', label('Infrastructure'), infrastructure, colors.spending1, 0.95, 0.38);
  builder.addNode('technology', label('Technology'), technology, colors.spending2, 0.95, 0.45);
  builder.addNode('regional-dev', label('Regional Dev'), regionalDev, colors.spending3, 0.95, 0.52);
  builder.addNode('bond-repayments', label('Bond Repayments'), bondRepayments, colors.spending2, 0.95, 0.65);
  builder.addNode('debt-payments', label('Debt Payments'), debtPayments, colors.spending3, 0.95, 0.72);
  builder.addNode('cash-subsidies', label('Cash Subsidies'), cashSubsidies, colors.spending1, 0.95, 0.82);
  builder.addNode('energy-subsidies', label('Energy Subsidies'), energySubsidies, colors.spending2, 0.95, 0.89);
  builder.addNode('food-essentials', label('Food & Essentials'), foodEssentials, colors.spending3, 0.95, 0.96);
  
  // === BUILD LINKS ===
  
  // State company details → State company aggregate (if available)
  if (hasStateBreakdown) {
    builder.addLink('state-operations', 'state-company-revenue', stateRevenues);
    builder.addLink('state-credits', 'state-company-revenue', stateCurrentCredits + stateCapitalCredits);
    builder.addLink('state-loans-domestic', 'state-company-revenue', stateDomesticLoans);
    builder.addLink('state-loans-foreign', 'state-company-revenue', stateForeignLoans);
    builder.addLink('state-assets', 'state-company-revenue', stateCurrentAssets);
    builder.addLink('state-other', 'state-company-revenue', stateOtherReceipts);
  }
  
  // Government details → Aggregates
  builder.addLink('corporate-tax', 'tax-revenue', taxCorporate);
  builder.addLink('individual-tax', 'tax-revenue', taxIndividual);
  builder.addLink('vat', 'tax-revenue', adjustedVat);
  builder.addLink('import-duties', 'tax-revenue', importDuties);
  builder.addLink('other-tax', 'tax-revenue', otherTaxes);
  
  builder.addLink('oil-exports', 'oil-gas-revenue', oilExports);
  builder.addLink('gas-exports', 'oil-gas-revenue', gasCondensate);
  
  builder.addLink('fees-charges', 'other-revenue', feesCharges);
  builder.addLink('other-income', 'other-revenue', otherIncome);
  
  // Aggregates → Center
  builder.addLink('tax-revenue', 'center-total', taxTotal);
  builder.addLink('oil-gas-revenue', 'center-total', oilGas);
  builder.addLink('state-company-revenue', 'center-total', stateCompaniesActual);
  builder.addLink('other-revenue', 'center-total', otherGovRevenue);
  builder.addLink('special-revenue', 'center-total', specialAccounts);
  
  // Center → Main Spending Categories
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
