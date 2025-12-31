#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert 1404 Excel template to proper CSV format
Matching the structure of revenues1399.csv and expenses1399.csv
"""

import pandas as pd
import os

def read_excel_template(excel_path):
    """Read the Excel file and extract data"""
    print(f"📖 Reading Excel file: {excel_path}")
    
    # Try to read all sheets
    xls = pd.ExcelFile(excel_path)
    print(f"   Found {len(xls.sheet_names)} sheets: {xls.sheet_names}")
    
    # Read the first sheet (or specific sheet with data)
    df = pd.read_excel(excel_path, sheet_name=0)
    
    print(f"\n📊 Preview of data:")
    print(df.head(20))
    print(f"\nShape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    
    return df

def create_revenues_csv(df, output_path):
    """Create revenues1404.csv matching 1399-1403 format"""
    
    # This will need to be customized based on the actual Excel structure
    # For now, let's see what we have
    
    print(f"\n✅ Data loaded successfully")
    print(f"   Will create: {output_path}")
    
    # Save as CSV
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"✅ Created: {output_path}")
    
    return df

def main():
    print("="*80)
    print("CONVERT 1404 EXCEL TO CSV FORMAT")
    print("="*80)
    
    excel_path = '/Users/hamidreza/Documents/AI-Projects/IranBudget/data/raw/Iran_Budget_Table_5_1404_Template.xlsx'
    
    if not os.path.exists(excel_path):
        print(f"❌ Excel file not found: {excel_path}")
        return
    
    # Read Excel
    df = read_excel_template(excel_path)
    
    # Create output directory
    output_dir = '../data/raw/unverified'
    os.makedirs(output_dir, exist_ok=True)
    
    # Create revenues CSV
    output_path = os.path.join(output_dir, 'revenues1404.csv')
    create_revenues_csv(df, output_path)
    
    print("\n" + "="*80)
    print("NEXT STEPS:")
    print("="*80)
    print("1. Review the CSV structure")
    print("2. Map fields to match 1399-1403 format if needed")
    print("3. Run analysis script to generate budget_1404_final.json")

if __name__ == "__main__":
    main()

