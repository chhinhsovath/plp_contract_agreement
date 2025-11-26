# Nginx Reverse Proxy Setup Guide

## Overview
This guide helps you configure Nginx to serve the PLP Contract Agreement application at:
- **New URL**: `https://plp-tms.moeys.gov.kh/agreement`
- **Existing URL preserved**: `https://plp-tms.moeys.gov.kh` (port 3030)

## What This Setup Does

### Before Setup
- `https://plp-tms.moeys.gov.kh` → Existing app (port 3030)
- `http://192.168.155.122:5050` → Contract agreement app (direct access)

### After Setup
- `https://plp-tms.moeys.gov.kh` → Existing app (port 3030) **[UNCHANGED]**
- `https://plp-tms.moeys.gov.kh/agreement` → Contract agreement app (port 5050) **[NEW]**
- `http://192.168.155.122:5050` → Still accessible (optional: can be blocked)

## Prerequisites

1. **Server access**: SSH access to `192.168.155.122`
2. **Port 5050 app running**: Verify with `pm2 status`
3. **Nginx installed**: Usually already configured for `plp-tms.moeys.gov.kh`
4. **Sudo privileges**: Required to modify Nginx config

## Implementation Steps

### Step 1: Deploy Updated Application

The application has been updated with `basePath: '/agreement'` in Next.js configuration.

```bash
# On your local machine
cd /Users/chhinhsovath/Documents/GitHub/plp-contract-agreement
./deploy.sh
```

Wait for deployment to complete and verify the app is running on port 5050:
```bash
ssh admin_moeys@192.168.155.122 'pm2 status'
```

### Step 2: Copy Setup Script to Server

```bash
# From your local machine
scp setup-nginx-proxy.sh admin_moeys@192.168.155.122:~/
```

### Step 3: SSH to Server and Run Setup

```bash
# SSH to server
ssh admin_moeys@192.168.155.122

# Navigate to home directory
cd ~

# Make script executable (if not already)
chmod +x setup-nginx-proxy.sh

# Run the setup script
./setup-nginx-proxy.sh
```

### Step 4: Follow Script Prompts

The script will:
1. ✅ Find your Nginx configuration file
2. ✅ Create a backup (e.g., `/etc/nginx/sites-available/plp-tms.backup-20251126-183000`)
3. ✅ Show you the current configuration
4. ✅ Show you the proposed new configuration
5. ❓ Ask for your confirmation: Type `yes` to proceed
6. ✅ Apply the configuration
7. ✅ Test Nginx configuration (`nginx -t`)
8. ✅ Reload Nginx if test passes
9. ✅ Rollback automatically if test fails

### Step 5: Verify Setup

After successful setup, test the new routes:

```bash
# Test from server (should return HTML)
curl http://localhost:5050/agreement

# Test through Nginx (should return HTML)
curl http://localhost/agreement

# Test HTTPS (from your browser)
# Visit: https://plp-tms.moeys.gov.kh/agreement
```

### Step 6: Test Your Existing App

**IMPORTANT**: Verify your existing app still works:

```bash
# From your browser
https://plp-tms.moeys.gov.kh
```

It should load your existing application on port 3030 without any changes.

## What Gets Added to Nginx Config

The script adds this location block to your Nginx configuration:

```nginx
# Agreement app (port 5050) - /agreement path
# Note: Next.js handles /agreement prefix with basePath config
location /agreement {
    proxy_pass http://192.168.155.122:5050;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_cache_bypass $http_upgrade;
    proxy_redirect off;
}
```

## Rollback Instructions

If something goes wrong, you can easily rollback:

### Automatic Rollback
The script automatically rolls back if `nginx -t` fails.

### Manual Rollback

```bash
# SSH to server
ssh admin_moeys@192.168.155.122

# Find your backup file
ls -la /etc/nginx/sites-available/*.backup-*

# Restore from backup (replace with your actual backup filename)
sudo cp /etc/nginx/sites-available/plp-tms.backup-20251126-183000 /etc/nginx/sites-available/plp-tms

# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

## Troubleshooting

### Issue: 502 Bad Gateway

**Cause**: Port 5050 app is not running

**Solution**:
```bash
ssh admin_moeys@192.168.155.122
pm2 status
pm2 restart plp-contract-agreement
pm2 logs plp-contract-agreement
```

### Issue: 404 Not Found on /agreement

**Cause 1**: Nginx config not applied
```bash
# Check if location block exists
sudo cat /etc/nginx/sites-available/plp-tms | grep "location /agreement"
```

**Cause 2**: App not deployed with basePath
```bash
# Verify app is running with updated code
cd ~/plp-contract-agreement
git log -1
# Should show recent commit with next.config.js changes
```

### Issue: CSS/JS files not loading (404 on /_next/)

**Cause**: Next.js basePath not configured

**Solution**: Verify `next.config.js` has:
```javascript
basePath: '/agreement',
assetPrefix: '/agreement',
```

Then rebuild and redeploy:
```bash
cd ~/plp-contract-agreement
./deploy.sh
```

### Issue: Infinite redirect loop

**Cause**: Conflicting proxy settings

**Solution**: Check if there are multiple Nginx configs affecting this domain:
```bash
sudo grep -r "plp-tms.moeys.gov.kh" /etc/nginx/
```

### Issue: Existing app (port 3030) not working

**Cause**: Nginx configuration error

**Solution**: Check Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

If you see errors, rollback immediately:
```bash
sudo cp /etc/nginx/sites-available/plp-tms.backup-* /etc/nginx/sites-available/plp-tms
sudo nginx -t && sudo systemctl reload nginx
```

## Testing Checklist

After setup, verify all these work:

- [ ] `https://plp-tms.moeys.gov.kh` - Existing app loads normally
- [ ] `https://plp-tms.moeys.gov.kh/agreement` - Agreement app login page
- [ ] `https://plp-tms.moeys.gov.kh/agreement/login` - Login functionality
- [ ] `https://plp-tms.moeys.gov.kh/agreement/dashboard` - Dashboard after login
- [ ] `https://plp-tms.moeys.gov.kh/agreement/contracts` - Contracts page
- [ ] CSS and JavaScript files load correctly (no 404s in browser console)
- [ ] Images and static assets load correctly

## Architecture Diagram

```
Internet
    ↓
[HTTPS - plp-tms.moeys.gov.kh]
    ↓
[Nginx Reverse Proxy on 192.168.155.122]
    ↓
    ├─ "/" → http://localhost:3030 (Existing App)
    └─ "/agreement" → http://localhost:5050 (New Agreement App)
```

## Security Notes

1. **Port 5050 direct access**: Consider blocking external access to port 5050 if you only want it accessible through `/agreement` path:
   ```bash
   sudo ufw deny 5050/tcp
   sudo ufw allow 3030/tcp  # Keep existing app port open if needed
   ```

2. **SSL Certificate**: The existing SSL certificate for `plp-tms.moeys.gov.kh` will automatically cover the `/agreement` path.

3. **Backup location**: All backups are stored in `/etc/nginx/sites-available/` with `.backup-YYYYMMDD-HHMMSS` suffix.

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs plp-contract-agreement`
2. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify Nginx config syntax: `sudo nginx -t`
4. Rollback if needed: Restore from backup file

## Summary of Changes

### Files Modified Locally
- `next.config.js` - Added `basePath` and `assetPrefix`
- `setup-nginx-proxy.sh` - Created setup script

### Files Modified on Server
- `/etc/nginx/sites-available/plp-tms` (or similar) - Added `/agreement` location block

### No Changes
- Existing app on port 3030 - **Completely unchanged**
- SSL certificates - **No changes needed**
- DNS configuration - **No changes needed**
