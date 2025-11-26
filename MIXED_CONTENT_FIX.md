# Mixed Content Error - Fix Documentation

## Problem Identified

Your application at `mel.openplp.org` is experiencing a **Mixed Content Error**:

```
Blocked loading mixed active content "http://192.168.155.122:5850/api/api/session"
```

### Root Causes:

1. **Mixed HTTPS/HTTP**: Site served over HTTPS trying to load HTTP resources (blocked by browser)
2. **Wrong Port**: Using port 5850 instead of correct port 5050
3. **Double `/api/` Path**: URL shows `/api/api/session` instead of `/api/session`
4. **Incorrect Environment Variable**: Production NEXT_PUBLIC_API_URL set to wrong value

## Solution Applied

### 1. Created `.env.production` File

A new production environment file with corrected settings:

```bash
NEXT_PUBLIC_API_URL=""  # Empty = use relative paths (fixes mixed content)
DATABASE_URL="postgresql://admin_moeys:testing-123@192.168.155.122:5432/ped_contract_agreement_web?schema=public"
NEXTAUTH_URL="https://mel.openplp.org"
PORT=5050
NODE_ENV=production
```

**Key Fix**: `NEXT_PUBLIC_API_URL=""` 
- Empty value makes API calls use relative paths
- `/api/auth/session` becomes relative to current domain
- Works with both HTTP and HTTPS automatically
- Prevents mixed content errors

### 2. Updated Deployment Script

Modified `deploy.sh` to automatically copy `.env.production` to `.env` on the server during deployment.

### 3. How It Works

**Before (BROKEN):**
```
Browser: https://mel.openplp.org (HTTPS)
   ↓
Tries to load: http://192.168.155.122:5850/api/api/session (HTTP)
   ↓
❌ BLOCKED by browser (mixed content error)
```

**After (FIXED):**
```
Browser: https://mel.openplp.org (HTTPS)
   ↓
Loads: /api/auth/session (relative path = same protocol)
   ↓
Becomes: https://mel.openplp.org/api/auth/session (HTTPS)
   ↓
✅ SUCCESS - no mixed content
```

## Deployment Instructions

### Step 1: Commit the Changes

```bash
git add .env.production deploy.sh
git commit -m "fix: resolve mixed content error with production env config"
git push origin main
```

### Step 2: Deploy to Production

```bash
./deploy.sh "fix: resolve mixed content error"
```

This will:
1. Push changes to GitHub
2. Pull code on the server
3. Copy `.env.production` to `.env`
4. Build with correct environment variables
5. Restart the application

### Step 3: Verify the Fix

1. Open `https://mel.openplp.org` in browser
2. Open Developer Console (F12)
3. Check Console tab - should see NO mixed content errors
4. Check Network tab - all requests should be HTTPS
5. Test login/session functionality

## Expected Results

After deployment:

✅ No mixed content errors
✅ All API calls use HTTPS (or relative paths)
✅ Session endpoints work correctly
✅ Port 5050 (correct port) is used
✅ No double `/api/api/` in URLs

## Troubleshooting

### If Mixed Content Error Persists:

1. **Clear Browser Cache**:
   ```
   Hard reload: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   ```

2. **Verify Environment Variables on Server**:
   ```bash
   ssh admin_moeys@192.168.155.122
   cd /home/admin_moeys/plp_contract_agreement
   cat .env | grep NEXT_PUBLIC_API_URL
   ```
   
   Should show:
   ```
   NEXT_PUBLIC_API_URL=""
   ```

3. **Check Build Output**:
   ```bash
   ssh admin_moeys@192.168.155.122
   pm2 logs plp-contract-agreement | grep API
   ```

4. **Restart Application**:
   ```bash
   ssh admin_moeys@192.168.155.122
   cd /home/admin_moeys/plp_contract_agreement
   pm2 restart plp-contract-agreement
   ```

### If Port Issues Persist:

Check PM2 is using correct port:
```bash
ssh admin_moeys@192.168.155.122
pm2 show plp-contract-agreement | grep PORT
```

Should show: `PORT: 5050`

## Technical Details

### Why Relative Paths Work

When `NEXT_PUBLIC_API_URL=""`:
- `lib/api-client.ts` returns empty string for API_URL
- API calls become: `${API_URL}${url}` = `""` + `/api/auth/session` = `/api/auth/session`
- Browser resolves relative path to current domain
- If page is HTTPS, API call is HTTPS
- If page is HTTP, API call is HTTP

### Environment Variable Priority

1. `.env.production` (copied to `.env` during deployment)
2. `.env.local` (not committed to git)
3. `.env` (existing file)
4. Built-in defaults

## Maintenance

### Future Deployments

The deployment script now automatically:
1. Pulls latest code
2. Copies `.env.production` to `.env`
3. Rebuilds with production settings

No manual intervention needed!

### Updating Production Environment

To change production environment variables:
1. Edit `.env.production` in the repository
2. Commit and push to GitHub
3. Run `./deploy.sh`
4. Changes automatically applied

## Related Files

- `.env.production` - Production environment configuration
- `deploy.sh` - Deployment script (updated)
- `lib/api-client.ts` - API client configuration
- `MIXED_CONTENT_FIX.md` - This documentation

## Summary

**Problem**: Mixed HTTPS/HTTP content blocked by browser
**Cause**: Hardcoded HTTP URL in environment variable
**Solution**: Use relative paths (empty NEXT_PUBLIC_API_URL)
**Status**: ✅ FIXED - Ready to deploy

---

**Created**: 2025-11-26
**Issue**: Mixed Content Error on mel.openplp.org
**Resolution**: Production environment configuration
