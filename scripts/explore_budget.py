#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to extract and analyze Iran Budget 1399 text
"""

import re
import codecs

def decode_rtf_persian(rtf_file_path):
    """
    Read RTF file and decode Persian text
    RTF uses hex codes like \'c8\'e6\'cf\'cc\'e5 for Persian
    and Unicode like \u1777 for Persian-Indic digits
    """
    # Try reading with latin-1 which is more permissive
    with open(rtf_file_path, 'r', encoding='latin-1') as f:
        content = f.read()
    
    # Decode Unicode escapes like \u1777 (Persian digits)
    def decode_unicode(match):
        code = int(match.group(1))
        return chr(code)
    
    content = re.sub(r'\\u(\d+)', decode_unicode, content)
    
    # Decode hex escapes like \'c8 (Persian letters in MacRoman/Windows-1256)
    # Try Windows-1256 encoding for Persian
    def decode_hex(match):
        hex_str = match.group(1)
        try:
            # Convert hex to bytes and decode as Windows-1256
            byte_val = int(hex_str, 16)
            return bytes([byte_val]).decode('windows-1256', errors='ignore')
        except:
            return ''
    
    content = re.sub(r"\\'([0-9a-fA-F]{2})", decode_hex, content)
    
    # Remove RTF formatting codes
    content = re.sub(r'\\[a-z]+\d*\s?', ' ', content)
    content = re.sub(r'[{}]', '', content)
    content = re.sub(r'\s+', ' ', content)
    
    return content

def extract_budget_sections(text):
    """
    Find key budget terms and their surrounding context
    """
    
    keywords = [
        'بودجه کل',
        'درآمد نفت',
        'درآمد مالیاتی',
        'مالیات',
        'هزینه جاری',
        'هزینه عمرانی',
        'کسری',
        'مازاد',
        'جمع درآمدها',
        'جمع هزینه',
        'میلیارد ریال',
        'هزار میلیارد',
    ]
    
    findings = {}
    
    for keyword in keywords:
        # Find occurrences with context (500 chars before and after)
        pattern = f'.{{0,500}}{re.escape(keyword)}.{{0,500}}'
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            findings[keyword] = matches[:5]  # Keep first 5 matches
    
    return findings

def main():
    print("=" * 70)
    print("Iran Budget 1399 Text Analysis")
    print("=" * 70)
    
    rtf_path = '1399_budget_text.rtfd/TXT.rtf'
    
    print("\n1. Reading and decoding RTF file...")
    decoded_text = decode_rtf_persian(rtf_path)
    
    # Save decoded text to a plain text file
    output_path = '1399_budget_decoded.txt'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(decoded_text)
    print(f"   ✓ Decoded text saved to: {output_path}")
    print(f"   ✓ Total characters: {len(decoded_text):,}")
    
    # Show first 2000 characters
    print("\n2. Preview of decoded text (first 2000 chars):")
    print("-" * 70)
    print(decoded_text[:2000])
    print("-" * 70)
    
    print("\n3. Searching for budget keywords...")
    findings = extract_budget_sections(decoded_text)
    
    for keyword, matches in findings.items():
        print(f"\n   📊 Found '{keyword}' ({len(matches)} occurrences shown):")
        for i, match in enumerate(matches, 1):
            # Clean up and show compact version
            clean = ' '.join(match.split())
            if len(clean) > 200:
                clean = clean[:200] + '...'
            print(f"      {i}. {clean}")
    
    print("\n" + "=" * 70)
    print("Next steps:")
    print("- Review the decoded text file: 1399_budget_decoded.txt")
    print("- Identify the structure and location of key metrics")
    print("- Build extraction patterns for each data point")
    print("=" * 70)

if __name__ == '__main__':
    main()

