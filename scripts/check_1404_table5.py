#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check if 1404.pdf contains Table 5 (جدول شماره ۵)
"""

try:
    import PyPDF2
    
    pdf_path = '../data/raw/1404.pdf'
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        total_pages = len(pdf_reader.pages)
        
        print(f"📄 Total pages in 1404.pdf: {total_pages}")
        print("="*80)
        
        table5_found = False
        revenue_table_found = False
        
        # Search for جدول شماره ۵ or جدول 5
        for i, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            
            if text:
                # Look for Table 5 references
                if 'جدول شماره ۵' in text or 'جدول شماره 5' in text or 'جدول ۵' in text:
                    print(f"\n✅ Found 'جدول ۵' on page {i+1}")
                    table5_found = True
                    
                    # Show snippet
                    lines = text.split('\n')
                    for j, line in enumerate(lines):
                        if 'جدول' in line and ('۵' in line or '5' in line):
                            start = max(0, j-2)
                            end = min(len(lines), j+10)
                            print("\nContext:")
                            print('-'*80)
                            for k in range(start, end):
                                print(lines[k])
                            print('-'*80)
                            break
                
                # Look for revenue/expenditure keywords
                if 'درآمدها' in text and ('مالیات' in text or 'نفت' in text):
                    if not revenue_table_found:
                        print(f"\n📊 Found revenue data on page {i+1}")
                        revenue_table_found = True
        
        print("\n" + "="*80)
        if table5_found:
            print("✅ SUCCESS: جدول شماره ۵ IS IN THIS PDF!")
            print("\nYou can extract data manually from this file.")
        else:
            print("⚠️  'جدول شماره ۵' not explicitly mentioned")
            if revenue_table_found:
                print("BUT: Revenue data found - tables may be present without labels")
            else:
                print("❌ This might be Part 1 only (no detailed tables)")
        
        print("\n💡 RECOMMENDATION:")
        if table5_found or revenue_table_found:
            print("   → Try extracting tables from this PDF")
            print("   → Or download the official version from:")
            print("   → https://bidbarg.net/documents/22/budget-bill-1404.pdf")
        else:
            print("   → Download the complete budget bill with tables:")
            print("   → https://bidbarg.net/documents/22/budget-bill-1404.pdf")

except ImportError:
    print("⚠️  PyPDF2 not installed. Install it with:")
    print("   pip install PyPDF2")
except Exception as e:
    print(f"❌ Error: {e}")

