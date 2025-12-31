#!/bin/bash

# Iran Budget Database Setup Script
# This script helps set up PostgreSQL database for the Iran budget project

set -e  # Exit on any error

echo "🗄️  Iran Budget Database Setup"
echo "================================"

# Configuration - modify as needed
DB_NAME="iran_budget"
DB_USER="postgres"  # Change if using different user
DB_HOST="localhost"
DB_PORT="5432"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if PostgreSQL is installed
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client not found. Please install PostgreSQL first."
        echo "macOS: brew install postgresql"
        echo "Ubuntu: sudo apt-get install postgresql postgresql-contrib"
        exit 1
    fi

    if ! command -v pg_isready &> /dev/null; then
        print_error "pg_isready not found. Please ensure PostgreSQL is properly installed."
        exit 1
    fi
}

# Check if PostgreSQL is running
check_postgres_running() {
    if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        print_error "PostgreSQL is not running on $DB_HOST:$DB_PORT"
        echo "Please start PostgreSQL:"
        echo "macOS: brew services start postgresql"
        echo "Ubuntu: sudo systemctl start postgresql"
        echo "Or use: pg_ctl -D /usr/local/var/postgres start"
        exit 1
    fi
}

# Create database
create_database() {
    echo "Creating database '$DB_NAME'..."

    # Check if database already exists
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_warning "Database '$DB_NAME' already exists. Skipping creation."
        return 0
    fi

    # Create database
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"; then
        print_status "Database '$DB_NAME' created successfully"
    else
        print_error "Failed to create database '$DB_NAME'"
        exit 1
    fi
}

# Create schema
create_schema() {
    echo "Creating database schema..."

    if [ ! -f "create_schema.sql" ]; then
        print_error "create_schema.sql not found in current directory"
        exit 1
    fi

    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f create_schema.sql; then
        print_status "Schema created successfully"
    else
        print_error "Failed to create schema"
        exit 1
    fi
}

# Import data
import_data() {
    echo "Importing budget data..."

    if [ ! -f "import_data.py" ]; then
        print_error "import_data.py not found in current directory"
        exit 1
    fi

    if [ ! -f "data/processed/iran_budget_1395_1404_complete.json" ]; then
        print_error "Data file not found: data/processed/iran_budget_1395_1404_complete.json"
        exit 1
    fi

    if python3 import_data.py; then
        print_status "Data imported successfully"
    else
        print_error "Failed to import data"
        exit 1
    fi
}

# Verify installation
verify_installation() {
    echo "Verifying installation..."

    # Test basic query
    result=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM budget_overview;" 2>/dev/null)

    if [ $? -eq 0 ] && [ "$result" -gt 0 ]; then
        print_status "Database verification successful - $result records found"
    else
        print_error "Database verification failed"
        exit 1
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --database NAME    Database name (default: iran_budget)"
    echo "  -U, --username USER    PostgreSQL username (default: postgres)"
    echo "  -h, --host HOST        PostgreSQL host (default: localhost)"
    echo "  -p, --port PORT        PostgreSQL port (default: 5432)"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Use defaults"
    echo "  $0 -d my_budget_db -U myuser         # Custom database and user"
    echo "  $0 --host db.example.com --port 5433 # Remote database"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -U|--username)
            DB_USER="$2"
            shift 2
            ;;
        -h|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "Starting Iran Budget Database setup..."
    echo "Configuration:"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo ""

    check_postgres
    check_postgres_running
    create_database
    create_schema
    import_data
    verify_installation

    echo ""
    print_status "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review DATABASE_README.md for usage instructions"
    echo "2. Try example queries in example_queries.sql"
    echo "3. Start building your budget analysis dashboards!"
    echo ""
    echo "To connect to the database:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
}

# Run main function
main "$@"
