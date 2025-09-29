#!/bin/bash

# Database connection details
DB_HOST="157.10.73.52"
DB_PORT="5432"
DB_USER="admin"
DB_PASSWORD="P@ssw0rd"
DB_NAME="plp_contract_agreement"

echo "Setting up database on server..."

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Create database if it doesn't exist
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully!"
else
    echo "ℹ️  Database '$DB_NAME' might already exist or there was an error."
fi

# Test connection to the new database
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT current_database();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Successfully connected to database '$DB_NAME'"
else
    echo "❌ Failed to connect to database '$DB_NAME'"
    exit 1
fi

echo ""
echo "Database setup complete! Now you can run:"
echo "  npx prisma migrate deploy"
echo "  npm run prisma:seed"

unset PGPASSWORD