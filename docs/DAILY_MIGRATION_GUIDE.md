# Daily Database Migration Guide

## Overview

This guide explains how to use the automated database migration script to sync data from the source database to the destination database daily.

**Migration Flow:**
```
Source Database (157.10.73.82)
         ↓
    pg_dump (backup)
         ↓
Destination Database (192.168.155.122)
         ↓
    Verification
```

---

## Quick Start

### Run Migration Manually

From the project root directory:

```bash
./migrate-db.sh
```

That's it! The script will:
1. Test both database connections
2. Create a timestamped backup from source
3. Restore to destination
4. Verify all data matches
5. Clean up old backups (keeps last 7 days)

---

## What Happens During Migration

### Step-by-Step Process

1. **Connection Test** - Verifies both databases are accessible
2. **Source Backup** - Creates a complete dump of the source database
3. **Statistics Collection** - Counts tables and rows for verification
4. **Destination Restore** - Restores the dump to destination (drops existing tables)
5. **Data Verification** - Compares table counts and row counts
6. **Sample Verification** - Verifies specific tables (users, contracts)
7. **Cleanup** - Removes backups older than 7 days

### Output Files

**Backups:** `backups/migration_YYYYMMDD_HHMMSS.sql`
- Full SQL dump from source database
- Kept for 7 days
- Can be used for manual restore if needed

**Logs:** `logs/migration_YYYYMMDD_HHMMSS.log`
- Detailed execution log
- Includes all SQL output
- Kept for 7 days

---

## Scheduling Daily Migration

### Option 1: macOS Cron (Recommended)

Edit your crontab:
```bash
crontab -e
```

Add this line to run daily at 2:00 AM:
```cron
0 2 * * * cd /Users/chhinhsovath/Documents/GitHub/plp-contract-agreement && ./migrate-db.sh >> logs/cron-migration.log 2>&1
```

Or run at 11:00 PM every night:
```cron
0 23 * * * cd /Users/chhinhsovath/Documents/GitHub/plp-contract-agreement && ./migrate-db.sh >> logs/cron-migration.log 2>&1
```

Verify cron job is scheduled:
```bash
crontab -l
```

### Option 2: macOS LaunchAgent (Alternative)

Create a plist file at `~/Library/LaunchAgents/com.plp.dbmigration.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.plp.dbmigration</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/chhinhsovath/Documents/GitHub/plp-contract-agreement/migrate-db.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/chhinhsovath/Documents/GitHub/plp-contract-agreement/logs/launchagent.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/chhinhsovath/Documents/GitHub/plp-contract-agreement/logs/launchagent-error.log</string>
</dict>
</plist>
```

Load the agent:
```bash
launchctl load ~/Library/LaunchAgents/com.plp.dbmigration.plist
```

### Option 3: Manual Daily Execution

Set a daily reminder and run manually:
```bash
cd /Users/chhinhsovath/Documents/GitHub/plp-contract-agreement
./migrate-db.sh
```

---

## Database Credentials

### Source Database (OLD)
- **Host:** 157.10.73.82
- **Port:** 5432
- **Database:** plp_contract_agreement
- **User:** admin
- **Password:** P@ssw0rd

### Destination Database (NEW)
- **Host:** 192.168.155.122
- **Port:** 5432
- **Database:** ped_contract_agreement_web
- **User:** admin_moeys
- **Password:** testing-123

---

## Monitoring & Verification

### Check Last Migration Status

View the latest log:
```bash
ls -lt logs/migration_*.log | head -1 | awk '{print $NF}' | xargs cat
```

Or simply:
```bash
tail -50 logs/migration_$(ls -t logs/migration_*.log | head -1 | xargs basename)
```

### View Migration Summary

Check if last migration succeeded:
```bash
grep "COMPLETED SUCCESSFULLY" logs/migration_*.log | tail -1
```

### Check Migration History

List all migrations:
```bash
ls -lh backups/migration_*.sql
```

Count migrations this month:
```bash
ls backups/migration_$(date +%Y%m)*.sql 2>/dev/null | wc -l
```

---

## Troubleshooting

### Migration Failed - Connection Error

**Symptom:** "Failed to connect to SOURCE/DESTINATION database"

**Solution:**
1. Check if database servers are running:
   ```bash
   # Test source
   PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement -c "SELECT 1;"

   # Test destination
   PGPASSWORD='testing-123' psql -h 192.168.155.122 -U admin_moeys -d ped_contract_agreement_web -c "SELECT 1;"
   ```

2. Check network connectivity:
   ```bash
   ping 157.10.73.82
   ping 192.168.155.122
   ```

3. Verify credentials in the script are correct

### Migration Failed - Version Mismatch

**Symptom:** "server version mismatch"

**Solution:**
The script uses PostgreSQL 16 client. If you get version errors:
```bash
# Check PostgreSQL 16 is installed
/opt/homebrew/opt/postgresql@16/bin/pg_dump --version

# If not installed
brew install postgresql@16
```

### Data Verification Failed

**Symptom:** "Data verification FAILED - Counts do not match"

**Solution:**
1. Check the log file for specific errors
2. Verify both databases are healthy:
   ```bash
   # Check source table counts
   PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement \
     -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

   # Check destination table counts
   PGPASSWORD='testing-123' psql -h 192.168.155.122 -U admin_moeys -d ped_contract_agreement_web \
     -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
   ```

3. Try running migration again
4. Check if source database has pending transactions

### Disk Space Issues

**Symptom:** "No space left on device"

**Solution:**
1. Check disk space:
   ```bash
   df -h
   ```

2. Clean up old backups manually:
   ```bash
   # Remove backups older than 7 days
   find backups/ -name "migration_*.sql" -type f -mtime +7 -delete

   # Remove old logs
   find logs/ -name "migration_*.log" -type f -mtime +7 -delete
   ```

### Permission Denied

**Symptom:** "Permission denied" when running script

**Solution:**
```bash
# Make scripts executable
chmod +x migrate-db.sh
chmod +x scripts/daily-db-migration.sh
```

---

## Advanced Usage

### Run Migration with Custom Timestamp

```bash
# The script automatically generates timestamps
./migrate-db.sh
```

### Restore from Specific Backup

If you need to restore from a previous backup:

```bash
# List available backups
ls -lh backups/migration_*.sql

# Restore specific backup
PGPASSWORD='testing-123' /opt/homebrew/opt/postgresql@16/bin/psql \
  -h 192.168.155.122 \
  -U admin_moeys \
  -d ped_contract_agreement_web \
  -f backups/migration_20251125_210348.sql
```

### Dry Run (Test Without Restore)

To test the backup process without actually restoring:

Comment out the restore step in `scripts/daily-db-migration.sh` (Step 5):
```bash
# Temporarily comment out this section:
# if PGPASSWORD="$DEST_PASSWORD" /opt/homebrew/opt/postgresql@16/bin/psql \
#     ...
```

### Change Backup Retention Period

Edit `scripts/daily-db-migration.sh` and modify this line:
```bash
# Keep backups for 30 days instead of 7
find "$BACKUP_DIR" -name "migration_*.sql" -type f -mtime +30 -delete
```

---

## Safety Features

1. **Timestamped Backups** - Each migration creates a unique backup file
2. **Pre-flight Checks** - Tests connections before starting
3. **Data Verification** - Compares row counts after migration
4. **Automatic Cleanup** - Removes old backups (keeps 7 days)
5. **Detailed Logging** - Every step is logged with timestamps
6. **Exit on Error** - Script stops immediately if any step fails
7. **Color-coded Output** - Easy to see success/error messages

---

## Migration Statistics

After each successful migration, you'll see:

```
✓ DATABASE MIGRATION COMPLETED SUCCESSFULLY
=========================================
Source Database: plp_contract_agreement
  - Tables: 26
  - Total Rows: 712
  - Users: 34
  - Contracts: 45

Destination Database: ped_contract_agreement_web
  - Tables: 26
  - Total Rows: 712
  - Users: 34
  - Contracts: 45

Backup File: backups/migration_20251125_210348.sql
Log File: logs/migration_20251125_210348.log
=========================================
```

---

## Notifications (Optional)

### Email Notification on Failure

Add this to the end of `migrate-db.sh`:

```bash
if [ $exit_code -ne 0 ]; then
    echo "Migration failed at $(date)" | mail -s "DB Migration Failed" your-email@example.com
fi
```

### Slack Notification (Optional)

```bash
if [ $exit_code -eq 0 ]; then
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"✅ Daily DB migration completed successfully"}' \
      YOUR_SLACK_WEBHOOK_URL
fi
```

---

## Best Practices

1. **Run during low-traffic hours** (e.g., 2:00 AM)
2. **Monitor logs regularly** - Check for warnings or errors
3. **Keep backups for at least 7 days** - In case you need to rollback
4. **Test the script** after any database schema changes
5. **Verify credentials** are up to date
6. **Check disk space** monthly to ensure backups don't fill up disk

---

## Support

If you encounter issues not covered in this guide:

1. Check the latest log file in `logs/` directory
2. Verify database credentials haven't changed
3. Test manual connection to both databases
4. Check network connectivity
5. Verify PostgreSQL 16 client is installed

---

## Changelog

### 2025-11-25
- Initial version created
- Supports PostgreSQL 16
- Automatic verification and cleanup
- Timestamped backups and logs
- 7-day retention policy
