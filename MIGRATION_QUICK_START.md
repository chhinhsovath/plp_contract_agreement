# Database Migration - Quick Reference Card

## Daily Migration (Run This Daily)

```bash
cd /Users/chhinhsovath/Documents/GitHub/plp-contract-agreement
./migrate-db.sh
```

**That's it!** The script will automatically:
- ✅ Test connections
- ✅ Backup source database
- ✅ Restore to destination
- ✅ Verify all data matches
- ✅ Clean up old backups (keeps 7 days)

---

## What Gets Migrated

**FROM:** 157.10.73.82:5432/plp_contract_agreement
**TO:** 192.168.155.122:5432/ped_contract_agreement_web

- 26 tables
- All data, indexes, constraints
- Complete schema structure

---

## Quick Status Checks

### Check if last migration succeeded:
```bash
grep "COMPLETED SUCCESSFULLY" logs/migration_*.log | tail -1
```

### View latest log:
```bash
ls -t logs/migration_*.log | head -1 | xargs tail -50
```

### Check backup files:
```bash
ls -lh backups/
```

---

## Schedule Daily Automatic Migration

### Option 1: Easy Setup (Recommended)
Run the automated cron setup helper:
```bash
./scripts/setup-daily-cron.sh
```
This interactive script will help you choose a time and set up the cron job automatically.

### Option 2: Manual Cron Setup (Every day at 2:00 AM)
```bash
crontab -e
```

Add this line:
```
0 2 * * * cd /Users/chhinhsovath/Documents/GitHub/plp-contract-agreement && ./migrate-db.sh >> logs/cron-migration.log 2>&1
```

### Option 3: Run manually at your preferred time
Just run `./migrate-db.sh` whenever you want to sync the databases.

---

## Troubleshooting

### Migration Failed?

1. **Check the log file:**
   ```bash
   ls -t logs/migration_*.log | head -1 | xargs cat
   ```

2. **Test connections manually:**
   ```bash
   # Source database
   PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement -c "SELECT 1;"

   # Destination database
   PGPASSWORD='testing-123' psql -h 192.168.155.122 -U admin_moeys -d ped_contract_agreement_web -c "SELECT 1;"
   ```

3. **Re-run the migration:**
   ```bash
   ./migrate-db.sh
   ```

---

## Important Notes

- ⚠️ **Destination database will be completely overwritten** each time you run the script
- 💾 **Backups are kept for 7 days** - older backups are automatically deleted
- 📋 **Logs are kept for 7 days** - check them if something goes wrong
- ⏱️ **Migration takes ~45 seconds** to complete
- ✅ **Data verification is automatic** - script will fail if data doesn't match

---

## Files & Directories

- `migrate-db.sh` - Main script you run daily
- `scripts/daily-db-migration.sh` - Detailed migration logic
- `backups/` - SQL dump files (kept 7 days)
- `logs/` - Detailed migration logs (kept 7 days)
- `docs/DAILY_MIGRATION_GUIDE.md` - Full documentation

---

## Need Help?

Full documentation: `docs/DAILY_MIGRATION_GUIDE.md`

Common issues and solutions are documented there.

---

## Migration Summary (After Each Run)

After each successful migration, you'll see:

```
✅ Migration completed successfully!
📁 Check logs/ directory for detailed logs
💾 Check backups/ directory for SQL dumps
```

With details like:
```
Source Database: plp_contract_agreement
  - Tables: 26
  - Total Rows: 692
  - Users: 34
  - Contracts: 45

Destination Database: ped_contract_agreement_web
  - Tables: 26
  - Total Rows: 692
  - Users: 34
  - Contracts: 45
```

---

**Last Updated:** 2025-11-25
**Script Version:** 1.0
