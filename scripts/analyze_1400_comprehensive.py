#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive analysis of 1400 budget data
Compares text extraction with CSV data
"""

import pandas as pd
import json
import os

def clean_number(s):
    """Clean and convert number strings to float"""
    if isinstance(s, (int, float)):
        return s
    s = str(s).replace(',', '').strip()
    try:
        return float(s)
    except ValueError:
        return None

def analyze_1400():
    print("="*80)
    print("COMPREHENSIVE BUDGET ANALYSIS - 1400")
    print("="*80)
    
    results = {
        "year": 1400,
        "sources": ["law_text", "revenues_csv", "expenses_csv", "pdf"],
        "summary": {}
    }
    
    # =========================================================================
    # 1. FROM TEXT/LAW
    # =========================================================================
    print("\n📜 FROM BUDGET LAW TEXT:")
    print("-"*80)
    
    text_data = {
        "total_budget": 28_823_398_457,  # billion rials
        "general_government": 13_737_699_268,
        "general_resources": 12_779_209_356,
        "specific_revenues": 958_489_912,
        "state_enterprises": 15_713_217_843,
        "oil_gas_ceiling": 1_992_720_000
    }
    
    for key, value in text_data.items():
        print(f"  {key:25s}: {value:>20,.0f} billion rials")
    
    # =========================================================================
    # 2. FROM CSV - REVENUES
    # =========================================================================
    print("\n\n💰 FROM REVENUES CSV:")
    print("-"*80)
    
    revenues_file = '../data/raw/unverified/revenues1400.csv'
    if os.path.exists(revenues_file):
        df_rev = pd.read_csv(revenues_file)
        df_rev['1400_cleaned'] = df_rev['1400'].apply(clean_number)
        
        total_revenues = df_rev['1400_cleaned'].sum()
        print(f"  Total Revenues: {total_revenues:,.2f} billion rials\n")
        
        # By Level 1
        level1_summary = df_rev.groupby('LEVEL1')['1400_cleaned'].sum().sort_values(ascending=False)
        print("  📊 BY MAJOR CATEGORY (LEVEL1):")
        for cat, amount in level1_summary.items():
            print(f"    {cat:40s}: {amount:>20,.0f} billion rials")
        
        # Extract specific metrics
        tax_revenue = 0
        tax_row = df_rev[df_rev['TOOLTIP'] == 'درآمدهای مالیاتی']
        if not tax_row.empty:
            tax_revenue = tax_row['1400_cleaned'].iloc[0]
        
        oil_revenue = 0
        oil_row = df_rev[df_rev['TOOLTIP'] == 'منابع حاصل از صادرات نفت خام،میعانات گازی و خالص صادرات گاز طبیعی']
        if not oil_row.empty:
            oil_revenue = oil_row['1400_cleaned'].iloc[0]
        
        print(f"\n  ✅ Tax Revenue: {tax_revenue:,.0f} billion rials")
        print(f"  ✅ Oil/Gas Revenue: {oil_revenue:,.0f} billion rials")
        
        results['revenues'] = {
            "total": total_revenues,
            "tax": tax_revenue,
            "oil_gas": oil_revenue,
            "by_level1": {cat: float(amt) for cat, amt in level1_summary.items()}
        }
    else:
        print(f"  ⚠️  File not found: {revenues_file}")
    
    # =========================================================================
    # 3. FROM CSV - EXPENSES
    # =========================================================================
    print("\n\n💸 FROM EXPENSES CSV:")
    print("-"*80)
    
    expenses_file = '../data/raw/unverified/expenses1400.csv'
    if os.path.exists(expenses_file):
        df_exp = pd.read_csv(expenses_file)
        df_exp['1400_cleaned'] = df_exp['1400'].apply(clean_number)
        
        total_expenses = df_exp['1400_cleaned'].sum()
        print(f"  Total Expenses: {total_expenses:,.2f} billion rials\n")
        
        # By Level 1
        level1_summary = df_exp.groupby('LEVEL1')['1400_cleaned'].sum().sort_values(ascending=False)
        print("  📊 BY MAJOR CATEGORY (LEVEL1):")
        for cat, amount in level1_summary.items():
            print(f"    {cat:40s}: {amount:>20,.0f} billion rials")
        
        # Look for Current vs Capital
        # Try to identify هزینه جاری (current) vs تملک (capital)
        current_exp = 0
        capital_exp = 0
        
        for idx, row in df_exp.iterrows():
            tooltip = str(row.get('TOOLTIP', ''))
            level2 = str(row.get('LEVEL2', ''))
            amount = row['1400_cleaned']
            
            if 'جاری' in tooltip or 'جاری' in level2:
                current_exp += amount
            elif 'تملک' in tooltip or 'سرمایه' in level2 or 'عمرانی' in tooltip:
                capital_exp += amount
        
        print(f"\n  ✅ Current Expenditure (estimated): {current_exp:,.0f} billion rials")
        print(f"  ✅ Capital Expenditure (estimated): {capital_exp:,.0f} billion rials")
        
        results['expenses'] = {
            "total": total_expenses,
            "current_estimated": current_exp,
            "capital_estimated": capital_exp,
            "by_level1": {cat: float(amt) for cat, amt in level1_summary.items()}
        }
    else:
        print(f"  ⚠️  File not found: {expenses_file}")
    
    # =========================================================================
    # 4. COMPARISON & VALIDATION
    # =========================================================================
    print("\n\n🔍 COMPARISON & VALIDATION:")
    print("-"*80)
    
    if 'revenues' in results and 'expenses' in results:
        rev_total = results['revenues']['total']
        exp_total = results['expenses']['total']
        balance = rev_total - exp_total
        
        print(f"  Total Revenues:     {rev_total:>20,.0f} billion rials")
        print(f"  Total Expenses:     {exp_total:>20,.0f} billion rials")
        print(f"  {'':21s}  {'─'*30}")
        
        if balance >= 0:
            print(f"  SURPLUS:            {balance:>20,.0f} billion rials ✅")
        else:
            print(f"  DEFICIT:            {balance:>20,.0f} billion rials ⚠️")
        
        results['balance'] = {
            "revenues": rev_total,
            "expenses": exp_total,
            "surplus_deficit": balance,
            "status": "surplus" if balance >= 0 else "deficit"
        }
        
        # Compare with text numbers
        print(f"\n  Text general resources: {text_data['general_resources']:>20,.0f} billion rials")
        print(f"  CSV total revenues:     {rev_total:>20,.0f} billion rials")
        diff = rev_total - text_data['general_resources']
        print(f"  Difference:             {diff:>20,.0f} billion rials")
        
        if abs(diff) < 100_000:  # Less than 100 trillion rials difference
            print("  ✅ Numbers are consistent!")
        else:
            print("  ⚠️  Significant difference - needs investigation")
    
    # =========================================================================
    # 5. SAVE RESULTS
    # =========================================================================
    output_file = '../data/processed/budget_1400_summary.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*80)
    print(f"✅ Analysis saved to: {output_file}")
    print("="*80)
    
    return results

if __name__ == "__main__":
    analyze_1400()

