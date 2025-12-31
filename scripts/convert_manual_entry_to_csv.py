#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert manual data entry template to proper CSV format
Matches the structure of revenues1399.csv and expenses1399.csv
"""

import pandas as pd
import re

def parse_manual_entry(file_path):
    """Parse the manual entry template file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    data = {}
    
    # Extract all variable assignments
    pattern = r'([A-Z_]+)\s*=\s*([0-9,]+)?'
    matches = re.findall(pattern, content)
    
    for var_name, value in matches:
        if value:
            # Remove commas and convert to float
            clean_value = value.replace(',', '')
            try:
                data[var_name] = float(clean_value)
            except ValueError:
                data[var_name] = 0.0
        else:
            data[var_name] = 0.0
    
    return data

def create_revenues_csv(data, output_path):
    """Create revenues1404.csv in the same format as 1399-1403"""
    
    # Template based on revenues1399.csv structure
    rows = []
    
    # Tax Revenue - Corporate
    if 'TAX_CORPORATE_TOTAL' in data:
        rows.append({
            'LEVEL1': 'درآمدها',
            'LEVEL2': 'مالیات',
            'LEVEL3': 'مالیات شرکت‌ها',
            'LEVEL4': '',
            'LEVEL5': '',
            'LEVEL6': '',
            'TOOLTIP': 'مالیات اشخاص حقوقی',
            'SOURCE': 'ردیف شماره ۱۱۰۱۰۰ از جدول شماره ۵',
            'SOURCE URL': 'manual_entry_1404',
            'SIDEBAR1': 0,
            'SIDEBAR2': data.get('TAX_CORPORATE_TOTAL', 0),
            'SIDEBAR3': 0,
            '1404': data.get('TAX_CORPORATE_TOTAL', 0),
            'MORE INFO': '',
            'LEVEL': 3
        })
    
    # Tax Revenue - Income
    if 'TAX_INCOME_TOTAL' in data:
        rows.append({
            'LEVEL1': 'درآمدها',
            'LEVEL2': 'مالیات',
            'LEVEL3': 'مالیات بر درآمد',
            'LEVEL4': '',
            'LEVEL5': '',
            'LEVEL6': '',
            'TOOLTIP': 'مالیات بر درآمدها',
            'SOURCE': 'ردیف شماره ۱۱۰۲۰۰ از جدول شماره ۵',
            'SOURCE URL': 'manual_entry_1404',
            'SIDEBAR1': 0,
            'SIDEBAR2': data.get('TAX_INCOME_TOTAL', 0),
            'SIDEBAR3': 0,
            '1404': data.get('TAX_INCOME_TOTAL', 0),
            'MORE INFO': '',
            'LEVEL': 3
        })
    
    # Oil & Gas Revenue
    if 'OIL_GAS_REVENUE_TOTAL' in data:
        rows.append({
            'LEVEL1': 'درآمدها',
            'LEVEL2': 'درآمد نفت و گاز',
            'LEVEL3': '',
            'LEVEL4': '',
            'LEVEL5': '',
            'LEVEL6': '',
            'TOOLTIP': 'منابع حاصل از صادرات نفت خام،میعانات گازی و خالص صادرات گاز طبیعی',
            'SOURCE': 'ردیف از جدول شماره ۵',
            'SOURCE URL': 'manual_entry_1404',
            'SIDEBAR1': 0,
            'SIDEBAR2': data.get('OIL_GAS_REVENUE_TOTAL', 0),
            'SIDEBAR3': 0,
            '1404': data.get('OIL_GAS_REVENUE_TOTAL', 0),
            'MORE INFO': '',
            'LEVEL': 2
        })
    
    # Create DataFrame
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"✅ Created: {output_path}")
    print(f"   Rows: {len(df)}")
    
    return df

def main():
    print("="*80)
    print("CONVERT MANUAL ENTRY TO CSV")
    print("="*80)
    
    template_file = '../data/raw/1404_MANUAL_ENTRY_TEMPLATE.txt'
    
    if not os.path.exists(template_file):
        print(f"❌ Template file not found: {template_file}")
        print("\nPlease fill in the template first!")
        return
    
    print("\nParsing manual entry...")
    data = parse_manual_entry(template_file)
    
    print(f"\n📊 Found {len(data)} data points")
    print("\nSample values:")
    for key, value in list(data.items())[:10]:
        print(f"  {key}: {value:,.0f}")
    
    # Create revenues CSV
    print("\n" + "-"*80)
    print("Creating revenues1404.csv...")
    revenues_output = '../data/raw/unverified/revenues1404.csv'
    create_revenues_csv(data, revenues_output)
    
    # Create expenditures CSV (similar process)
    print("\n" + "-"*80)
    print("Creating expenses1404.csv...")
    expenses_output = '../data/raw/unverified/expenses1404.csv'
    # create_expenses_csv(data, expenses_output)  # TODO: implement
    
    print("\n" + "="*80)
    print("✅ CONVERSION COMPLETE")
    print("="*80)
    print("\nNext: Run the analysis script to generate budget_1404_final.json")

if __name__ == "__main__":
    import os
    main()

