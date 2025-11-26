#!/bin/bash

###############################################################################
# Quick Database Migration Launcher
# Run this script daily to sync databases
###############################################################################

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "🔄 Starting Daily Database Migration..."
echo ""

# Run the migration script
bash "$SCRIPT_DIR/scripts/daily-db-migration.sh"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo "📁 Check logs/ directory for detailed logs"
    echo "💾 Check backups/ directory for SQL dumps"
    echo ""
else
    echo ""
    echo "❌ Migration failed with exit code: $exit_code"
    echo "📋 Check the latest log file in logs/ directory"
    echo ""
fi

exit $exit_code
