#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract all table image links from 1404 Part 2 HTML
"""

import re

html_file = '../data/raw/نسخه چاپی قانون بودجه سال 1404 كل كشور (بخش دوم).html'

print("="*80)
print("EXTRACTING TABLE LINKS FROM 1404 BUDGET (PART 2)")
print("="*80)

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all links to GIF images with table descriptions
pattern = r'<a href="(https://qavanin\.ir/[^"]+\.gif)"[^>]*>([^<]+جدول[^<]+)</a>'
matches = re.findall(pattern, content)

print(f"\nFound {len(matches)} table links:\n")

table_5_found = False

for i, (url, description) in enumerate(matches, 1):
    print(f"{i}. {description}")
    print(f"   URL: {url}")
    
    # Check if this is Table 5
    if 'جدول' in description and ('۵' in description or '5' in description or 'شماره 5' in description):
        if 'درآمد' in description or 'منابع' in description:
            print("   ⭐ THIS LOOKS LIKE TABLE 5 (REVENUES)!")
            table_5_found = True
    print()

if table_5_found:
    print("="*80)
    print("✅ TABLE 5 FOUND!")
    print("="*80)
else:
    print("="*80)
    print("⚠️  Table 5 not explicitly found in links")
    print("   The tables might be embedded differently or numbered differently")
    print("="*80)

