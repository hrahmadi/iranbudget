#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OCR extraction for 1404 budget tables
Extracts data from GIF images to CSV format
"""

import os
import subprocess
import re
from PIL import Image

def check_tesseract():
    """Check if Tesseract OCR is installed"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True)
        print("✅ Tesseract installed:")
        print(result.stdout.split('\n')[0])
        return True
    except FileNotFoundError:
        print("❌ Tesseract NOT installed")
        print("\nInstall with:")
        print("  macOS: brew install tesseract tesseract-lang")
        print("  Ubuntu: sudo apt-get install tesseract-ocr tesseract-ocr-fas")
        return False

def ocr_image(image_path, lang='fas+eng'):
    """Run OCR on an image file"""
    try:
        # Run tesseract
        result = subprocess.run([
            'tesseract', 
            image_path, 
            'stdout',
            '-l', lang,
            '--psm', '6'  # Assume uniform block of text
        ], capture_output=True, text=True, encoding='utf-8')
        
        return result.stdout
    except Exception as e:
        print(f"Error running OCR: {e}")
        return None

def preview_table(gif_path):
    """Preview table dimensions and basic info"""
    try:
        img = Image.open(gif_path)
        print(f"\n📊 {os.path.basename(gif_path)}")
        print(f"   Size: {img.size[0]}x{img.size[1]} pixels")
        print(f"   Mode: {img.mode}")
        return img
    except Exception as e:
        print(f"Error opening image: {e}")
        return None

def main():
    print("="*80)
    print("1404 BUDGET TABLE OCR EXTRACTION")
    print("="*80)
    
    # Check if Tesseract is installed
    if not check_tesseract():
        return
    
    gif_dir = '../data/raw/1404gifs'
    
    # Priority tables
    priority_tables = ['table5.gif', 'table7-b.gif', 'table14.gif']
    
    print("\n" + "="*80)
    print("PREVIEWING KEY TABLES")
    print("="*80)
    
    for table_name in priority_tables:
        table_path = os.path.join(gif_dir, table_name)
        if os.path.exists(table_path):
            preview_table(table_path)
        else:
            print(f"⚠️  {table_name} not found")
    
    print("\n" + "="*80)
    print("RUNNING OCR ON TABLE 5 (REVENUES)")
    print("="*80)
    
    table5_path = os.path.join(gif_dir, 'table5.gif')
    if os.path.exists(table5_path):
        print("\nExtracting text from table5.gif...")
        text = ocr_image(table5_path)
        
        if text:
            # Save raw OCR output
            output_file = '../data/processed/table5_1404_raw_ocr.txt'
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(text)
            
            print(f"\n✅ Raw OCR saved to: {output_file}")
            print("\nFirst 1000 characters:")
            print("-"*80)
            print(text[:1000])
            print("-"*80)
            
            # Look for numbers
            numbers = re.findall(r'[\d,]+', text)
            print(f"\n📊 Found {len(numbers)} numeric values")
            print(f"   Sample: {numbers[:10]}")
        else:
            print("❌ OCR failed")
    else:
        print(f"❌ table5.gif not found at {table5_path}")
    
    print("\n" + "="*80)
    print("NEXT STEPS:")
    print("="*80)
    print("1. Review the raw OCR output")
    print("2. If quality is good, I'll parse it into CSV format")
    print("3. If quality is poor, we may need to:")
    print("   - Preprocess images (enhance contrast, resize)")
    print("   - Try different OCR settings")
    print("   - Manual extraction as fallback")

if __name__ == "__main__":
    main()

