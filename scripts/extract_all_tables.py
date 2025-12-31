#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract all tables from 1399 better format PDF
"""

import sys
sys.path.insert(0, '/Users/hamidreza/Documents/AI-Projects/IranBudget/venv/lib/python3.13/site-packages')

import pdfplumber
import pandas as pd
import json

pdf_path = '/Users/hamidreza/Documents/AI-Projects/IranBudget/data/raw/1399-betterformat.pdf'

print("="*80)
print("Extracting All Tables from 1399 Budget PDF")
print("="*80)

all_data = []

with pdfplumber.open(pdf_path) as pdf:
    # Extract tables from pages with tables
    for page_num in [8, 32, 33, 34]:
        page = pdf.pages[page_num - 1]
        tables = page.extract_tables()
        
        print(f"\nPage {page_num}: {len(tables)} table(s)")
        
        for t_idx, table in enumerate(tables, 1):
            if not table:
                continue
                
            # Save as CSV
            df = pd.DataFrame(table[1:], columns=table[0] if table[0] else None)
            csv_file = f'../output/table_page{page_num}_table{t_idx}.csv'
            df.to_csv(csv_file, index=False, encoding='utf-8-sig')
            print(f"  Saved: {csv_file}")
            
            # Add to collection
            all_data.append({
                'page': page_num,
                'table_num': t_idx,
                'rows': len(table),
                'cols': len(table[0]) if table and table[0] else 0,
                'data': table
            })

# Save all as JSON
with open('../output/all_tables_1399.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print("\n" + "="*80)
print(f"Extracted {len(all_data)} tables total")
print("Saved to: output/all_tables_1399.json")
print("="*80)

