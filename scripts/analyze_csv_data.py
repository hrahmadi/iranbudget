#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyze CSV budget data for 1399-1403
"""

import pandas as pd
import json

def analyze_revenue_1399():
    """Analyze revenue data for 1399"""
    
    df = pd.read_csv('../data/raw/unverified/revenues1399.csv')
    
    print("=" * 80)
    print("REVENUE ANALYSIS - 1399")
    print("=" * 80)
    
    # Total revenues
    total = df[df['LEVEL'] == 0]['1399'].values[0]
    print(f"\nTotal Revenues: {total} billion rials")
    
    # Major categories (LEVEL1)
    level1 = df[df['LEVEL'] == 1][['LEVEL1', '1399']]
    print("\n📊 MAJOR CATEGORIES (Level 1):")
    print("-" * 80)
    for _, row in level1.iterrows():
        print(f"{row['LEVEL1']:40s}: {row['1399']:>20s} billion rials")
    
    # Tax breakdown (LEVEL2 where LEVEL1 = درآمدها)
    tax_detail = df[(df['LEVEL1'] == 'درآمدها') & (df['LEVEL'] == 2)]
    print("\n💰 TAX AND REVENUE BREAKDOWN:")
    print("-" * 80)
    for _, row in tax_detail.iterrows():
        print(f"{row['LEVEL2']:40s}: {row['1399']:>20s} billion rials")
    
    # Extract key numbers
    tax_total = df[(df['LEVEL1'] == 'درآمدها') & (df['LEVEL2'] == 'مالیات')]['1399'].values
    if len(tax_total) > 0:
        print(f"\n✅ Total Tax Revenue: {tax_total[0]} billion rials")
    
    oil_total = df[(df['LEVEL1'] == 'سرمایه‌های ملی') & (df['LEVEL2'] == 'نفت')]['1399'].values
    if len(oil_total) > 0:
        print(f"✅ Oil Revenue: {oil_total[0]} billion rials")
    
    return df

def analyze_expenses_1399():
    """Analyze expense data for 1399"""
    
    df = pd.read_csv('../data/raw/unverified/expenses1399.csv')
    
    print("\n\n" + "=" * 80)
    print("EXPENSE ANALYSIS - 1399")
    print("=" * 80)
    
    # Get unique LEVEL1 categories
    level1_cats = df[df['LEVEL'] == 1]['LEVEL1'].unique()
    print(f"\nFound {len(level1_cats)} major expenditure categories")
    
    # Convert values to float first
    def clean_number(x):
        if pd.isna(x):
            return 0
        if isinstance(x, str):
            return float(x.replace(',', ''))
        return float(x)
    
    df['1399_num'] = df['1399'].apply(clean_number)
    
    # Aggregate by LEVEL1
    level1_agg = df[df['LEVEL'] == 1].groupby('LEVEL1')['1399_num'].sum().sort_values(ascending=False)
    
    print("\n💸 EXPENDITURE BY MAJOR CATEGORY:")
    print("-" * 80)
    for cat, amount in level1_agg.items():
        print(f"{cat:40s}: {amount:>20,.2f} billion rials")
    
    total_exp = df[df['LEVEL'] == 0]['1399_num'].sum() if len(df[df['LEVEL'] == 0]) > 0 else df['1399_num'].sum()
    print(f"\n✅ Total Expenditures: {total_exp:,.2f} billion rials")
    
    return df

def create_summary():
    """Create summary JSON with key metrics"""
    
    rev_df = pd.read_csv('../data/raw/unverified/revenues1399.csv')
    exp_df = pd.read_csv('../data/raw/unverified/expenses1399.csv')
    
    # Convert to float (remove commas if any)
    def clean_number(x):
        if pd.isna(x):
            return 0
        if isinstance(x, str):
            return float(x.replace(',', ''))
        return float(x)
    
    rev_df['1399'] = rev_df['1399'].apply(clean_number)
    exp_df['1399'] = exp_df['1399'].apply(clean_number)
    
    summary = {
        "year": 1399,
        "source": "CSV files from unverified folder",
        "revenues": {
            "total": float(rev_df[rev_df['LEVEL'] == 0]['1399'].values[0]) if len(rev_df[rev_df['LEVEL'] == 0]) > 0 else 0,
            "tax": float(rev_df[(rev_df['LEVEL1'] == 'درآمدها') & (rev_df['LEVEL2'] == 'مالیات')]['1399'].values[0]) if len(rev_df[(rev_df['LEVEL1'] == 'درآمدها') & (rev_df['LEVEL2'] == 'مالیات')]) > 0 else 0,
            "oil": float(rev_df[(rev_df['LEVEL1'] == 'سرمایه‌های ملی') & (rev_df['LEVEL2'] == 'نفت')]['1399'].values[0]) if len(rev_df[(rev_df['LEVEL1'] == 'سرمایه‌های ملی') & (rev_df['LEVEL2'] == 'نفت')]) > 0 else 0,
        },
        "expenditures": {
            "total": float(exp_df[exp_df['LEVEL'] == 0]['1399'].sum()) if len(exp_df[exp_df['LEVEL'] == 0]) > 0 else float(exp_df['1399'].sum())
        }
    }
    
    with open('../data/processed/budget_1399_from_csv.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 80)
    print("SUMMARY SAVED")
    print("=" * 80)
    print(json.dumps(summary, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    analyze_revenue_1399()
    analyze_expenses_1399()
    create_summary()

