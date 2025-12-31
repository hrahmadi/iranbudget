#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final comprehensive extraction for 1401 budget
"""

import pandas as pd
import json

def clean_number(s):
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
    print("FINAL BUDGET EXTRACTION - 1401")
    print("="*80)
    
    # Load CSVs
    df_rev = pd.read_csv('../data/raw/unverified/revenues1401.csv')
    df_exp = pd.read_csv('../data/raw/unverified/expenses1401.csv')
    
    # Clean the 1401 column
    df_rev['amount'] = df_rev['1401'].apply(clean_number)
    df_exp['amount'] = df_exp['1401'].apply(clean_number)
    
    results = {
        "year": 1401,
        "year_gregorian": "2022-2023",
        "currency": "billion rials",
    }
    
    # =========================================================================
    # FROM LAW TEXT
    # =========================================================================
    print("\n📜 FROM BUDGET LAW (1401):")
    print("-"*80)
    
    law_data = {
        "total_budget": 37_587_793_931,
        "general_government": 15_273_714_613,
        "general_resources": 13_941_318_500,
        "specific_revenues": 1_332_396_113,
        "state_enterprises": 22_314_079_318,
        "oil_gas_ceiling": 4_844_000_000
    }
    
    for key, value in law_data.items():
        print(f"  {key:25s}: {value:>20,.0f} billion rials")
    
    results['law_reference'] = law_data
    
    # =========================================================================
    # REVENUES
    # =========================================================================
    print("\n\n💰 EXTRACTING REVENUES...")
    print("-"*80)
    
    total_revenues = df_rev['amount'].sum()
    print(f"Total Revenues (CSV): {total_revenues:,.2f} billion rials")
    
    # Tax Revenue
    tax_rows = df_rev[df_rev['LEVEL2'].str.contains('مالیات', na=False)]
    tax_revenue = tax_rows['amount'].sum()
    print(f"Tax Revenue: {tax_revenue:,.2f} billion rials")
    
    # Oil & Gas
    oil_keywords = ['نفت', 'گاز', 'ميعانات', 'میعانات']
    oil_rows = df_rev[df_rev['TOOLTIP'].apply(
        lambda x: any(kw in str(x) for kw in oil_keywords)
    )]
    oil_revenue = oil_rows['amount'].sum()
    print(f"Oil & Gas Revenue: {oil_revenue:,.2f} billion rials")
    
    # Tax breakdown
    corp_tax = df_rev[df_rev['LEVEL3'].str.contains('مالیات شرکت', na=False)]['amount'].sum()
    indiv_tax = df_rev[df_rev['TOOLTIP'].str.contains('حقوق', na=False) & 
                       df_rev['TOOLTIP'].str.contains('مالیات', na=False)]['amount'].sum()
    payroll_tax = df_rev[df_rev['TOOLTIP'].str.contains('حق بیمه|بیمه', na=False)]['amount'].sum()
    social_sec = df_rev[df_rev['TOOLTIP'].str.contains('تأمین اجتماعی|تامین اجتماعی', na=False)]['amount'].sum()
    
    print(f"\nTax Breakdown:")
    print(f"  Corporate: {corp_tax:,.2f}")
    print(f"  Individual: {indiv_tax:,.2f}")
    print(f"  Payroll: {payroll_tax:,.2f}")
    print(f"  Social Security: {social_sec:,.2f}")
    
    subsidy_revenue = df_rev[df_rev['TOOLTIP'].str.contains('یارانه|يارانه', na=False)]['amount'].sum()
    print(f"\nSubsidy-related revenues: {subsidy_revenue:,.2f}")
    
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
    print(f"Total Expenditures (CSV): {total_exp:,.2f} billion rials")
    
    # Current vs Capital
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
    
    print(f"Current Expenditure: {current_exp:,.2f}")
    print(f"Capital Expenditure: {capital_exp:,.2f}")
    print(f"Unclassified: {total_exp - current_exp - capital_exp:,.2f}")
    
    subsidy_exp = df_exp[df_exp['TOOLTIP'].str.contains('یارانه|يارانه', na=False)]['amount'].sum()
    print(f"\nSubsidy Expenditure: {subsidy_exp:,.2f}")
    
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
        "status": status
    }
    
    # =========================================================================
    # YEAR-OVER-YEAR COMPARISON
    # =========================================================================
    print("\n\n📊 COMPARISON WITH 1400:")
    print("-"*80)
    
    # Load 1400 data
    try:
        with open('../data/processed/budget_1400_final.json', 'r', encoding='utf-8') as f:
            data_1400 = json.load(f)
        
        rev_1400 = data_1400['revenues']['total']
        exp_1400 = data_1400['expenditures']['total']
        
        rev_change = ((total_revenues - rev_1400) / rev_1400) * 100
        exp_change = ((total_exp - exp_1400) / exp_1400) * 100
        
        print(f"Revenue growth: {rev_change:+.1f}%")
        print(f"Expense growth: {exp_change:+.1f}%")
        
        results['yoy_comparison'] = {
            "revenue_change_pct": float(rev_change),
            "expense_change_pct": float(exp_change)
        }
    except:
        print("Could not load 1400 data for comparison")
    
    # =========================================================================
    # SAVE
    # =========================================================================
    output_file = '../data/processed/budget_1401_final.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*80}")
    print(f"✅ Results saved to: {output_file}")
    print(f"{'='*80}\n")

if __name__ == "__main__":
    main()

