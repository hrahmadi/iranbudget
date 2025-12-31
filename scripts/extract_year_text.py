#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generic script to extract budget data from text files
"""

import re
import json

def extract_budget_from_text(text_file, year):
    """
    Extract key budget numbers from Persian text file
    """
    
    with open(text_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    print("=" * 80)
    print(f"EXTRACTING BUDGET DATA - {year}")
    print("=" * 80)
    
    results = {
        "year": year,
        "source": "text_file",
        "extracted_numbers": []
    }
    
    # Find budget numbers in format: (000/000/000/000/000/20)
    pattern = r'\([\d\s/]+\)'
    numbers = re.findall(pattern, text)
    
    print(f"\nFound {len(numbers)} numbers in parentheses format")
    
    # Find key phrases with numbers
    keywords = [
        'بودجه کل کشور',
        'بودجه عمومی دولت',
        'منابع عمومی',
        'درآمد اختصاصی',
        'شرکت.*دولتی',
        'هزینه.*جاری',
        'هزینه.*عمرانی',
        'درآمد.*مالیات',
        'صادرات نفت',
    ]
    
    findings = {}
    
    for keyword in keywords:
        pattern = f'.{{0,300}}{keyword}.{{0,500}}'
        matches = re.findall(pattern, text, re.IGNORECASE)
        
        if matches:
            findings[keyword] = []
            for match in matches[:3]:  # First 3 occurrences
                # Extract numbers from this match
                nums = re.findall(r'\([\d\s/]+\)', match)
                if nums:
                    findings[keyword].append({
                        'context': ' '.join(match.split())[:200],
                        'numbers': nums
                    })
    
    # Display findings
    print("\n📊 KEY FINDINGS:")
    print("-" * 80)
    
    for keyword, items in findings.items():
        print(f"\n🔍 {keyword}:")
        for i, item in enumerate(items, 1):
            print(f"   {i}. {item['numbers']}")
            if len(item['context']) < 200:
                print(f"      Context: {item['context']}")
    
    # Save results
    output_file = f'../data/processed/budget_{year}_from_text.json'
    results['findings'] = findings
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 80)
    print(f"Results saved to: {output_file}")
    print("=" * 80)
    
    return results

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python extract_year_text.py <text_file> <year>")
        print("Example: python extract_year_text.py ../data/raw/1400_text.txt 1400")
    else:
        extract_budget_from_text(sys.argv[1], sys.argv[2])

