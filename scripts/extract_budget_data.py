#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract key budget metrics from Iran Budget 1399
"""

import re
import json

def load_decoded_text():
    """Load the decoded budget text"""
    with open('1399_budget_decoded.txt', 'r', encoding='utf-8') as f:
        return f.read()

def find_numbers_with_context(text, keyword, context_chars=300):
    """
    Find all occurrences of a keyword and extract nearby numbers
    """
    results = []
    
    # Find keyword occurrences
    pattern = f'.{{{0},{context_chars}}}{re.escape(keyword)}.{{{0},{context_chars}}}'
    matches = re.finditer(pattern, text, re.IGNORECASE)
    
    for match in matches:
        context = match.group()
        
        # Extract numbers in various formats
        # Format 1: (000 /000 /371 /534 /266 /20) - Persian budget format
        nums1 = re.findall(r'\([\d\s/]+\)', context)
        
        # Format 2: ۱۲۳۴۵ - Persian-Indic numerals
        persian_nums = re.findall(r'[۰-۹]+', context)
        
        # Format 3: 123456 - Arabic numerals
        arabic_nums = re.findall(r'\d[\d\s,/]*\d', context)
        
        results.append({
            'keyword': keyword,
            'context': context.strip(),
            'numbers_parentheses': nums1,
            'numbers_persian': persian_nums,
            'numbers_arabic': arabic_nums
        })
    
    return results

def convert_persian_to_arabic(persian_num):
    """Convert Persian-Indic digits to Arabic numerals"""
    persian_digits = '۰۱۲۳۴۵۶۷۸۹'
    arabic_digits = '0123456789'
    
    trans_table = str.maketrans(persian_digits, arabic_digits)
    return persian_num.translate(trans_table)

def parse_budget_number(num_str):
    """
    Parse budget number in format (000 /000 /371 /534 /266 /20)
    to actual number 20,266,534,371,000,000
    """
    # Remove parentheses and spaces
    clean = num_str.replace('(', '').replace(')', '').replace(' ', '').replace('/', '')
    # Reverse the number (it's written right-to-left)
    reversed_num = clean[::-1]
    return reversed_num

def extract_budget_metrics(text):
    """
    Extract specific budget metrics we're looking for
    """
    metrics = {}
    
    # Keywords to search for
    keywords = {
        'total_budget': ['بودجه سال', 'كل كشور', 'مصارف بالغ'],
        'oil_revenue': ['درآمد نفت', 'صادرات نفت', 'نفت خام'],
        'tax_revenue': ['درآمد مالیاتی', 'مالیات', 'درآمد مالياتي'],
        'current_exp': ['هزینه جاری', 'هزينه جاري', 'هزینه‌های جاری'],
        'capital_exp': ['هزینه عمرانی', 'هزينه عمراني', 'تملك دارايي'],
        'deficit': ['کسری', 'كسري', 'كسري بودجه'],
    }
    
    print("Searching for budget metrics...\n")
    print("=" * 80)
    
    for metric_name, keyword_list in keywords.items():
        print(f"\n📊 {metric_name.upper().replace('_', ' ')}")
        print("-" * 80)
        
        for keyword in keyword_list:
            results = find_numbers_with_context(text, keyword, context_chars=400)
            
            if results:
                print(f"\n   Keyword: '{keyword}' - Found {len(results)} occurrences")
                
                for i, result in enumerate(results[:3], 1):  # Show first 3
                    print(f"\n   Match {i}:")
                    
                    # Show a compact version of context
                    ctx = ' '.join(result['context'].split())
                    if len(ctx) > 250:
                        # Find the keyword position and show around it
                        kw_pos = ctx.find(keyword)
                        if kw_pos != -1:
                            start = max(0, kw_pos - 100)
                            end = min(len(ctx), kw_pos + 150)
                            ctx = '...' + ctx[start:end] + '...'
                    
                    print(f"   Context: {ctx}")
                    
                    if result['numbers_parentheses']:
                        print(f"   Numbers (budget format): {result['numbers_parentheses'][:3]}")
                    if result['numbers_persian'][:3]:
                        print(f"   Persian numerals: {result['numbers_persian'][:3]}")
                    if result['numbers_arabic'][:3]:
                        print(f"   Arabic numerals: {result['numbers_arabic'][:3]}")
    
    print("\n" + "=" * 80)

def main():
    print("=" * 80)
    print("IRAN BUDGET 1399 - DATA EXTRACTION")
    print("=" * 80)
    
    text = load_decoded_text()
    print(f"\nLoaded text: {len(text):,} characters")
    
    # Extract metrics
    extract_budget_metrics(text)
    
    print("\n" + "=" * 80)
    print("Next: Review the output above and identify the exact values")
    print("=" * 80)

if __name__ == '__main__':
    main()

