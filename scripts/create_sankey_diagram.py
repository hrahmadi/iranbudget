#!/usr/bin/env python3
"""
Iran Budget Sankey Diagram Generator

Creates interactive Sankey diagrams showing the flow of money from revenue sources
to spending categories in Iran's national budget.

Usage:
    python create_sankey_diagram.py [--year YEAR] [--output FILE]

Options:
    --year YEAR     Generate diagram for specific year (1395-1404) or 'all' for aggregate
    --output FILE   Output filename (default: sankey_diagram.html)
    --help          Show this help message

Examples:
    python create_sankey_diagram.py --year 1404
    python create_sankey_diagram.py --year all --output budget_flows.html

Author: AI Assistant
Date: December 2025
"""

import argparse
import sys
import os
from pathlib import Path
import psycopg2
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.io as pio
import getpass

# Set default plotly template
pio.templates.default = "plotly_white"

class BudgetSankeyGenerator:
    def __init__(self, db_config):
        self.db_config = db_config
        self.connection = None

    def connect_to_database(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(**self.db_config)
            return True
        except psycopg2.OperationalError as e:
            print(f"❌ Database connection failed: {e}")
            print("Make sure PostgreSQL is running and database exists.")
            return False

    def get_budget_data(self, year=None):
        """
        Retrieve budget data for Sankey diagram

        Args:
            year: Specific year (1395-1404) or None for all years

        Returns:
            DataFrame with budget data
        """
        if year and year != 'all':
            year_filter = f"WHERE year_persian = {year}"
        else:
            year_filter = ""

        query = f"""
        SELECT
            year_persian,
            tax_total,
            oil_gas,
            revenue_other,
            current_exp,
            capital_exp,
            unclassified,
            subsidy_spending,
            revenue_total,
            expenditure_total
        FROM budget_overview
        {year_filter}
        ORDER BY year_persian
        """

        try:
            df = pd.read_sql(query, self.connection)

            if df.empty:
                print(f"❌ No data found for year {year}")
                return None

            return df

        except Exception as e:
            print(f"❌ Error retrieving data: {e}")
            return None

    def create_sankey_data(self, df, year_label=""):
        """
        Transform budget data into Sankey diagram format

        Args:
            df: DataFrame with budget data
            year_label: Label for the diagram title

        Returns:
            Dictionary with Sankey diagram data
        """
        # Aggregate data if multiple years
        if len(df) > 1:
            # Sum all years for aggregate view
            budget_data = df[['tax_total', 'oil_gas', 'revenue_other',
                            'current_exp', 'capital_exp', 'unclassified', 'subsidy_spending']].sum()
            total_revenue = df['revenue_total'].sum()
            total_expenditure = df['expenditure_total'].sum()
        else:
            # Single year data
            row = df.iloc[0]
            budget_data = pd.Series({
                'tax_total': row['tax_total'],
                'oil_gas': row['oil_gas'],
                'revenue_other': row['revenue_other'],
                'current_exp': row['current_exp'],
                'capital_exp': row['capital_exp'],
                'unclassified': row['unclassified'],
                'subsidy_spending': row['subsidy_spending']
            })
            total_revenue = row['revenue_total']
            total_expenditure = row['expenditure_total']

        # Define nodes (sources and targets)
        nodes = [
            # Revenue sources (left side)
            "Tax Revenue", "Oil & Gas Revenue", "Other Revenue",
            # Intermediate node
            "Government Budget",
            # Spending categories (right side)
            "Current Expenses", "Capital Investments", "Financial Operations", "Subsidy Spending"
        ]

        # Create node colors - matching US federal budget style
        # Revenue sources (left): shades of blue
        # Spending categories (right): shades of magenta/pink
        node_colors = [
            '#4A90E2',  # Tax Revenue: bright blue
            '#5DADE2',  # Oil & Gas Revenue: lighter blue/cyan
            '#7FB3D5',  # Other Revenue: light blue-gray
            '#D4AF37',  # Government Budget: gold/beige (central node)
            '#E91E63',  # Current Expenses: bright pink/magenta
            '#D81B60',  # Capital Investments: darker magenta
            '#C2185B',  # Financial Operations: deep magenta (debt/bond payments)
            '#AD1457'   # Subsidy Spending: darkest magenta
        ]

        # Create links (flows)
        links = []

        # Revenue sources to Government Budget
        revenue_sources = [
            ("Tax Revenue", budget_data['tax_total']),
            ("Oil & Gas Revenue", budget_data['oil_gas']),
            ("Other Revenue", budget_data['revenue_other'])
        ]

        # Government Budget to spending categories
        spending_categories = [
            ("Current Expenses", budget_data['current_exp']),
            ("Capital Investments", budget_data['capital_exp']),
            ("Financial Operations", budget_data['unclassified']),
            ("Subsidy Spending", budget_data['subsidy_spending'])
        ]

        # Create links from revenue sources to Government Budget
        for source_name, amount in revenue_sources:
            if amount > 0:  # Only include positive flows
                links.append({
                    'source': nodes.index(source_name),
                    'target': nodes.index("Government Budget"),
                    'value': amount,
                    'label': f"{amount:,.0f}"
                })

        # Create links from Government Budget to spending categories
        for target_name, amount in spending_categories:
            if amount > 0:  # Only include positive flows
                links.append({
                    'source': nodes.index("Government Budget"),
                    'target': nodes.index(target_name),
                    'value': amount,
                    'label': f"{amount:,.0f}"
                })

        # Create link colors - use neutral colors with transparency
        # Links should be subtle, nodes should be colorful
        link_colors = []
        for link in links:
            source_idx = link['source']
            target_idx = link['target']
            
            # Revenue to Budget: use light blue
            if source_idx < 3:  # Revenue sources
                link_colors.append("rgba(173, 216, 230, 0.4)")  # Light blue with transparency
            # Budget to Spending: use light pink
            else:
                link_colors.append("rgba(255, 182, 193, 0.4)")  # Light pink with transparency

        return {
            'nodes': nodes,
            'node_colors': node_colors,
            'links': links,
            'link_colors': link_colors,
            'total_revenue': total_revenue,
            'total_expenditure': total_expenditure,
            'year_label': year_label
        }

    def hex_to_rgb(self, hex_color):
        """Convert hex color to RGB tuple for RGBA"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def create_sankey_diagram(self, sankey_data, output_file="sankey_diagram.html"):
        """
        Create interactive Sankey diagram

        Args:
            sankey_data: Dictionary with Sankey diagram data
            output_file: Output filename
        """
        # Extract data
        nodes = sankey_data['nodes']
        node_colors = sankey_data['node_colors']
        links = sankey_data['links']
        link_colors = sankey_data['link_colors']
        year_label = sankey_data['year_label']

        # Create the Sankey diagram
        fig = go.Figure(data=[go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color="black", width=0.5),
                label=nodes,
                color=node_colors,
                hovertemplate='%{label}<br>Total: %{value:,.0f} billion rials<extra></extra>'
            ),
            link=dict(
                source=[link['source'] for link in links],
                target=[link['target'] for link in links],
                value=[link['value'] for link in links],
                color=link_colors,
                hovertemplate='%{source.label} → %{target.label}<br>%{value:,.0f} billion rials<extra></extra>'
            )
        )])

        # Update layout
        title_text = f"Iran National Budget Flow{year_label}"
        if sankey_data['total_revenue'] and sankey_data['total_expenditure']:
            title_text += "<br>"
            title_text += f"Total Revenue: {sankey_data['total_revenue']:,.0f} | "
            title_text += f"Total Expenditure: {sankey_data['total_expenditure']:,.0f} billion rials"

        fig.update_layout(
            title=dict(
                text=title_text,
                x=0.5,
                y=0.95,
                xanchor='center',
                yanchor='top',
                font=dict(size=16, family="Arial, sans-serif")
            ),
            font=dict(size=12, family="Arial, sans-serif"),
            margin=dict(l=50, r=50, t=100, b=50),
            height=600,
            width=1000
        )

        # Add annotations for better readability
        fig.add_annotation(
            text="Revenue Sources",
            x=0.1, y=0.9,
            xref="paper", yref="paper",
            showarrow=False,
            font=dict(size=14, color="black")
        )

        fig.add_annotation(
            text="Spending Categories",
            x=0.85, y=0.9,
            xref="paper", yref="paper",
            showarrow=False,
            font=dict(size=14, color="black")
        )

        # Save as HTML file
        fig.write_html(output_file)
        print(f"✅ Sankey diagram saved to: {output_file}")

        # Also save as PNG for quick viewing
        png_file = output_file.replace('.html', '.png')
        fig.write_image(png_file, width=1200, height=800)
        print(f"✅ PNG snapshot saved to: {png_file}")

    def create_comparison_diagrams(self, output_file="budget_comparison.html"):
        """
        Create side-by-side Sankey diagrams for comparison
        Shows recent year vs earliest year
        """
        # Get data for year 1404 (most recent) and 1395 (earliest)
        df_1404 = self.get_budget_data(1404)
        df_1395 = self.get_budget_data(1395)

        if df_1404 is None or df_1395 is None:
            print("❌ Could not retrieve data for comparison")
            return

        # Create Sankey data for both years
        sankey_1404 = self.create_sankey_data(df_1404, " (1404)")
        sankey_1395 = self.create_sankey_data(df_1395, " (1395)")

        # Create subplots
        fig = make_subplots(
            rows=1, cols=2,
            subplot_titles=["Year 1395 (2016-2017)", "Year 1404 (2025-2026)"],
            specs=[[{"type": "sankey"}, {"type": "sankey"}]]
        )

        # Add first Sankey (1395)
        fig.add_trace(go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color="black", width=0.5),
                label=sankey_1395['nodes'],
                color=sankey_1395['node_colors']
            ),
            link=dict(
                source=[link['source'] for link in sankey_1395['links']],
                target=[link['target'] for link in sankey_1395['links']],
                value=[link['value'] for link in sankey_1395['links']],
                color=sankey_1395['link_colors']
            )
        ), row=1, col=1)

        # Add second Sankey (1404)
        fig.add_trace(go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color="black", width=0.5),
                label=sankey_1404['nodes'],
                color=sankey_1404['node_colors']
            ),
            link=dict(
                source=[link['source'] for link in sankey_1404['links']],
                target=[link['target'] for link in sankey_1404['links']],
                value=[link['value'] for link in sankey_1404['links']],
                color=sankey_1404['link_colors']
            )
        ), row=1, col=2)

        # Update layout
        fig.update_layout(
            title=dict(
                text="Iran Budget Flow Comparison: 1395 vs 1404",
                x=0.5,
                y=0.95,
                xanchor='center',
                yanchor='top',
                font=dict(size=18, family="Arial, sans-serif")
            ),
            font=dict(size=10, family="Arial, sans-serif"),
            margin=dict(l=50, r=50, t=120, b=50),
            height=700,
            width=1400
        )

        # Save comparison diagram
        fig.write_html(output_file)
        print(f"✅ Comparison Sankey diagram saved to: {output_file}")

        png_file = output_file.replace('.html', '.png')
        fig.write_image(png_file, width=1400, height=700)
        print(f"✅ PNG snapshot saved to: {png_file}")

    def close_connection(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()

def main():
    parser = argparse.ArgumentParser(
        description="Generate Sankey diagrams for Iran budget data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python create_sankey_diagram.py --year 1404
  python create_sankey_diagram.py --year all --output budget_flows.html
  python create_sankey_diagram.py --compare --output comparison.html
        """
    )

    parser.add_argument(
        '--year',
        type=str,
        default='1404',
        help='Year to analyze (1395-1404) or "all" for aggregate (default: 1404)'
    )

    parser.add_argument(
        '--output',
        type=str,
        help='Output filename (default: sankey_diagram.html or budget_comparison.html for --compare)'
    )

    parser.add_argument(
        '--compare',
        action='store_true',
        help='Create comparison diagram between 1395 and 1404'
    )

    args = parser.parse_args()

    # Database configuration
    import getpass
    db_config = {
        'host': 'localhost',
        'database': 'iran_budget',
        'user': getpass.getuser(),
        'password': '',
        'port': 5432
    }

    generator = BudgetSankeyGenerator(db_config)

    try:
        if not generator.connect_to_database():
            sys.exit(1)

        if args.compare:
            # Create comparison diagram
            output_file = args.output or "budget_comparison.html"
            generator.create_comparison_diagrams(output_file)
        else:
            # Create single year or aggregate diagram
            df = generator.get_budget_data(args.year)
            if df is None:
                sys.exit(1)

            year_label = f" ({args.year})" if args.year != 'all' else " (All Years)"
            sankey_data = generator.create_sankey_data(df, year_label)

            output_file = args.output or "sankey_diagram.html"
            generator.create_sankey_diagram(sankey_data, output_file)

            # Print summary
            print(f"\n📊 Budget Summary{year_label}:")
            print(f"   Total Revenue: {sankey_data['total_revenue']:,.0f} billion rials")
            print(f"   Total Expenditure: {sankey_data['total_expenditure']:,.0f} billion rials")
    except KeyboardInterrupt:
        print("\n❌ Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)
    finally:
        generator.close_connection()

if __name__ == "__main__":
    main()
