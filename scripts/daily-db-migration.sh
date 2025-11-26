#!/bin/bash

###############################################################################
# Daily Database Migration Script
# Migrates plp_contract_agreement → ped_contract_agreement_web
# Author: Database Migration Tool
# Last Updated: 2025-11-25
###############################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database credentials
SOURCE_HOST="157.10.73.82"
SOURCE_PORT="5432"
SOURCE_DB="plp_contract_agreement"
SOURCE_USER="admin"
SOURCE_PASSWORD="P@ssw0rd"

DEST_HOST="192.168.155.122"
DEST_PORT="5432"
DEST_DB="ped_contract_agreement_web"
DEST_USER="admin_moeys"
DEST_PASSWORD="testing-123"

# Directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_DIR="$PROJECT_DIR/logs"

# Timestamp for this run
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="$BACKUP_DIR/migration_${TIMESTAMP}.sql"
LOG_FILE="$LOG_DIR/migration_${TIMESTAMP}.log"

# Create necessary directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

###############################################################################
# Helper Functions
###############################################################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$LOG_FILE"
}

###############################################################################
# Migration Steps
###############################################################################

echo ""
log "========================================="
log "DATABASE MIGRATION STARTED"
log "========================================="
log "Source: $SOURCE_HOST:$SOURCE_PORT/$SOURCE_DB"
log "Destination: $DEST_HOST:$DEST_PORT/$DEST_DB"
log "========================================="
echo ""

# Step 1: Test Source Database Connection
log "Step 1/7: Testing SOURCE database connection..."
if PGPASSWORD="$SOURCE_PASSWORD" psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -c "SELECT 'Connected' as status;" >> "$LOG_FILE" 2>&1; then
    SOURCE_TABLE_COUNT=$(PGPASSWORD="$SOURCE_PASSWORD" psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
    log_success "Source database connected. Tables found: $SOURCE_TABLE_COUNT"
else
    log_error "Failed to connect to SOURCE database"
    exit 1
fi

# Step 2: Test Destination Database Connection
log "Step 2/7: Testing DESTINATION database connection..."
if PGPASSWORD="$DEST_PASSWORD" psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -d "$DEST_DB" -c "SELECT 'Connected' as status;" >> "$LOG_FILE" 2>&1; then
    log_success "Destination database connected"
else
    log_error "Failed to connect to DESTINATION database"
    exit 1
fi

# Step 3: Create Backup from Source
log "Step 3/7: Creating database dump from SOURCE..."
log "Dump file: $DUMP_FILE"

if PGPASSWORD="$SOURCE_PASSWORD" /opt/homebrew/opt/postgresql@16/bin/pg_dump \
    -h "$SOURCE_HOST" \
    -p "$SOURCE_PORT" \
    -U "$SOURCE_USER" \
    -d "$SOURCE_DB" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    -f "$DUMP_FILE" >> "$LOG_FILE" 2>&1; then

    DUMP_SIZE=$(ls -lh "$DUMP_FILE" | awk '{print $5}')
    log_success "Database dump created successfully. Size: $DUMP_SIZE"
else
    log_error "Failed to create database dump"
    exit 1
fi

# Step 4: Get Source Row Counts (for verification)
log "Step 4/7: Getting source database statistics..."
SOURCE_ROW_COUNT=$(PGPASSWORD="$SOURCE_PASSWORD" psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -t -c "SELECT SUM(n_live_tup) FROM pg_stat_user_tables;")
log_success "Source total rows: $SOURCE_ROW_COUNT"

# Step 5: Restore to Destination
log "Step 5/7: Restoring database to DESTINATION..."
log_warning "This will DROP existing tables and recreate them..."

if PGPASSWORD="$DEST_PASSWORD" /opt/homebrew/opt/postgresql@16/bin/psql \
    -h "$DEST_HOST" \
    -p "$DEST_PORT" \
    -U "$DEST_USER" \
    -d "$DEST_DB" \
    -f "$DUMP_FILE" >> "$LOG_FILE" 2>&1; then

    log_success "Database restored successfully"
else
    log_error "Failed to restore database"
    exit 1
fi

# Step 6: Verify Destination Data
log "Step 6/7: Verifying destination database..."
DEST_TABLE_COUNT=$(PGPASSWORD="$DEST_PASSWORD" psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -d "$DEST_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
DEST_ROW_COUNT=$(PGPASSWORD="$DEST_PASSWORD" psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -d "$DEST_DB" -t -c "SELECT SUM(n_live_tup) FROM pg_stat_user_tables;")

log "Destination tables: $DEST_TABLE_COUNT"
log "Destination total rows: $DEST_ROW_COUNT"

# Verify counts match
if [ "$SOURCE_TABLE_COUNT" -eq "$DEST_TABLE_COUNT" ] && [ "$SOURCE_ROW_COUNT" -eq "$DEST_ROW_COUNT" ]; then
    log_success "Data verification PASSED - All tables and rows match!"
else
    log_error "Data verification FAILED - Counts do not match!"
    log_error "Source: $SOURCE_TABLE_COUNT tables, $SOURCE_ROW_COUNT rows"
    log_error "Destination: $DEST_TABLE_COUNT tables, $DEST_ROW_COUNT rows"
    exit 1
fi

# Step 7: Sample Data Verification
log "Step 7/7: Verifying sample data integrity..."

# Get sample user count from both databases
SOURCE_USER_COUNT=$(PGPASSWORD="$SOURCE_PASSWORD" psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -t -c "SELECT COUNT(*) FROM users;")
DEST_USER_COUNT=$(PGPASSWORD="$DEST_PASSWORD" psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -d "$DEST_DB" -t -c "SELECT COUNT(*) FROM users;")

if [ "$SOURCE_USER_COUNT" -eq "$DEST_USER_COUNT" ]; then
    log_success "Users table verified: $SOURCE_USER_COUNT records"
else
    log_error "Users table mismatch: Source=$SOURCE_USER_COUNT, Dest=$DEST_USER_COUNT"
    exit 1
fi

# Get sample contract count
SOURCE_CONTRACT_COUNT=$(PGPASSWORD="$SOURCE_PASSWORD" psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -t -c "SELECT COUNT(*) FROM contracts;")
DEST_CONTRACT_COUNT=$(PGPASSWORD="$DEST_PASSWORD" psql -h "$DEST_HOST" -p "$DEST_PORT" -U "$DEST_USER" -d "$DEST_DB" -t -c "SELECT COUNT(*) FROM contracts;")

if [ "$SOURCE_CONTRACT_COUNT" -eq "$DEST_CONTRACT_COUNT" ]; then
    log_success "Contracts table verified: $SOURCE_CONTRACT_COUNT records"
else
    log_error "Contracts table mismatch: Source=$SOURCE_CONTRACT_COUNT, Dest=$DEST_CONTRACT_COUNT"
    exit 1
fi

# Clean up old backups (keep only last 7 days)
log "Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "migration_*.sql" -type f -mtime +7 -delete 2>/dev/null || true
find "$LOG_DIR" -name "migration_*.log" -type f -mtime +7 -delete 2>/dev/null || true

###############################################################################
# Migration Complete
###############################################################################

echo ""
log_success "========================================="
log_success "DATABASE MIGRATION COMPLETED SUCCESSFULLY"
log_success "========================================="
log "Source Database: $SOURCE_DB"
log "  - Tables: $SOURCE_TABLE_COUNT"
log "  - Total Rows: $SOURCE_ROW_COUNT"
log "  - Users: $SOURCE_USER_COUNT"
log "  - Contracts: $SOURCE_CONTRACT_COUNT"
log ""
log "Destination Database: $DEST_DB"
log "  - Tables: $DEST_TABLE_COUNT"
log "  - Total Rows: $DEST_ROW_COUNT"
log "  - Users: $DEST_USER_COUNT"
log "  - Contracts: $DEST_CONTRACT_COUNT"
log ""
log "Backup File: $DUMP_FILE"
log "Log File: $LOG_FILE"
log_success "========================================="
echo ""

exit 0
