#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch extract budget data for years 1402 and 1403
"""

import pandas as pd
import json
import re

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

def extract_year(year):
    print("="*80)
    print(f"FINAL BUDGET EXTRACTION - {year}")
    print("="*80)
    
    # Load CSVs
    try:
        df_rev = pd.read_csv(f'../data/raw/unverified/revenues{year}.csv')
        df_exp = pd.read_csv(f'../data/raw/unverified/expenses{year}.csv')
    except FileNotFoundError:
        print(f"❌ CSV files not found for year {year}")
        return None
    
    # Clean the year column
    df_rev['amount'] = df_rev[str(year)].apply(clean_number)
    df_exp['amount'] = df_exp[str(year)].apply(clean_number)
    
    results = {
        "year": year,
        "year_gregorian": f"{year-621}-{year-620}",
        "currency": "billion rials",
    }
    
    # REVENUES
    print("\n💰 EXTRACTING REVENUES...")
    print("-"*80)
    
    total_revenues = df_rev['amount'].sum()
    print(f"Total Revenues (CSV): {total_revenues:,.2f} billion rials")
    
    # Tax Revenue
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
    payroll_tax = df_rev[df_rev['TOOLTIP'].str.contains('حق بیمه|بیمه', na=False)]['amount'].sum()
    
    subsidy_revenue = df_rev[df_rev['TOOLTIP'].str.contains('یارانه|يارانه', na=False)]['amount'].sum()
    
    print(f"  Tax Revenue: {tax_revenue:,.2f}")
    print(f"  Oil/Gas: {oil_revenue:,.2f}")
    print(f"  Corporate Tax: {corp_tax:,.2f}")
    print(f"  Individual Tax: {indiv_tax:,.2f}")
    print(f"  Subsidy Revenue: {subsidy_revenue:,.2f}")
    
    results['revenues'] = {
        "total": float(total_revenues),
        "tax_total": float(tax_revenue),
        "oil_gas": float(oil_revenue),
        "tax_breakdown": {
            "corporate": float(corp_tax),
            "individual": float(indiv_tax),
            "payroll": float(payroll_tax),
            "social_security": 0.0
        },
        "subsidy_related": float(subsidy_revenue)
    }
    
    # EXPENDITURES
    print("\n💸 EXTRACTING EXPENDITURES...")
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
    
    subsidy_exp = df_exp[df_exp['TOOLTIP'].str.contains('یارانه|يارانه', na=False)]['amount'].sum()
    
    print(f"  Current Exp: {current_exp:,.2f}")
    print(f"  Capital Exp: {capital_exp:,.2f}")
    print(f"  Subsidy Exp: {subsidy_exp:,.2f}")
    
    results['expenditures'] = {
        "total": float(total_exp),
        "current": float(current_exp),
        "capital": float(capital_exp),
        "unclassified": float(total_exp - current_exp - capital_exp),
        "subsidy_spending": float(subsidy_exp)
    }
    
    # BALANCE
    balance = total_revenues - total_exp
    
    print("\n⚖️  BUDGET BALANCE:")
    print("-"*80)
    print(f"  Revenues:  {total_revenues:>20,.2f}")
    print(f"  Expenses:  {total_exp:>20,.2f}")
    print(f"  {'─'*50}")
    
    if balance >= 0:
        print(f"  SURPLUS:   {balance:>20,.2f} ✅")
        status = "surplus"
    else:
        print(f"  DEFICIT:   {balance:>20,.2f} ⚠️")
        status = "deficit"
    
    results['balance'] = {
        "surplus_deficit": float(balance),
        "status": status
    }
    
    # Save
    output_file = f'../data/processed/budget_{year}_final.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Saved to: {output_file}\n")
    
    return results

if __name__ == "__main__":
    for year in [1402, 1403]:
        extract_year(year)
        print("\n")

