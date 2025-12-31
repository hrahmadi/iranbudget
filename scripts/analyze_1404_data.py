#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyze 1404 budget data and create final JSON
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

def analyze_1404():
    print("="*80)
    print("ANALYZING 1404 BUDGET DATA")
    print("="*80)
    
    # Read the revenues CSV
    csv_path = '../data/raw/unverified/revenues1404.csv'
    df = pd.read_csv(csv_path)
    
    print(f"\n📊 Loaded {len(df)} rows")
    print(f"Columns: {list(df.columns)}")
    
    # Clean the Grand Total column
    df['amount'] = df['Grand Total'].apply(clean_number)
    
    print(f"\n💰 REVENUE BREAKDOWN:")
    print("-"*80)
    
    # Total revenues (row with code 10000 or 11000)
    total_revenues = df[df['Classification Code'] == 10000]['amount'].sum()
    if total_revenues == 0:
        total_revenues = df['amount'].sum()
    
    print(f"Total Revenues: {total_revenues:,.2f} billion rials")
    
    # Tax revenue (codes starting with 11)
    tax_rows = df[df['Classification Code'].apply(lambda x: str(x).startswith('11') if pd.notna(x) else False)]
    tax_revenue = tax_rows['amount'].sum()
    
    print(f"Tax Revenue: {tax_revenue:,.2f} billion rials")
    
    # Corporate tax (110100 series)
    corporate_tax = df[df['Classification Code'].apply(
        lambda x: str(x).startswith('1101') if pd.notna(x) else False
    )]['amount'].sum()
    
    print(f"Corporate Tax: {corporate_tax:,.2f} billion rials")
    
    # Income tax (110200 series)
    income_tax = df[df['Classification Code'].apply(
        lambda x: str(x).startswith('1102') if pd.notna(x) else False
    )]['amount'].sum()
    
    print(f"Income Tax: {income_tax:,.2f} billion rials")
    
    # Check for more data
    print(f"\n📋 All entries:")
    for idx, row in df.iterrows():
        code = row['Classification Code']
        title = row['Title']
        amount = row['amount']
        if amount > 0:
            print(f"  {code}: {title} = {amount:,.0f}")
    
    # Create final JSON structure
    results = {
        "year": 1404,
        "year_gregorian": "2025-2026",
        "currency": "billion rials",
        "source": "Manual extraction from official budget tables (GIF images)",
        "data_quality": "manual_entry",
        
        "revenues": {
            "total": float(total_revenues),
            "tax_total": float(tax_revenue),
            "oil_gas": 0.0,  # Need to add this data
            "tax_breakdown": {
                "corporate": float(corporate_tax),
                "individual": float(income_tax),
                "payroll": 0.0,
                "social_security": 0.0
            }
        },
        
        "expenditures": {
            "total": 0.0,  # Need expenditure data
            "current": 0.0,
            "capital": 0.0,
            "unclassified": 0.0,
            "subsidy_spending": 0.0
        },
        
        "balance": {
            "surplus_deficit": 0.0,
            "status": "incomplete_data"
        },
        
        "notes": [
            "Data manually extracted from table5.gif",
            "Expenditure data pending",
            "Oil revenue data pending"
        ]
    }
    
    # Save
    output_file = '../data/processed/budget_1404_partial.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Saved to: {output_file}")
    print("\n" + "="*80)
    print("STATUS:")
    print("="*80)
    print(f"✅ Revenue data: Partial")
    print(f"⏳ Expenditure data: Needed")
    print(f"⏳ Oil/gas revenue: Needed")
    print("\nPlease check if the Excel file has more sheets or data!")

if __name__ == "__main__":
    analyze_1404()

