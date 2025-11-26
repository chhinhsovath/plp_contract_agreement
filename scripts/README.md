# Database Migration Scripts

This directory contains automated scripts for daily database migration between source and destination servers.

## Available Scripts

### 1. `daily-db-migration.sh`
Main migration script that performs the complete database sync.

**What it does:**
- Tests both database connections
- Creates timestamped SQL backup from source
- Restores to destination database
- Verifies data integrity
- Cleans up old backups (7-day retention)

**Usage:**
```bash
# Run from project root
./migrate-db.sh

# Or run directly
./scripts/daily-db-migration.sh
```

### 2. `setup-daily-cron.sh`
Interactive helper to set up automatic daily migration via cron.

**Usage:**
```bash
./scripts/setup-daily-cron.sh
```

**Features:**
- Choose migration time (2 AM, 11 PM, 3 AM, or custom)
- Automatically adds cron job
- Handles existing cron jobs
- Configures logging

### 3. `setup-database.sh`
Sets up the database schema (if needed).

### 4. `test-connection-health.sh`
Tests database connection health.

---

## Quick Start

### Run Migration Once:
```bash
cd /Users/chhinhsovath/Documents/GitHub/plp-contract-agreement
./migrate-db.sh
```

### Setup Automatic Daily Migration:
```bash
./scripts/setup-daily-cron.sh
```

---

## Migration Details

**Source Database:**
- Host: 157.10.73.82
- Port: 5432
- Database: plp_contract_agreement
- User: admin

**Destination Database:**
- Host: 192.168.155.122
- Port: 5432
- Database: ped_contract_agreement_web
- User: admin_moeys

**Data Migrated:**
- 26 tables
- All schema, indexes, constraints
- All data and relationships

---

## Output Files

**Backups:** `../backups/migration_YYYYMMDD_HHMMSS.sql`
- Complete SQL dump from source
- Kept for 7 days
- Can be used for manual restore

**Logs:** `../logs/migration_YYYYMMDD_HHMMSS.log`
- Detailed execution log
- All SQL output captured
- Kept for 7 days

---

## Monitoring

### Check Last Migration:
```bash
grep "COMPLETED SUCCESSFULLY" ../logs/migration_*.log | tail -1
```

### View Latest Log:
```bash
ls -t ../logs/migration_*.log | head -1 | xargs tail -50
```

### List Backups:
```bash
ls -lh ../backups/
```

---

## Troubleshooting

### Migration Failed?

1. **Check the log:**
   ```bash
   ls -t ../logs/migration_*.log | head -1 | xargs cat
   ```

2. **Test connections:**
   ```bash
   # Source
   PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement -c "SELECT 1;"

   # Destination
   PGPASSWORD='testing-123' psql -h 192.168.155.122 -U admin_moeys -d ped_contract_agreement_web -c "SELECT 1;"
   ```

3. **Re-run migration:**
   ```bash
   ./migrate-db.sh
   ```

---

## Requirements

- PostgreSQL 16 client (`/opt/homebrew/opt/postgresql@16/bin/`)
- Network access to both database servers
- Disk space for backups (~10 MB per backup)

---

## Documentation

- **Quick Reference:** `../MIGRATION_QUICK_START.md`
- **Full Guide:** `../docs/DAILY_MIGRATION_GUIDE.md`
- **Migration History:** `../pdr/sync_db.md`

---

## Safety Features

- Pre-flight connection checks
- Timestamped backups (no overwriting)
- Data verification after migration
- Automatic cleanup (prevents disk fill)
- Detailed logging for audit trail
- Exits on first error (safe failure)

---

**Last Updated:** 2025-11-25
