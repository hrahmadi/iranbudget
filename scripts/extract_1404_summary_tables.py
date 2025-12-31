#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract summary tables 1-2 from 1404 budget
These are simpler tables with fewer rows, better for OCR
"""

import os
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
import re

def preprocess_for_ocr(image_path, scale=3):
    """Enhanced preprocessing for table OCR"""
    img = Image.open(image_path)
    
    # Convert to RGB
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Upscale significantly
    width, height = img.size
    img = img.resize((width * scale, height * scale), Image.Resampling.LANCZOS)
    
    # Convert to grayscale
    img = img.convert('L')
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.5)
    
    # Increase sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(2.0)
    
    return img

def extract_numbers_from_text(text):
    """Extract all numbers from OCR text"""
    # Find all number patterns (including commas)
    numbers = re.findall(r'[\d,]+', text)
    # Clean and convert
    cleaned = []
    for num in numbers:
        clean = num.replace(',', '')
        if len(clean) >= 3:  # Only numbers with 3+ digits
            cleaned.append(clean)
    return cleaned

def main():
    print("="*80)
    print("EXTRACTING SUMMARY TABLES (1-2) FROM 1404 BUDGET")
    print("="*80)
    
    gif_dir = '../data/raw/1404gifs'
    output_dir = '../data/processed'
    
    # Process Table 1 - Overall Budget Summary
    print("\n📊 TABLE 1: Overall Budget Summary")
    print("-"*80)
    
    table1_path = os.path.join(gif_dir, 'table1.gif')
    if os.path.exists(table1_path):
        img = preprocess_for_ocr(table1_path)
        
        # Try OCR
        text = pytesseract.image_to_string(img, lang='fas+eng', config='--psm 6')
        
        # Save raw output
        with open(os.path.join(output_dir, 'table1_ocr.txt'), 'w', encoding='utf-8') as f:
            f.write(text)
        
        print("Raw OCR output (first 800 chars):")
        print(text[:800])
        
        # Extract numbers
        numbers = extract_numbers_from_text(text)
        print(f"\n📊 Found {len(numbers)} large numbers:")
        print(f"   {numbers[:15]}")
    
    # Process Table 2 - Revenue & Expenditure Summary
    print("\n\n📊 TABLE 2: Revenue & Expenditure Summary")
    print("-"*80)
    
    table2_path = os.path.join(gif_dir, 'table2.gif')
    if os.path.exists(table2_path):
        img = preprocess_for_ocr(table2_path)
        
        # Try OCR
        text = pytesseract.image_to_string(img, lang='fas+eng', config='--psm 6')
        
        # Save raw output
        with open(os.path.join(output_dir, 'table2_ocr.txt'), 'w', encoding='utf-8') as f:
            f.write(text)
        
        print("Raw OCR output (first 800 chars):")
        print(text[:800])
        
        # Extract numbers
        numbers = extract_numbers_from_text(text)
        print(f"\n📊 Found {len(numbers)} large numbers:")
        print(f"   {numbers[:15]}")
    
    print("\n\n" + "="*80)
    print("SUMMARY:")
    print("="*80)
    print("✅ OCR attempted on Tables 1-2")
    print("✅ Raw output saved to data/processed/")
    print("\nNOTE: OCR quality may vary. Please review the output files.")
    print("Next: Creating manual data entry template for detailed Table 5...")

if __name__ == "__main__":
    main()

