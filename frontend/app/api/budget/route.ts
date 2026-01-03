import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    if (year) {
      // Get specific year with complete revenue breakdown
      const result = await query(`
        SELECT 
          y.year_persian,
          y.year_gregorian,
          y.currency,
          r.total as revenue_total,
          r.operational_revenue,
          r.special_accounts,
          r.state_comp_revenue_total,
          r.state_comp_revenues,
          r.state_comp_current_credits,
          r.state_comp_capital_credits,
          r.state_comp_domestic_loans,
          r.state_comp_foreign_loans,
          r.state_comp_current_assets,
          r.state_comp_other_receipts,
          r.tax_total,
          r.tax_corporate,
          r.tax_individual,
          r.tax_vat_sales,
          r.tax_wealth,
          r.tax_import_duties,
          r.oil_gas,
          r.oil_exports,
          r.gas_condensate,
          r.other,
          r.ministry_revenue,
          e.total as expenditure_total,
          e.current_exp,
          e.capital_exp,
          e.subsidy_spending,
          e.state_comp_net,
          e.state_comp_current_exp,
          e.state_comp_capital_exp,
          f.defense,
          f.education,
          f.health,
          f.economic_affairs,
          f.general_public_services,
          f.recreation_culture,
          f.social_protection,
          f.def_military,
          f.econ_transport,
          f.econ_fuel_energy,
          f.gps_executive_legislative,
          f.gps_public_debt,
          b.surplus_deficit,
          b.status
        FROM years y
        LEFT JOIN revenues r ON y.year_id = r.year_id
        LEFT JOIN expenditures e ON y.year_id = e.year_id
        LEFT JOIN functional_expenditures f ON y.year_id = f.year_id
        LEFT JOIN budget_balance b ON y.year_id = b.year_id
        WHERE y.year_persian = $1
      `, [parseInt(year)]);
      
      return NextResponse.json(result[0] || null);
    } else {
      // Get all years summary
      const result = await query(`
        SELECT 
          y.year_persian,
          y.year_gregorian,
          r.total as revenue_total,
          e.total as expenditure_total,
          b.surplus_deficit,
          b.status
        FROM years y
        LEFT JOIN revenues r ON y.year_id = r.year_id
        LEFT JOIN expenditures e ON y.year_id = e.year_id
        LEFT JOIN budget_balance b ON y.year_id = b.year_id
        ORDER BY y.year_persian
      `);
      
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Budget API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
