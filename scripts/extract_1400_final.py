#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final comprehensive extraction for 1400 budget
Extracts all key metrics requested by user
"""

import pandas as pd
import json

def clean_number(s):
    """Clean and convert number strings to float"""
    if isinstance(s, (int, float)):
        return s
    if pd.isna(s):
        return 0.0
    s = str(s).replace(',', '').strip()
    try:
        return float(s)
    except ValueError:
        return 0.0

def main():
    print("="*80)
    print("FINAL BUDGET EXTRACTION - 1400")
    print("="*80)
    
    # Load CSVs
    df_rev = pd.read_csv('../data/raw/unverified/revenues1400.csv')
    df_exp = pd.read_csv('../data/raw/unverified/expenses1400.csv')
    
    # Clean the 1400 column
    df_rev['amount'] = df_rev['1400'].apply(clean_number)
    df_exp['amount'] = df_exp['1400'].apply(clean_number)
    
    results = {
        "year": 1400,
        "year_gregorian": "2021-2022",
        "currency": "billion rials",
        "notes": "Data extracted from CSV files and budget law text"
    }
    
    # =========================================================================
    # REVENUES
    # =========================================================================
    print("\n💰 EXTRACTING REVENUES...")
    print("-"*80)
    
    total_revenues = df_rev['amount'].sum()
    print(f"Total Revenues: {total_revenues:,.2f} billion rials")
    
    # Tax Revenue
    tax_rows = df_rev[df_rev['TOOLTIP'].str.contains('درآمدهای مالیاتی', na=False)]
    if not tax_rows.empty:
        tax_revenue = tax_rows['amount'].sum()
    else:
        # Sum all tax categories
        tax_rows = df_rev[df_rev['LEVEL2'].str.contains('مالیات', na=False)]
        tax_revenue = tax_rows['amount'].sum()
    
    print(f"Tax Revenue: {tax_revenue:,.2f} billion rials")
    
    # Oil & Gas Revenue
    oil_keywords = ['نفت', 'گاز', 'ميعانات', 'میعانات']
    oil_rows = df_rev[df_rev['TOOLTIP'].apply(
        lambda x: any(kw in str(x) for kw in oil_keywords)
    )]
    oil_revenue = oil_rows['amount'].sum()
    print(f"Oil & Gas Revenue: {oil_revenue:,.2f} billion rials")
    
    # Corporate tax
    corp_tax = df_rev[df_rev['LEVEL3'].str.contains('مالیات شرکت', na=False)]['amount'].sum()
    
    # Individual income tax (حقوق = salaries/wages)
    indiv_tax = df_rev[df_rev['TOOLTIP'].str.contains('حقوق', na=False) & 
                       df_rev['TOOLTIP'].str.contains('مالیات', na=False)]['amount'].sum()
    
    # Payroll tax (might be under different names)
    payroll_tax = df_rev[df_rev['TOOLTIP'].str.contains('حق بیمه|بیمه', na=False)]['amount'].sum()
    
    # Social security (تامین اجتماعی)
    social_sec = df_rev[df_rev['TOOLTIP'].str.contains('تأمین اجتماعی|تامین اجتماعی', na=False)]['amount'].sum()
    
    print(f"\nTax Breakdown:")
    print(f"  Corporate Tax: {corp_tax:,.2f} billion rials")
    print(f"  Individual Tax: {indiv_tax:,.2f} billion rials")
    print(f"  Payroll Tax: {payroll_tax:,.2f} billion rials")
    print(f"  Social Security: {social_sec:,.2f} billion rials")
    
    # Subsidy targeting (هدفمند كردن يارانه ‌ها)
    subsidy_rows = df_rev[df_rev['TOOLTIP'].str.contains('یارانه|يارانه', na=False)]
    subsidy_revenue = subsidy_rows['amount'].sum()
    print(f"\nSubsidy-related revenues: {subsidy_revenue:,.2f} billion rials")
    
    results['revenues'] = {
        "total": float(total_revenues),
        "tax_total": float(tax_revenue),
        "oil_gas": float(oil_revenue),
        "tax_breakdown": {
            "corporate": float(corp_tax),
            "individual": float(indiv_tax),
            "payroll": float(payroll_tax),
            "social_security": float(social_sec)
        },
        "subsidy_related": float(subsidy_revenue)
    }
    
    # =========================================================================
    # EXPENDITURES
    # =========================================================================
    print("\n\n💸 EXTRACTING EXPENDITURES...")
    print("-"*80)
    
    total_exp = df_exp['amount'].sum()
    print(f"Total Expenditures: {total_exp:,.2f} billion rials")
    
    # Current vs Capital
    # Current: جاری, operational
    # Capital: سرمایه, تملک, عمرانی
    
    current_keywords = ['جاری', 'عملیاتی', 'هزینه‌ای']
    capital_keywords = ['سرمایه', 'تملک', 'عمرانی']
    
    current_exp = 0
    capital_exp = 0
    
    for idx, row in df_exp.iterrows():
        text_to_search = f"{row.get('TOOLTIP', '')} {row.get('LEVEL2', '')} {row.get('LEVEL3', '')}"
        
        if any(kw in text_to_search for kw in current_keywords):
            current_exp += row['amount']
        elif any(kw in text_to_search for kw in capital_keywords):
            capital_exp += row['amount']
    
    # If classification unclear, try by LEVEL2
    if current_exp == 0 or capital_exp == 0:
        level2_summary = df_exp.groupby('LEVEL2')['amount'].sum()
        print(f"\nExpenditure by LEVEL2:")
        for cat, amount in level2_summary.head(10).items():
            print(f"  {cat}: {amount:,.2f} billion rials")
    
    print(f"\nCurrent Expenditure: {current_exp:,.2f} billion rials")
    print(f"Capital Expenditure: {capital_exp:,.2f} billion rials")
    print(f"Unclassified: {total_exp - current_exp - capital_exp:,.2f} billion rials")
    
    # Subsidy spending
    subsidy_exp = df_exp[df_exp['TOOLTIP'].str.contains('یارانه|يارانه', na=False)]['amount'].sum()
    print(f"\nSubsidy Expenditure: {subsidy_exp:,.2f} billion rials")
    
    results['expenditures'] = {
        "total": float(total_exp),
        "current": float(current_exp),
        "capital": float(capital_exp),
        "unclassified": float(total_exp - current_exp - capital_exp),
        "subsidy_spending": float(subsidy_exp)
    }
    
    # =========================================================================
    # BALANCE
    # =========================================================================
    print("\n\n⚖️  BUDGET BALANCE:")
    print("-"*80)
    
    balance = total_revenues - total_exp
    print(f"Total Revenues:  {total_revenues:>20,.2f} billion rials")
    print(f"Total Expenses:  {total_exp:>20,.2f} billion rials")
    print(f"{'─'*60}")
    
    if balance >= 0:
        print(f"SURPLUS:         {balance:>20,.2f} billion rials ✅")
        status = "surplus"
    else:
        print(f"DEFICIT:         {balance:>20,.2f} billion rials ⚠️")
        status = "deficit"
    
    results['balance'] = {
        "surplus_deficit": float(balance),
        "status": status,
        "deficit_to_gdp": "TBD - need GDP data"
    }
    
    # =========================================================================
    # FROM LAW TEXT
    # =========================================================================
    print("\n\n📜 FROM BUDGET LAW (for reference):")
    print("-"*80)
    print(f"Total Budget (law):          28,823,398,457 billion rials")
    print(f"General Government (law):    13,737,699,268 billion rials") 
    print(f"General Resources (law):     12,779,209,356 billion rials")
    print(f"Oil/Gas Ceiling (law):        1,992,720,000 billion rials")
    
    print(f"\nNote: CSV data represents a subset of the full budget")
    print(f"CSV likely covers general operating budget only")
    
    results['law_reference'] = {
        "total_budget": 28823398457,
        "general_government": 13737699268,
        "general_resources": 12779209356,
        "oil_gas_ceiling": 1992720000,
        "note": "CSV covers operational/general budget; Law includes all sectors and state enterprises"
    }
    
    # =========================================================================
    # SAVE
    # =========================================================================
    output_file = '../data/processed/budget_1400_final.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*80}")
    print(f"✅ Results saved to: {output_file}")
    print(f"{'='*80}\n")

if __name__ == "__main__":
    main()

