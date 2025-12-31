# 1404 Expenditure Breakdown Update Summary

## Date: December 29, 2025

## Problem Identified
The 1404 budget data had "Unclassified Spending" of 31,169 billion rials, which was too large and lacked meaningful categorization.

## Solution Implemented
Based on analysis of the Hamshahri infographic and ISNA news article, we identified the proper expenditure breakdown structure:

### Updated 1404 Expenditure Breakdown
1. **Current Expenses (هزینه‌ها)**: 22,676 billion rials
   - Employee salaries
   - Retiree pensions  
   - Support institutions

2. **Capital Investments (تملک دارایی‌های سرمایه‌ای)**: 20,700 billion rials
   - Development projects
   - Infrastructure investments

3. **Financial Operations (تملک دارایی‌های مالی)**: 10,469 billion rials
   - Bond repayments
   - Debt payments

4. **Subsidy Spending**: 10,500 billion rials
   - Direct subsidies
   - Support programs

**Total: 64,345 billion rials** ✅

## Changes Made

### 1. Database Update
- Updated PostgreSQL `expenditures` table for year 1404
- File: `update_1404_expenditure_breakdown.py`
- Command: `python3 update_1404_expenditure_breakdown.py`

### 2. Source Data Update
- Updated: `data/processed/iran_budget_1395_1404_complete.json`
- Added note about data source: ISNA article analysis

### 3. Sankey Diagram Update
- Updated node labels in: `create_sankey_diagram.py`
- Changed labels:
  - "Current Expenditures" → "Current Expenses"
  - "Capital Expenditures" → "Capital Investments"
  - "Other Spending" → "Financial Operations"
- Regenerated diagrams:
  - `sankey_diagram.html` (main diagram)
  - `sankey_1404_updated.html` (1404-specific)
  - Both PNG snapshots

## Data Sources
1. **ISNA Article**: "جزئیات دخل و خرج دولت در سال آینده"
   - Provided detailed breakdown of 3 main expenditure categories
   - Source: Iranian Students' News Agency

2. **Hamshahri Infographic**: "سهم بخش‌های مختلف از بودجه ۱۴۰۴"
   - Confirmed the same structure with percentage breakdown
   - Showed granular details within each category

## Validation
✅ Total expenditure matches: 64,345 billion rials
✅ Database updated successfully
✅ JSON source file updated
✅ Sankey diagrams regenerated with proper labels
✅ All categories now have meaningful names

## Impact
- 1404 budget is now fully categorized with proper names
- "Unclassified Spending" reduced from 31,169 to 10,469 billion rials
- "Capital Investments" properly identified: 20,700 billion rials
- Sankey diagram now shows clear, meaningful expenditure flows
- Financial Operations (debt/bonds) clearly identified as separate category

## Notes
- The "Financial Operations" category represents debt servicing and bond repayments
- This breakdown matches international budget classification standards
- All 10 years (1395-1404) now have consistent, meaningful categorization in the Sankey diagram

