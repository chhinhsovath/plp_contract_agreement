# Connection Pooling Optimization - Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites:
- ✅ Vercel account with access to project
- ✅ Git repository up to date
- ✅ All changes committed

### Step 1: Update Vercel Environment Variable

**Via Vercel Dashboard**:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `plp-contract-agreement`
3. Go to Settings → Environment Variables
4. Find `DATABASE_URL` variable
5. Click Edit
6. Update value to:

```
postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10
```

7. Select environments: Production, Preview, Development
8. Click Save

**Via Vercel CLI** (Alternative):

```bash
vercel env add DATABASE_URL production
# When prompted, paste the full DATABASE_URL with connection parameters
```

### Step 2: Deploy Changes

**Option A: Git Push (Recommended)**

```bash
# Commit all changes
git add .
git commit -m "feat: Implement comprehensive database connection pooling optimization

- Enhanced Prisma client with connection management
- Added graceful shutdown handlers
- Created health check endpoint /api/health/database
- Added API wrapper utilities for connection management
- Created connection pattern checker
- Added comprehensive documentation

This implements connection_limit=10, pool_timeout=20s, connect_timeout=10s
to prevent connection pool exhaustion on Vercel serverless.

Fixes: Connection pool exhaustion risk
Implements: Real-time monitoring and health checks"

# Push to main (triggers auto-deploy)
git push origin main
```

**Option B: Vercel CLI**

```bash
# Deploy to production
vercel --prod

# Or deploy to preview first
vercel
```

### Step 3: Verify Deployment

**Wait for deployment to complete** (2-3 minutes), then:

```bash
# Test health endpoint
curl https://YOUR-VERCEL-URL.vercel.app/api/health/database

# Expected response:
# {
#   "status": "healthy",
#   "database": { "connected": true, "latency_ms": < 100 },
#   "connection_pool": { "usage_percentage": < 50 }
# }
```

**Check Vercel Deployment Logs**:
1. Go to Vercel Dashboard → Deployments
2. Click latest deployment
3. Check Function Logs for any errors
4. Look for: "Prisma disconnected gracefully" messages

### Step 4: Set Up Monitoring

**Option A: Manual Check (Immediate)**

```bash
# Check health every 5 minutes
watch -n 300 'curl -s https://YOUR-VERCEL-URL.vercel.app/api/health/database | jq'
```

**Option B: UptimeRobot (Recommended for Production)**

1. Go to [UptimeRobot](https://uptimerobot.com)
2. Add New Monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: PLP Contract DB Health
   - URL: `https://YOUR-VERCEL-URL.vercel.app/api/health/database`
   - Monitoring Interval: 5 minutes
3. Set up alerts (email, Slack, etc.)
4. Add keyword monitoring for: `"status":"healthy"`

**Option C: Vercel Cron Job**

Create file: `app/api/cron/health-monitor/route.ts`

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/health/database`
    )
    const data = await response.json()

    if (data.status === 'critical' || data.status === 'unhealthy') {
      // Send alert via email/Slack/webhook
      console.error('Database health critical:', data)
      // TODO: Implement alert notification
    }

    return NextResponse.json({ checked: true, status: data.status })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 })
  }
}
```

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/health-monitor",
    "schedule": "*/5 * * * *"
  }]
}
```

---

## 📋 Post-Deployment Checklist

### Immediate (0-1 hour):

- [ ] Health endpoint returns `status: "healthy"`
- [ ] Connection pool usage < 50%
- [ ] Database latency < 100ms
- [ ] No errors in Vercel function logs
- [ ] Test login functionality works
- [ ] Test contract creation works
- [ ] Test a few API endpoints randomly

### First 24 Hours:

- [ ] Monitor health endpoint every hour
- [ ] Check Vercel logs for connection errors
- [ ] Verify no "connection timeout" errors
- [ ] Monitor PostgreSQL connections:

```sql
SELECT count(*) as total_connections, state
FROM pg_stat_activity
WHERE datname = 'plp_contract_agreement'
GROUP BY state;
```

- [ ] Document baseline metrics:
  - Average connection pool usage: _____%
  - Average database latency: _____ms
  - Peak concurrent connections: _____

### First Week:

- [ ] Review connection pool metrics daily
- [ ] Check for any warnings in health endpoint
- [ ] Verify graceful shutdown is working (check logs)
- [ ] Ensure no connection-related incidents
- [ ] Train team on monitoring tools

---

## 🔍 Verification Tests

### Test 1: Health Endpoint

```bash
curl -s https://YOUR-VERCEL-URL.vercel.app/api/health/database | jq
```

**Expected**:
- `status`: `"healthy"`
- `database.connected`: `true`
- `database.latency_ms`: < 100
- `connection_pool.usage_percentage`: < 50

### Test 2: Login Flow

```bash
curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "077806680", "passcode": "6680"}'
```

**Expected**: Login successful (no connection errors)

### Test 3: List Contracts

```bash
curl https://YOUR-VERCEL-URL.vercel.app/api/contracts \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

**Expected**: Contracts returned (no timeout)

### Test 4: Connection Pattern Check

```bash
npm run check:connections
```

**Expected**: No critical issues found

### Test 5: Database Query (Direct)

```bash
PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'plp_contract_agreement';"
```

**Expected**: Connection count < 50

---

## 🚨 Rollback Procedure (If Issues Occur)

### If deployment causes issues:

**Step 1: Immediate Rollback**

**Via Vercel Dashboard**:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." menu → Promote to Production

**Via Vercel CLI**:
```bash
vercel rollback
```

**Step 2: Revert Environment Variable**

1. Go to Vercel → Settings → Environment Variables
2. Edit DATABASE_URL
3. Remove connection parameters:

```
postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement?schema=public
```

4. Redeploy

**Step 3: Investigate Issue**

1. Check Vercel function logs for errors
2. Check health endpoint response
3. Query database for connection issues
4. Review recent code changes

**Step 4: Fix and Redeploy**

1. Fix identified issue
2. Test locally first
3. Deploy to preview environment
4. Test preview thoroughly
5. Promote to production

---

## 📊 Success Metrics

### Week 1:

| Metric | Target | Status |
|--------|--------|--------|
| Uptime | > 99.9% | [ ] |
| Avg Connection Pool Usage | < 50% | [ ] |
| Avg Database Latency | < 50ms | [ ] |
| Connection Timeout Errors | 0 | [ ] |
| Critical Alerts | 0 | [ ] |

### Month 1:

| Metric | Target | Status |
|--------|--------|--------|
| Uptime | > 99.9% | [ ] |
| Peak Connection Pool Usage | < 75% | [ ] |
| P95 Database Latency | < 100ms | [ ] |
| Connection-Related Incidents | 0 | [ ] |
| Team Training Complete | 100% | [ ] |

---

## 🛠️ Troubleshooting Common Deployment Issues

### Issue 1: "Cannot find module '@/lib/prisma'"

**Cause**: Import path issue
**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Rebuild
npm run build
```

### Issue 2: Health endpoint returns 404

**Cause**: Route not deployed
**Solution**:
- Verify `app/api/health/database/route.ts` exists
- Check Vercel deployment logs
- Ensure no build errors
- Redeploy: `vercel --prod --force`

### Issue 3: Health endpoint shows "critical" immediately

**Cause**: Existing database connections from previous deployment
**Solution**:
```sql
-- Kill idle connections (if safe)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND datname = 'plp_contract_agreement'
  AND state_change < NOW() - INTERVAL '5 minutes';
```

### Issue 4: "Connection pool timeout" errors

**Cause**: Too many concurrent requests or slow queries
**Solution**:
1. Check `/api/health/database` - what's the usage?
2. Increase `connection_limit` to 15 temporarily
3. Identify slow queries
4. Optimize or add indexes

### Issue 5: Deployment fails with build errors

**Cause**: TypeScript errors or missing dependencies
**Solution**:
```bash
# Check build locally
npm run build

# If TypeScript errors:
npm run lint

# If missing dependencies:
npm install
```

---

## 📞 Support & Resources

### Documentation:
- **Full Guide**: `docs/DATABASE_CONNECTION_POOLING.md`
- **Quick Reference**: `docs/CONNECTION_POOLING_QUICK_REFERENCE.md`
- **Implementation Summary**: `CONNECTION_POOLING_IMPLEMENTATION_SUMMARY.md`

### Tools:
- **Health Check**: `npm run db:check-health:prod`
- **Pattern Checker**: `npm run check:connections`
- **Test Suite**: `scripts/test-connection-health.sh`

### Monitoring:
- **Health Endpoint**: `https://YOUR-VERCEL-URL.vercel.app/api/health/database`
- **Vercel Logs**: Vercel Dashboard → Deployments → Function Logs
- **Database Logs**: PostgreSQL logs on server

### Emergency Contacts:
- **Connection pool exhausted**: Follow rollback procedure
- **Database unreachable**: Check database server status
- **Critical errors**: Check Vercel logs first, then database

---

## ✅ Deployment Completion

Once all steps are complete:

1. Document deployment timestamp: __________
2. Document baseline metrics
3. Set up regular monitoring schedule
4. Brief team on new monitoring tools
5. Schedule 1-week review
6. Close deployment ticket

**Deployment completed by**: __________
**Deployment date**: 2025-10-27
**Production URL**: __________
**Health endpoint verified**: [ ]
**Monitoring set up**: [ ]
**Team briefed**: [ ]

---

**Next Steps**: Monitor for 24 hours, document any issues, schedule team training session.
