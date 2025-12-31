#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract tables from Iran Budget PDF using pdfplumber
"""

try:
    import pdfplumber
    import json
    import pandas as pd
    
    def extract_tables_from_pdf(pdf_path, output_dir='.'):
        """Extract all tables from PDF"""
        
        print("=" * 80)
        print(f"Extracting tables from: {pdf_path}")
        print("=" * 80)
        
        all_tables = []
        
        with pdfplumber.open(pdf_path) as pdf:
            print(f"\nTotal pages: {len(pdf.pages)}\n")
            
            # Check first 50 pages for tables (budget tables are usually at the beginning)
            max_pages = min(50, len(pdf.pages))
            
            for page_num, page in enumerate(pdf.pages[:max_pages], 1):
                print(f"Processing page {page_num}/{max_pages}...", end='')
                
                # Extract tables from page
                tables = page.extract_tables()
                
                if tables:
                    print(f" Found {len(tables)} table(s)")
                    
                    for table_num, table in enumerate(tables, 1):
                        if table and len(table) > 0:
                            print(f"  Table {table_num}: {len(table)} rows x {len(table[0]) if table[0] else 0} cols")
                            
                            all_tables.append({
                                'page': page_num,
                                'table_num': table_num,
                                'rows': len(table),
                                'cols': len(table[0]) if table and table[0] else 0,
                                'data': table
                            })
                            
                            # Show first few rows
                            print(f"  First row: {table[0][:3] if table[0] else 'Empty'}")
                else:
                    print(" No tables")
        
        print(f"\n" + "=" * 80)
        print(f"Total tables found: {len(all_tables)}")
        print("=" * 80)
        
        # Save all tables to JSON
        output_file = f"{output_dir}/tables_extracted.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_tables, f, ensure_ascii=False, indent=2)
        
        print(f"\nTables saved to: {output_file}")
        
        # Save each table as CSV
        for i, table_info in enumerate(all_tables[:10], 1):  # Save first 10 tables
            try:
                df = pd.DataFrame(table_info['data'])
                csv_file = f"{output_dir}/table_page{table_info['page']}_num{table_info['table_num']}.csv"
                df.to_csv(csv_file, index=False, encoding='utf-8-sig')
                print(f"  Saved: {csv_file}")
            except Exception as e:
                print(f"  Error saving table {i}: {e}")
        
        return all_tables
    
    if __name__ == '__main__':
        pdf_file = '1399.pdf'
        tables = extract_tables_from_pdf(pdf_file)
        
        print("\n" + "=" * 80)
        print("NEXT STEPS:")
        print("- Review the extracted tables in the JSON and CSV files")
        print("- Identify which table contains the budget summary")
        print("- Look for 'جدول شماره (5)' - the main revenue/expenditure table")
        print("=" * 80)

except ImportError as e:
    print("=" * 80)
    print("ERROR: pdfplumber is not installed")
    print("=" * 80)
    print("\nPlease install required packages:")
    print("  pip3 install pdfplumber pandas")
    print("\nOr run:")
    print("  pip3 install -r requirements.txt")
    print("=" * 80)

