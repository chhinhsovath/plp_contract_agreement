# Database Connection Pooling - Quick Reference

## 🚀 Quick Start

### Check Connection Health

```bash
# Development
curl http://localhost:3000/api/health/database

# Production
curl https://mobile.openplp.com/api/health/database
```

### Healthy Response:
```json
{
  "status": "healthy",
  "database": { "connected": true, "latency_ms": 15 },
  "connection_pool": {
    "total_connections": 12,
    "active_connections": 5,
    "usage_percentage": 12.0
  }
}
```

---

## 📊 Connection Limits

| Environment | connection_limit | pool_timeout | connect_timeout |
|-------------|------------------|--------------|-----------------|
| Development | 5 | 10s | 5s |
| Production  | 10 | 20s | 10s |
| Load Test   | 15 | 30s | 15s |

**PostgreSQL Max Connections**: Check with:
```sql
SHOW max_connections;  -- Usually 100
```

**Rule of Thumb**:
```
max_connections / connection_limit = max concurrent functions
100 / 10 = ~10 functions can run simultaneously
```

---

## ✅ Best Practices Checklist

### When Writing API Routes:

```typescript
// ✅ DO: Use singleton instance
import { prisma } from '@/lib/prisma'

// ✅ DO: Always await
const users = await prisma.users.findMany()

// ✅ DO: Use select for performance
const users = await prisma.users.findMany({
  select: { id: true, full_name: true }
})

// ✅ DO: Use include to avoid N+1
const contracts = await prisma.contracts.findMany({
  include: { contract_type: true }
})

// ✅ DO: Use transactions for multi-step operations
await withTransaction(async (tx) => {
  const user = await tx.users.create({ data: userData })
  const contract = await tx.contracts.create({ data: contractData })
  return { user, contract }
})

// ✅ DO: Batch bulk operations
await batchOperation(items, async (batch) => {
  await prisma.table.createMany({ data: batch })
}, { batchSize: 100 })
```

### Common Mistakes:

```typescript
// ❌ DON'T: Create new Prisma instance
const prisma = new PrismaClient()

// ❌ DON'T: Manually disconnect in API routes
await prisma.$disconnect()

// ❌ DON'T: Unbatched loops
for (const item of items) {
  await prisma.table.create({ data: item })  // Opens new connection each time!
}

// ❌ DON'T: Forget await
const users = prisma.users.findMany()  // Missing await!

// ❌ DON'T: Fetch unnecessary data
const users = await prisma.users.findMany()  // Gets ALL fields
```

---

## 🔧 Utilities Available

### 1. Connection Management Wrapper

```typescript
import { withConnectionManagement } from '@/lib/api-wrapper'

export const GET = withConnectionManagement(async (request) => {
  const data = await prisma.users.findMany()
  return NextResponse.json(data)
})
```

### 2. Transaction Wrapper

```typescript
import { withTransaction } from '@/lib/api-wrapper'

const result = await withTransaction(async (tx) => {
  // Your transactional operations
}, { maxWait: 5000, timeout: 30000 })
```

### 3. Batch Operations

```typescript
import { batchOperation } from '@/lib/api-wrapper'

await batchOperation(
  largeArray,
  async (batch) => {
    await prisma.table.createMany({ data: batch })
  },
  { batchSize: 100, delayBetweenBatches: 100 }
)
```

### 4. Connection Metrics Logger

```typescript
import { logConnectionMetrics } from '@/lib/api-wrapper'

await logConnectionMetrics('Before bulk insert')
// ... perform operation ...
await logConnectionMetrics('After bulk insert')
```

---

## 🚨 Troubleshooting

### Symptom: API returns "Connection pool timeout"

**Quick Fix**:
1. Check `/api/health/database` - is usage > 90%?
2. Review recent code changes - new bulk operations?
3. Check database for slow queries:

```sql
SELECT pid, now() - query_start as duration, state, query
FROM pg_stat_activity
WHERE state != 'idle'
  AND datname = 'plp_contract_agreement'
ORDER BY duration DESC
LIMIT 5;
```

**Long-term Fix**:
- Optimize slow queries
- Add indexes where needed
- Implement caching for frequently accessed data

### Symptom: "Too many connections" from PostgreSQL

**Quick Fix**:
1. Kill idle connections (if safe):

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND datname = 'plp_contract_agreement'
  AND state_change < NOW() - INTERVAL '10 minutes';
```

2. Reduce `connection_limit` in `.env`:

```env
# From this:
connection_limit=10

# To this:
connection_limit=5
```

3. Redeploy application

**Long-term Fix**:
- Implement PgBouncer connection pooler
- Review code for connection leaks
- Consider increasing PostgreSQL max_connections

### Symptom: High idle connections

**Check with**:
```bash
curl https://mobile.openplp.com/api/health/database | jq '.connection_pool'
```

**If idle > 50% of total**:
- Possible connection leak
- Check for missing `await` keywords
- Review long-running serverless functions

**Fix**:
1. Search codebase for Prisma calls without `await`:
```bash
grep -r "prisma\." --include="*.ts" | grep -v "await prisma"
```

2. Add missing `await` keywords

3. Redeploy

---

## 📈 Monitoring Commands

### Check Connection Health (Production)
```bash
watch -n 5 'curl -s https://mobile.openplp.com/api/health/database | jq'
```

### Query Active Connections (Database)
```sql
SELECT
  count(*) as total,
  state,
  application_name
FROM pg_stat_activity
WHERE datname = 'plp_contract_agreement'
GROUP BY state, application_name
ORDER BY total DESC;
```

### Check Connection Pool Usage (PostgreSQL)
```sql
SELECT
  (SELECT count(*) FROM pg_stat_activity) as current_connections,
  (SELECT setting::int FROM pg_settings WHERE name='max_connections') as max_connections,
  round(
    (SELECT count(*) FROM pg_stat_activity)::numeric /
    (SELECT setting::int FROM pg_settings WHERE name='max_connections')::numeric * 100,
    2
  ) as usage_percentage;
```

---

## ⚙️ Environment Variables

### Required in Vercel Environment Variables:

```env
DATABASE_URL="postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

### To Update in Vercel:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Edit `DATABASE_URL`
3. Add connection parameters:
   - `connection_limit=10`
   - `pool_timeout=20`
   - `connect_timeout=10`
4. Redeploy application

---

## 📱 Quick Alerts Setup

### Status Interpretation:

| Status | Usage % | Action |
|--------|---------|--------|
| `healthy` | < 75% | ✅ All good |
| `warning` | 75-90% | ⚠️ Monitor closely |
| `critical` | > 90% | 🚨 Immediate action |
| `unhealthy` | N/A | 🔥 Database down |

### Set up monitoring (Choose one):

**Option 1: UptimeRobot** (Free)
- URL: `https://mobile.openplp.com/api/health/database`
- Check every: 5 minutes
- Alert on: status != "healthy"

**Option 2: Vercel Cron** (Built-in)
```typescript
// api/cron/check-health.ts
export default async function handler(req: Request) {
  const response = await fetch('https://mobile.openplp.com/api/health/database')
  const data = await response.json()

  if (data.status === 'critical' || data.status === 'unhealthy') {
    // Send alert (email, Slack, etc.)
  }

  return new Response('OK')
}
```

---

## 🎯 Performance Targets

### Target Metrics:

| Metric | Target | Critical |
|--------|--------|----------|
| Connection Pool Usage | < 50% | > 90% |
| Database Latency | < 50ms | > 200ms |
| Active Connections | < 30 | > 80 |
| Idle Connection Ratio | < 30% | > 50% |

### If metrics exceed targets:

1. **High pool usage**: Increase `connection_limit` OR optimize queries
2. **High latency**: Add database indexes OR optimize queries
3. **Too many active**: Implement query caching
4. **High idle ratio**: Review code for connection leaks

---

## 📞 Emergency Contacts

**If connection pool is exhausted and production is down**:

1. **Immediate**: Restart Vercel deployment
2. **Quick fix**: Reduce `connection_limit` to 5 in Vercel env vars
3. **Investigation**: Check `/api/health/database` and database logs
4. **Long-term**: Follow troubleshooting guide in main documentation

**Escalation**:
- Check `docs/DATABASE_CONNECTION_POOLING.md` for detailed guide
- Review Vercel function logs for specific errors
- Query PostgreSQL for slow/blocked queries

---

**Last Updated**: 2025-10-27
**Full Documentation**: See `docs/DATABASE_CONNECTION_POOLING.md`
