#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract budget data for ALL years: 1395-1404
Create comprehensive multi-year dataset
"""

import pandas as pd
import json
import os

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

def analyze_year(year):
    """Analyze budget data for a single year"""
    print(f"\n{'='*80}")
    print(f"ANALYZING YEAR {year}")
    print('='*80)
    
    # Read revenues and expenses
    rev_file = f'../data/raw/unverified/revenues{year}.csv'
    exp_file = f'../data/raw/unverified/expenses{year}.csv'
    
    if not os.path.exists(rev_file):
        print(f"⚠️  Revenue file not found: {rev_file}")
        return None
    
    if not os.path.exists(exp_file):
        print(f"⚠️  Expense file not found: {exp_file}")
        return None
    
    df_rev = pd.read_csv(rev_file)
    df_exp = pd.read_csv(exp_file)
    
    # Clean year column
    year_col = str(year)
    df_rev['amount'] = df_rev[year_col].apply(clean_number)
    df_exp['amount'] = df_exp[year_col].apply(clean_number)
    
    # REVENUES
    total_revenues = df_rev['amount'].sum()
    
    # Tax revenue
    tax_rows = df_rev[df_rev['LEVEL2'].str.contains('مالیات', na=False)]
    tax_revenue = tax_rows['amount'].sum()
    
    # Oil & Gas
    oil_keywords = ['نفت', 'گاز', 'ميعانات', 'میعانات']
    oil_rows = df_rev[df_rev['TOOLTIP'].apply(
        lambda x: any(kw in str(x) for kw in oil_keywords)
    )]
    oil_revenue = oil_rows['amount'].sum()
    
    # Tax breakdown
    corp_tax = df_rev[df_rev['LEVEL3'].str.contains('مالیات شرکت', na=False)]['amount'].sum()
    indiv_tax = df_rev[df_rev['TOOLTIP'].str.contains('حقوق', na=False) & 
                       df_rev['TOOLTIP'].str.contains('مالیات', na=False)]['amount'].sum()
    
    # EXPENDITURES
    total_exp = df_exp['amount'].sum()
    
    # Current vs Capital (approximate)
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
    
    # Subsidy expenditure
    subsidy_exp = df_exp[df_exp['TOOLTIP'].str.contains('یارانه|يارانه', na=False)]['amount'].sum()
    
    # Balance
    balance = total_revenues - total_exp
    status = "surplus" if balance >= 0 else "deficit"
    
    print(f"✅ Revenues:     {total_revenues:>20,.0f}")
    print(f"   Tax:          {tax_revenue:>20,.0f}")
    print(f"   Oil/Gas:      {oil_revenue:>20,.0f}")
    print(f"✅ Expenditures: {total_exp:>20,.0f}")
    print(f"   Current:      {current_exp:>20,.0f}")
    print(f"   Capital:      {capital_exp:>20,.0f}")
    print(f"   Subsidies:    {subsidy_exp:>20,.0f}")
    print(f"⚖️  Balance:      {balance:>20,.0f} ({status})")
    
    return {
        "year": year,
        "year_gregorian": f"{year-621}-{year-620}",
        "currency": "billion rials",
        "source": "CSV data from official budget tables",
        
        "revenues": {
            "total": float(total_revenues),
            "tax_total": float(tax_revenue),
            "oil_gas": float(oil_revenue),
            "tax_breakdown": {
                "corporate": float(corp_tax),
                "individual": float(indiv_tax),
                "payroll": 0.0,
                "social_security": 0.0
            }
        },
        
        "expenditures": {
            "total": float(total_exp),
            "current": float(current_exp),
            "capital": float(capital_exp),
            "unclassified": float(total_exp - current_exp - capital_exp),
            "subsidy_spending": float(subsidy_exp)
        },
        
        "balance": {
            "surplus_deficit": float(balance),
            "status": status
        }
    }

def main():
    print("="*80)
    print("EXTRACTING ALL YEARS: 1395-1404")
    print("="*80)
    
    years = [1395, 1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403]
    
    all_data = {}
    
    for year in years:
        result = analyze_year(year)
        if result:
            all_data[year] = result
            
            # Save individual year file
            output_file = f'../data/processed/budget_{year}_final.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"💾 Saved: {output_file}")
    
    # Add 1404 (already processed)
    budget_1404_file = '../data/processed/budget_1404_final.json'
    if os.path.exists(budget_1404_file):
        with open(budget_1404_file, 'r', encoding='utf-8') as f:
            all_data[1404] = json.load(f)
        print(f"\n✅ Loaded 1404 data from: {budget_1404_file}")
    
    # Save comprehensive dataset
    output_file = '../data/processed/iran_budget_1395_1404_complete.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*80)
    print(f"✅ COMPLETE! {len(all_data)} years processed")
    print(f"💾 Saved to: {output_file}")
    print("="*80)
    
    # Summary
    print("\n📊 SUMMARY:")
    print("-"*80)
    print(f"{'Year':<6} {'Revenues':>18} {'Expenditures':>18} {'Balance':>18} {'Status':<10}")
    print("-"*80)
    
    for year in sorted(all_data.keys()):
        data = all_data[year]
        rev = data['revenues']['total']
        exp = data['expenditures']['total']
        bal = data['balance']['surplus_deficit']
        status = data['balance']['status']
        
        print(f"{year:<6} {rev:>18,.0f} {exp:>18,.0f} {bal:>18,.0f} {status:<10}")
    
    print("="*80)

if __name__ == "__main__":
    main()

