# Quick Start: Setup Nginx Reverse Proxy

## TL;DR - 5 Minute Setup

### Step 1: Deploy App (Running now in background)
```bash
# Already running - wait for completion
```

### Step 2: Copy Script to Server
```bash
scp setup-nginx-proxy.sh admin_moeys@192.168.155.122:~/
```

### Step 3: Run Setup on Server
```bash
ssh admin_moeys@192.168.155.122
./setup-nginx-proxy.sh
# Type 'yes' when prompted
```

### Step 4: Test
Visit in browser:
- ✅ `https://plp-tms.moeys.gov.kh` (existing app - must still work!)
- ✅ `https://plp-tms.moeys.gov.kh/agreement` (new agreement app)

## What Will Happen

1. **Existing app preserved**: `https://plp-tms.moeys.gov.kh` continues to work exactly as before (port 3030)
2. **New path added**: `https://plp-tms.moeys.gov.kh/agreement` now points to your contract app (port 5050)
3. **Automatic backup**: Script backs up Nginx config before making changes
4. **Automatic rollback**: If anything fails, config is restored automatically
5. **Zero downtime**: Both apps continue running during setup

## Safety Features

- ✅ Automatic backup created before changes
- ✅ Nginx config tested before applying
- ✅ Automatic rollback if test fails
- ✅ Existing app completely untouched
- ✅ Manual rollback instructions provided

## If Something Goes Wrong

The script will automatically rollback. If you need to manually rollback:

```bash
ssh admin_moeys@192.168.155.122
sudo cp /etc/nginx/sites-available/plp-tms.backup-* /etc/nginx/sites-available/plp-tms
sudo nginx -t && sudo systemctl reload nginx
```

Your existing app will continue working normally.

## Files Created

1. ✅ `next.config.js` - Updated with basePath
2. ✅ `setup-nginx-proxy.sh` - Nginx setup script
3. ✅ `NGINX_SETUP_GUIDE.md` - Detailed documentation
4. ✅ `QUICK_START.md` - This file

## Ready to Go!

Once deployment completes (check output below), follow steps 2-4 above.

Need help? Check `NGINX_SETUP_GUIDE.md` for troubleshooting.
