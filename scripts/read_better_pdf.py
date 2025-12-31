#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Read the better formatted 1399 budget PDF
"""

import sys
sys.path.insert(0, '/Users/hamidreza/Documents/AI-Projects/IranBudget/venv/lib/python3.13/site-packages')

import pdfplumber

pdf_path = '/Users/hamidreza/Documents/AI-Projects/IranBudget/data/raw/1399-betterformat.pdf'

print("="*80)
print("Reading Better Formatted 1399 Budget PDF")
print("="*80)

with pdfplumber.open(pdf_path) as pdf:
    print(f"\nTotal pages: {len(pdf.pages)}")
    
    # Extract text from first 10 pages to see structure
    print("\n" + "="*80)
    print("First 10 pages preview:")
    print("="*80)
    
    for i, page in enumerate(pdf.pages[:10], 1):
        print(f"\n--- Page {i} ---")
        text = page.extract_text()
        if text:
            # Show first 500 characters
            print(text[:500])
        
        # Check for tables
        tables = page.extract_tables()
        if tables:
            print(f"\n  ✓ Found {len(tables)} table(s) on this page")
    
    # Search for pages with "جدول" keyword
    print("\n" + "="*80)
    print("Searching for pages with 'جدول' (table):")
    print("="*80)
    
    for i, page in enumerate(pdf.pages, 1):
        text = page.extract_text()
        if text and 'جدول' in text:
            print(f"Page {i}: Contains 'جدول'")
            if 'جدول ۵' in text or 'جدول 5' in text or 'جدول شماره ۵' in text:
                print(f"  ⭐ Page {i}: FOUND TABLE 5!")

print("\n" + "="*80)

