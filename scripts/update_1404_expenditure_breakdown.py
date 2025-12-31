#!/usr/bin/env python3
"""
Update 1404 expenditure breakdown in the database
Based on ISNA article analysis showing proper categorization
"""

import json
import psycopg2
from psycopg2.extras import execute_values
import getpass

# Database connection parameters (same as import_data.py)
DB_PARAMS = {
    'host': 'localhost',
    'database': 'iran_budget',
    'user': getpass.getuser(),  # Use current system user
    'password': '',  # set password if required
    'port': 5432
}

def update_1404_breakdown():
    """
    Update 1404 expenditure breakdown with proper categories
    Based on ISNA article:
    - Current Expenses (هزینه‌ها): 22,676 trillion rials (22,676,000 in DB units)
    - Capital Investments (تملک سرمایه‌ای): 20,700 trillion rials (20,700,000 in DB units)
    - Financial Operations (تملک مالی): 10,469 trillion rials (10,469,000 in DB units)
    - Subsidy Spending: 10,500 trillion rials (10,500,000 in DB units)
    Total: 64,345 trillion rials
    
    Note: Database stores values in thousands (1000 = 1 billion rials)
    """
    
    conn = None
    cur = None
    
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()
        
        print("Updating 1404 expenditure breakdown...")
        
        # Update expenditures table for year 1404
        # Values are in thousands (database unit: thousand billion rials = trillion rials)
        update_query = """
        UPDATE expenditures
        SET 
            current_exp = 22676000,
            capital_exp = 20700000,
            subsidy_spending = 10500000,
            unclassified = 10469000
        WHERE year_id = (SELECT year_id FROM years WHERE year_persian = 1404);
        """
        
        cur.execute(update_query)
        
        # Verify the update
        verify_query = """
        SELECT 
            y.year_persian,
            e.current_exp,
            e.capital_exp,
            e.subsidy_spending,
            e.unclassified,
            (e.current_exp + e.capital_exp + e.subsidy_spending + e.unclassified) as total
        FROM expenditures e
        JOIN years y ON e.year_id = y.year_id
        WHERE y.year_persian = 1404;
        """
        
        cur.execute(verify_query)
        result = cur.fetchone()
        
        if result:
            print("\n✅ 1404 Expenditure Breakdown Updated:")
            print(f"   Year: {result[0]}")
            print(f"   Current Expenses: {result[1]/1000:,.1f} trillion rials ({result[1]:,.0f} DB units)")
            print(f"   Capital Investments: {result[2]/1000:,.1f} trillion rials ({result[2]:,.0f} DB units)")
            print(f"   Subsidy Spending: {result[3]/1000:,.1f} trillion rials ({result[3]:,.0f} DB units)")
            print(f"   Financial Operations: {result[4]/1000:,.1f} trillion rials ({result[4]:,.0f} DB units)")
            print(f"   Total: {result[5]/1000:,.1f} trillion rials ({result[5]:,.0f} DB units)")
        
        # Also update the source JSON file for consistency
        json_file = '/Users/hamidreza/Documents/AI-Projects/IranBudget/data/processed/iran_budget_1395_1404_complete.json'
        
        with open(json_file, 'r', encoding='utf-8') as f:
            budget_data = json.load(f)
        
        # Find and update 1404 entry (budget_data is a list of year objects)
        for year_data in budget_data:
            # Check if this is the 1404 entry
            if isinstance(year_data, dict) and year_data.get('year') == 1404:
                if 'expenditures' in year_data and isinstance(year_data['expenditures'], dict):
                    year_data['expenditures']['current_exp'] = 22676000
                    year_data['expenditures']['capital_exp'] = 20700000
                    year_data['expenditures']['subsidy_spending'] = 10500000
                    year_data['expenditures']['unclassified'] = 10469000
                    
                    # Add a note about the breakdown
                    if 'notes' not in year_data:
                        year_data['notes'] = {}
                    year_data['notes']['expenditure_breakdown'] = (
                        "Updated based on ISNA article: "
                        "Current (22.7T), Capital (20.7T), Financial Ops (10.5T), Subsidies (10.5T)"
                    )
                break
        
        # Save updated JSON
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(budget_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Updated source JSON file: {json_file}")
        
        # Commit changes
        conn.commit()
        print("\n✅ Database updated successfully!")
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    update_1404_breakdown()

