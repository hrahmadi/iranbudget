#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Find budget tables in the decoded text
"""

import re

def find_tables():
    """Find all table references in the budget document"""
    
    with open('1399_budget_decoded.txt', 'r', encoding='utf-8') as f:
        text = f.read()
    
    print("=" * 80)
    print("SEARCHING FOR BUDGET TABLES")
    print("=" * 80)
    
    # Find all mentions of "جدول" (table)
    table_pattern = r'.{0,300}جدول.{0,500}'
    matches = re.findall(table_pattern, text)
    
    print(f"\nFound {len(matches)} table references\n")
    
    # Show first 20 table references
    for i, match in enumerate(matches[:20], 1):
        # Clean up whitespace
        clean = ' '.join(match.split())
        print(f"\n{i}. {clean[:400]}...")
        print("-" * 80)
    
    # Also look for specific revenue/expenditure patterns
    print("\n\n" + "=" * 80)
    print("LOOKING FOR REVENUE AND EXPENDITURE SECTIONS")
    print("=" * 80)
    
    # Search for "منابع عمومي" (general resources/revenues)
    revenue_pattern = r'.{0,200}منابع عمومي.{0,500}'
    revenue_matches = re.findall(revenue_pattern, text)
    
    print(f"\nFound {len(revenue_matches)} 'منابع عمومي' references:\n")
    for i, match in enumerate(revenue_matches[:5], 1):
        clean = ' '.join(match.split())
        print(f"{i}. {clean}")
        print()
    
    # Search for expenditure "هزينه" 
    exp_pattern = r'.{0,200}هزينه‌ها.{0,500}'
    exp_matches = re.findall(exp_pattern, text, re.IGNORECASE)
    
    print(f"\nFound {len(exp_matches)} 'هزينه' references:\n")
    for i, match in enumerate(exp_matches[:5], 1):
        clean = ' '.join(match.split())
        print(f"{i}. {clean}")
        print()

if __name__ == '__main__':
    find_tables()

