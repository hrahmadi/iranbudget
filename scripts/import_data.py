#!/usr/bin/env python3
"""
Iran Budget Database Import Script

Imports 10 years of Iranian budget data from JSON into PostgreSQL database.
Run this script after creating the database schema with create_schema.sql

Usage:
    python import_data.py

Requirements:
    - PostgreSQL database 'iran_budget' must exist
    - psycopg2-binary package installed
    - JSON data file must be available

Author: AI Assistant
Date: December 2025
"""

import json
import os
import sys
from pathlib import Path
import psycopg2
from psycopg2 import sql
import logging
from decimal import Decimal
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('import_log.txt'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class BudgetDataImporter:
    def __init__(self, db_config: Dict[str, str]):
        self.db_config = db_config
        self.connection = None
        self.data_file = Path("data/processed/iran_budget_1395_1404_complete.json")

    def connect_to_database(self) -> bool:
        """Establish database connection"""
        try:
            logger.info("Connecting to PostgreSQL database...")
            self.connection = psycopg2.connect(**self.db_config)
            self.connection.autocommit = False  # We'll manage transactions
            logger.info("✅ Database connection established")

            # Test connection
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                logger.info(f"PostgreSQL version: {version[0]}")

            return True

        except psycopg2.OperationalError as e:
            logger.error(f"❌ Database connection failed: {e}")
            logger.error("Please ensure:")
            logger.error("1. PostgreSQL is running")
            logger.error("2. Database 'iran_budget' exists")
            logger.error("3. Database credentials are correct")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error connecting to database: {e}")
            return False

    def load_json_data(self) -> Dict[str, Any]:
        """Load budget data from JSON file"""
        if not self.data_file.exists():
            raise FileNotFoundError(f"Data file not found: {self.data_file}")

        logger.info(f"Loading data from {self.data_file}...")
        with open(self.data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        logger.info(f"✅ Loaded data for {len(data)} years")
        return data

    def validate_data_structure(self, data: Dict[str, Any]) -> bool:
        """Validate that JSON data has expected structure"""
        required_fields = ['year', 'revenues', 'expenditures', 'balance']

        for year_key, year_data in data.items():
            if not all(field in year_data for field in required_fields):
                logger.error(f"❌ Missing required fields in year {year_key}")
                return False

            # Check revenues structure
            revenues = year_data['revenues']
            if 'total' not in revenues:
                logger.error(f"❌ Missing revenue total in year {year_key}")
                return False

            # Check expenditures structure
            expenditures = year_data['expenditures']
            if 'total' not in expenditures:
                logger.error(f"❌ Missing expenditure total in year {year_key}")
                return False

        logger.info("✅ Data structure validation passed")
        return True

    def insert_year_data(self, year_data: Dict[str, Any]) -> int:
        """Insert year metadata and return year_id"""
        query = """
        INSERT INTO years (year_persian, year_gregorian, currency, data_source)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (year_persian) DO UPDATE SET
            year_gregorian = EXCLUDED.year_gregorian,
            currency = EXCLUDED.currency,
            data_source = EXCLUDED.data_source,
            updated_at = CURRENT_TIMESTAMP
        RETURNING year_id;
        """

        with self.connection.cursor() as cursor:
            cursor.execute(query, (
                year_data['year'],
                year_data.get('year_gregorian', ''),
                year_data.get('currency', 'billion rials'),
                year_data.get('source', '')
            ))
            year_id = cursor.fetchone()[0]
            logger.debug(f"Inserted/updated year {year_data['year']} with ID {year_id}")
            return year_id

    def insert_revenue_data(self, year_id: int, revenues: Dict[str, Any]):
        """Insert revenue data for a year"""
        tax_breakdown = revenues.get('tax_breakdown', {})

        query = """
        INSERT INTO revenues (
            year_id, total, tax_total, oil_gas, other,
            tax_corporate, tax_individual, tax_payroll, tax_social_security
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (year_id) DO UPDATE SET
            total = EXCLUDED.total,
            tax_total = EXCLUDED.tax_total,
            oil_gas = EXCLUDED.oil_gas,
            other = EXCLUDED.other,
            tax_corporate = EXCLUDED.tax_corporate,
            tax_individual = EXCLUDED.tax_individual,
            tax_payroll = EXCLUDED.tax_payroll,
            tax_social_security = EXCLUDED.tax_social_security,
            updated_at = CURRENT_TIMESTAMP;
        """

        # Calculate 'other' revenue if not provided
        other_revenue = revenues.get('other')
        if other_revenue is None and 'total' in revenues and 'tax_total' in revenues and 'oil_gas' in revenues:
            other_revenue = revenues['total'] - revenues['tax_total'] - revenues['oil_gas']

        with self.connection.cursor() as cursor:
            cursor.execute(query, (
                year_id,
                revenues.get('total'),
                revenues.get('tax_total'),
                revenues.get('oil_gas'),
                other_revenue,
                tax_breakdown.get('corporate'),
                tax_breakdown.get('individual'),
                tax_breakdown.get('payroll'),
                tax_breakdown.get('social_security')
            ))

    def insert_expenditure_data(self, year_id: int, expenditures: Dict[str, Any]):
        """Insert expenditure data for a year"""
        query = """
        INSERT INTO expenditures (
            year_id, total, current_exp, capital_exp, unclassified, subsidy_spending
        ) VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (year_id) DO UPDATE SET
            total = EXCLUDED.total,
            current_exp = EXCLUDED.current_exp,
            capital_exp = EXCLUDED.capital_exp,
            unclassified = EXCLUDED.unclassified,
            subsidy_spending = EXCLUDED.subsidy_spending,
            updated_at = CURRENT_TIMESTAMP;
        """

        with self.connection.cursor() as cursor:
            cursor.execute(query, (
                year_id,
                expenditures.get('total'),
                expenditures.get('current'),
                expenditures.get('capital'),
                expenditures.get('unclassified'),
                expenditures.get('subsidy_spending')
            ))

    def insert_balance_data(self, year_id: int, balance: Dict[str, Any]):
        """Insert balance data for a year"""
        query = """
        INSERT INTO budget_balance (year_id, surplus_deficit, status)
        VALUES (%s, %s, %s)
        ON CONFLICT (year_id) DO UPDATE SET
            surplus_deficit = EXCLUDED.surplus_deficit,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP;
        """

        with self.connection.cursor() as cursor:
            cursor.execute(query, (
                year_id,
                balance.get('surplus_deficit'),
                balance.get('status')
            ))

    def validate_totals(self) -> bool:
        """Validate that revenue and expenditure totals match expectations"""
        logger.info("Validating data integrity...")

        query = """
        SELECT
            y.year_persian,
            r.total as revenue_total,
            e.total as expenditure_total,
            b.surplus_deficit,
            (e.total - r.total) as calculated_deficit
        FROM years y
        LEFT JOIN revenues r ON y.year_id = r.year_id
        LEFT JOIN expenditures e ON y.year_id = e.year_id
        LEFT JOIN budget_balance b ON y.year_id = b.year_id
        ORDER BY y.year_persian;
        """

        with self.connection.cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()

        issues_found = 0
        for row in results:
            year, rev_total, exp_total, reported_deficit, calculated_deficit = row

            # Check if totals exist
            if rev_total is None or exp_total is None:
                logger.warning(f"⚠️  Year {year}: Missing revenue or expenditure total")
                issues_found += 1
                continue

            # Check if calculated balance matches reported (revenue - expenditure = surplus_deficit)
            if reported_deficit is not None and rev_total is not None and exp_total is not None:
                # Allow for small rounding differences (0.001 billion rials)
                difference = abs(reported_deficit - (rev_total - exp_total))
                if difference > 0.001:
                    logger.warning(f"⚠️  Year {year}: Balance mismatch - Reported: {reported_deficit}, Calculated: {rev_total - exp_total}")
                    issues_found += 1

        if issues_found == 0:
            logger.info("✅ Data integrity validation passed")
            return True
        else:
            logger.warning(f"⚠️  Found {issues_found} data integrity issues")
            return False

    def import_all_data(self, data: Dict[str, Any]) -> bool:
        """Import all budget data"""
        try:
            years_processed = 0
            total_years = len(data)

            logger.info(f"Starting import of {total_years} years...")

            for year_key, year_data in sorted(data.items()):
                logger.info(f"Processing year {year_data['year']} ({years_processed + 1}/{total_years})...")

                # Insert year data
                year_id = self.insert_year_data(year_data)

                # Insert revenue data
                if 'revenues' in year_data:
                    self.insert_revenue_data(year_id, year_data['revenues'])

                # Insert expenditure data
                if 'expenditures' in year_data:
                    self.insert_expenditure_data(year_id, year_data['expenditures'])

                # Insert balance data
                if 'balance' in year_data:
                    self.insert_balance_data(year_id, year_data['balance'])

                years_processed += 1

            # Commit all changes
            self.connection.commit()
            logger.info(f"✅ Successfully imported {years_processed} years")

            # Validate data integrity
            return self.validate_totals()

        except Exception as e:
            logger.error(f"❌ Import failed: {e}")
            self.connection.rollback()
            return False

    def get_import_summary(self) -> Dict[str, Any]:
        """Get summary statistics of imported data"""
        queries = {
            'total_years': "SELECT COUNT(*) FROM years;",
            'total_revenue': "SELECT SUM(total) FROM revenues;",
            'total_expenditure': "SELECT SUM(total) FROM expenditures;",
            'surplus_years': "SELECT COUNT(*) FROM budget_balance WHERE status = 'surplus';",
            'deficit_years': "SELECT COUNT(*) FROM budget_balance WHERE status = 'deficit';",
            'avg_deficit': "SELECT AVG(surplus_deficit) FROM budget_balance WHERE surplus_deficit < 0;"
        }

        summary = {}
        with self.connection.cursor() as cursor:
            for key, query in queries.items():
                try:
                    cursor.execute(query)
                    result = cursor.fetchone()[0]
                    summary[key] = result
                except Exception as e:
                    logger.warning(f"Could not get {key}: {e}")
                    summary[key] = None

        return summary

    def close_connection(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")

def main():
    """Main import function"""
    print("🗄️  Iran Budget Database Import Tool")
    print("=" * 50)

    # Database configuration - adjust as needed
    import getpass
    db_config = {
        'host': 'localhost',
        'database': 'iran_budget',
        'user': getpass.getuser(),  # Use current system user
        'password': '',  # set password if required
        'port': 5432
    }

    # Allow command line override of database name
    if len(sys.argv) > 1:
        db_config['database'] = sys.argv[1]

    importer = BudgetDataImporter(db_config)

    try:
        # Step 1: Connect to database
        if not importer.connect_to_database():
            sys.exit(1)

        # Step 2: Load and validate data
        data = importer.load_json_data()
        if not importer.validate_data_structure(data):
            logger.error("❌ Data validation failed")
            sys.exit(1)

        # Step 3: Import data
        success = importer.import_all_data(data)

        if success:
            # Step 4: Show summary
            summary = importer.get_import_summary()
            print("\n📊 Import Summary:")
            print(f"   Years imported: {summary.get('total_years', 'N/A')}")
            print(f"   Total revenue: {summary.get('total_revenue', 0):.2f} billion rials")
            print(f"   Total expenditure: {summary.get('total_expenditure', 0):.2f} billion rials")
            print(f"   Surplus years: {summary.get('surplus_years', 'N/A')}")
            print(f"   Deficit years: {summary.get('deficit_years', 'N/A')}")
            if summary.get('avg_deficit'):
                print(f"   Average deficit: {summary.get('avg_deficit'):.2f} billion rials")
            print("\n✅ Import completed successfully!")
            print("You can now query the database using the example queries in example_queries.sql")

        else:
            print("\n❌ Import completed with issues. Check import_log.txt for details.")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("Import interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)
    finally:
        importer.close_connection()

if __name__ == "__main__":
    main()
