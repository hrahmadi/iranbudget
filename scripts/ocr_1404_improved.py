#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Improved OCR with image preprocessing
"""

import os
import subprocess
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

def preprocess_image(image_path, output_path):
    """Preprocess image for better OCR"""
    img = Image.open(image_path)
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize to 2x for better OCR
    width, height = img.size
    img = img.resize((width * 2, height * 2), Image.Resampling.LANCZOS)
    
    # Convert to grayscale
    img = img.convert('L')
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    
    # Sharpen
    img = img.filter(ImageFilter.SHARPEN)
    
    # Save preprocessed image
    img.save(output_path)
    print(f"✅ Preprocessed image saved: {output_path}")
    
    return output_path

def ocr_with_pytesseract(image_path):
    """Try OCR with pytesseract library"""
    try:
        # Try with Persian + English
        text = pytesseract.image_to_string(
            Image.open(image_path),
            lang='fas+eng',
            config='--psm 6'
        )
        return text
    except Exception as e:
        print(f"pytesseract error: {e}")
        return None

def main():
    print("="*80)
    print("IMPROVED OCR WITH PREPROCESSING")
    print("="*80)
    
    gif_dir = '../data/raw/1404gifs'
    processed_dir = '../data/processed/preprocessed_images'
    os.makedirs(processed_dir, exist_ok=True)
    
    table5_path = os.path.join(gif_dir, 'table5.gif')
    
    if not os.path.exists(table5_path):
        print(f"❌ table5.gif not found")
        return
    
    # Preprocess
    print("\n1. Preprocessing image...")
    preprocessed_path = os.path.join(processed_dir, 'table5_processed.png')
    preprocess_image(table5_path, preprocessed_path)
    
    # Try OCR with pytesseract
    print("\n2. Running OCR with pytesseract...")
    try:
        text = ocr_with_pytesseract(preprocessed_path)
        
        if text:
            output_file = '../data/processed/table5_1404_improved_ocr.txt'
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(text)
            
            print(f"\n✅ Improved OCR saved to: {output_file}")
            print("\nFirst 1500 characters:")
            print("-"*80)
            print(text[:1500])
            print("-"*80)
    except ImportError:
        print("\n⚠️  pytesseract library not installed")
        print("Install with: pip install pytesseract")
        print("\nFalling back to command-line tesseract...")
        
        # Fallback to command line
        result = subprocess.run([
            'tesseract', 
            preprocessed_path, 
            'stdout',
            '-l', 'fas+eng',
            '--psm', '6'
        ], capture_output=True, text=True, encoding='utf-8')
        
        text = result.stdout
        output_file = '../data/processed/table5_1404_improved_ocr.txt'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"\n✅ Improved OCR saved to: {output_file}")
        print("\nFirst 1500 characters:")
        print("-"*80)
        print(text[:1500])

if __name__ == "__main__":
    main()

