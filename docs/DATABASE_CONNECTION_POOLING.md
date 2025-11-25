# Database Connection Pooling Optimization Guide

## Overview

This document explains the comprehensive connection pooling optimizations implemented to prevent connection exhaustion in the PLP Contract Agreement System deployed on Vercel serverless infrastructure.

## Problem Statement

### Issues Before Optimization:

1. **Connection Pool Exhaustion**: Serverless functions would exhaust database connection limits
2. **No Connection Limits**: Unlimited connections could be opened per function
3. **Connection Leaks**: Connections not properly closed on function termination
4. **No Monitoring**: No visibility into connection pool usage
5. **Serverless Cold Starts**: Each cold start created new connections without proper cleanup

### Symptoms:

- `Error: Can't reach database server`
- `Connection pool timeout`
- `Too many connections` errors from PostgreSQL
- Slow API response times
- Intermittent database connectivity issues

## Solution Architecture

### 1. Connection Pool Configuration

**File**: `.env`

```env
DATABASE_URL="postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

#### Parameters Explained:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `connection_limit` | 10 | Max connections per serverless function instance |
| `pool_timeout` | 20 | Wait 20 seconds for available connection before failing |
| `connect_timeout` | 10 | Timeout if can't connect to database within 10 seconds |

#### Why These Values?

- **connection_limit=10**: Vercel serverless functions are stateless and short-lived. Each function should use minimal connections. With 10 connections per function and ~100 max connections on PostgreSQL, this allows ~10 concurrent functions safely.

- **pool_timeout=20**: Gives enough time for busy connections to become available without hanging indefinitely.

- **connect_timeout=10**: Fails fast if database is unreachable, preventing cascading timeouts.

### 2. Enhanced Prisma Client

**File**: `lib/prisma.ts`

#### Features Implemented:

1. **Singleton Pattern**: Prevents multiple Prisma instances in development
2. **Graceful Shutdown**: Automatically disconnects on process termination
3. **Health Check Function**: `checkDatabaseConnection()` - Tests connection and measures latency
4. **Metrics Function**: `getConnectionMetrics()` - Returns real-time pool statistics

#### Key Functions:

```typescript
// Check if database is reachable
const health = await checkDatabaseConnection()
// Returns: { isConnected: boolean, latency?: number, error?: string }

// Get connection pool statistics
const metrics = await getConnectionMetrics()
// Returns: { total, active, idle, max, usage_percentage }
```

### 3. Health Check Endpoint

**Endpoint**: `GET /api/health/database`

**Purpose**: Monitor connection pool health in real-time

**Response Example**:

```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "latency_ms": 15
  },
  "connection_pool": {
    "total_connections": 12,
    "active_connections": 5,
    "idle_connections": 7,
    "max_connections": 100,
    "usage_percentage": 12.0
  },
  "warnings": [],
  "timestamp": "2025-10-27T10:30:00.000Z"
}
```

**Status Levels**:

- `healthy`: Pool usage < 75%
- `warning`: Pool usage 75-90%
- `critical`: Pool usage > 90%
- `unhealthy`: Database unreachable

### 4. API Wrapper Utilities

**File**: `lib/api-wrapper.ts`

#### Available Utilities:

##### a) Connection Management Wrapper

```typescript
export const GET = withConnectionManagement(async (request) => {
  const data = await prisma.users.findMany()
  return NextResponse.json(data)
})
```

**Benefits**:
- Automatic error handling
- Connection lifecycle management
- Consistent logging

##### b) Transaction Wrapper

```typescript
const result = await withTransaction(async (tx) => {
  const user = await tx.users.create({ data: userData })
  const contract = await tx.contracts.create({ data: contractData })
  return { user, contract }
}, {
  maxWait: 5000,  // Wait max 5s for transaction slot
  timeout: 30000  // Transaction must complete in 30s
})
```

**Benefits**:
- Atomic operations
- Automatic rollback on failure
- Timeout protection

##### c) Batch Operation Handler

```typescript
await batchOperation(
  largeArray,
  async (batch) => {
    await prisma.table.createMany({ data: batch })
  },
  { batchSize: 100, delayBetweenBatches: 100 }
)
```

**Benefits**:
- Prevents overwhelming the connection pool
- Configurable batch sizes
- Optional delays between batches

##### d) Connection Metrics Logger

```typescript
await logConnectionMetrics('After bulk operation')
```

**Benefits**:
- Real-time monitoring during development
- Debugging connection issues

## Best Practices

### ✅ DO:

1. **Use the Singleton Prisma Instance**
   ```typescript
   import { prisma } from '@/lib/prisma'  // ✅ Correct
   ```

2. **Always Await Prisma Queries**
   ```typescript
   const users = await prisma.users.findMany()  // ✅ Correct
   ```

3. **Use Transactions for Multi-Step Operations**
   ```typescript
   await withTransaction(async (tx) => {
     // Multiple related operations
   })
   ```

4. **Implement Connection Timeout in API Routes**
   ```typescript
   export async function GET() {
     // Set function timeout
     return createSuccessResponse(data)
   }
   ```

5. **Monitor Connection Health Regularly**
   - Check `/api/health/database` endpoint
   - Set up alerts for `critical` status

### ❌ DON'T:

1. **Don't Create New Prisma Instances**
   ```typescript
   const prisma = new PrismaClient()  // ❌ Wrong - creates new connection pool
   ```

2. **Don't Manually Call `$disconnect()` in API Routes**
   ```typescript
   await prisma.$disconnect()  // ❌ Wrong in serverless - breaks connection pooling
   ```

3. **Don't Run Long Queries Without Timeout**
   ```typescript
   // ❌ Wrong - no timeout protection
   const data = await prisma.table.findMany({ take: 1000000 })
   ```

4. **Don't Ignore Connection Errors**
   ```typescript
   try {
     await prisma.users.create({ data })
   } catch (error) {
     // ❌ Wrong - silently swallowing errors
   }
   ```

5. **Don't Perform Bulk Operations Without Batching**
   ```typescript
   // ❌ Wrong - creates too many connections
   for (const item of items) {
     await prisma.table.create({ data: item })
   }

   // ✅ Correct - use batching
   await batchOperation(items, async (batch) => {
     await prisma.table.createMany({ data: batch })
   })
   ```

## Monitoring & Debugging

### 1. Health Check Monitoring

**Setup Monitoring** (Recommended):

- **Development**: Check `http://localhost:3000/api/health/database` manually
- **Production**: Set up automated monitoring (e.g., UptimeRobot, Pingdom)
- **Alerts**: Configure alerts when status becomes `warning` or `critical`

### 2. Connection Pool Metrics

**Check Pool Usage**:

```bash
curl https://mobile.openplp.com/api/health/database
```

**Interpret Results**:

| Usage % | Action Required |
|---------|----------------|
| < 50% | Normal operation |
| 50-75% | Monitor closely |
| 75-90% | Investigate high usage |
| > 90% | Immediate action required |

### 3. Common Issues & Solutions

#### Issue: "Connection pool timeout"

**Symptoms**:
- API requests fail with timeout errors
- `/api/health/database` shows high `usage_percentage`

**Solutions**:
1. Check for slow queries: Review database logs
2. Increase `connection_limit` in DATABASE_URL (gradually)
3. Implement query caching for frequent operations
4. Review and optimize N+1 query patterns

#### Issue: "Too many connections"

**Symptoms**:
- PostgreSQL refuses new connections
- All serverless functions fail

**Solutions**:
1. Check PostgreSQL `max_connections`: `SHOW max_connections;`
2. Reduce `connection_limit` per function
3. Implement connection pooler (PgBouncer)
4. Review for connection leaks in custom code

#### Issue: High idle connections

**Symptoms**:
- `/api/health/database` shows warning about idle connections
- Total connections high but active connections low

**Solutions**:
1. Review API routes for missing `await` keywords
2. Check for long-running processes holding connections
3. Verify graceful shutdown handlers are working

### 4. Database-Level Monitoring

**Query Active Connections**:

```sql
SELECT
  count(*) as total_connections,
  state,
  application_name
FROM pg_stat_activity
WHERE datname = 'plp_contract_agreement'
GROUP BY state, application_name
ORDER BY total_connections DESC;
```

**Find Long-Running Queries**:

```sql
SELECT
  pid,
  now() - query_start as duration,
  state,
  query
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
  AND datname = 'plp_contract_agreement'
ORDER BY duration DESC
LIMIT 10;
```

## Performance Optimization Tips

### 1. Query Optimization

**Use `select` to fetch only needed fields**:

```typescript
// ❌ Fetches all fields (slower, more data)
const users = await prisma.users.findMany()

// ✅ Fetches only needed fields
const users = await prisma.users.findMany({
  select: { id: true, full_name: true, phone_number: true }
})
```

### 2. Implement Caching

**For frequently accessed data**:

```typescript
// Simple in-memory cache for contract types (changes rarely)
let contractTypesCache: any = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getContractTypes() {
  const now = Date.now()

  if (contractTypesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return contractTypesCache
  }

  contractTypesCache = await prisma.contract_types.findMany()
  cacheTimestamp = now

  return contractTypesCache
}
```

### 3. Avoid N+1 Queries

**Use `include` instead of multiple queries**:

```typescript
// ❌ N+1 query pattern
const contracts = await prisma.contracts.findMany()
for (const contract of contracts) {
  contract.type = await prisma.contract_types.findUnique({
    where: { id: contract.contract_type_id }
  })
}

// ✅ Single query with include
const contracts = await prisma.contracts.findMany({
  include: { contract_type: true }
})
```

### 4. Use Connection Pooler (Advanced)

**For production at scale**, consider implementing PgBouncer:

- **PgBouncer**: Connection pooler between application and PostgreSQL
- **Benefits**: Reduces total connections, improves performance
- **Setup**: Configure external PgBouncer instance
- **Connection string**: Update DATABASE_URL to point to PgBouncer

## Deployment Checklist

Before deploying to production:

- [ ] Verify `.env` has optimized DATABASE_URL with connection parameters
- [ ] Test `/api/health/database` endpoint returns correct metrics
- [ ] Run load tests to verify connection pool handles expected traffic
- [ ] Set up monitoring alerts for connection pool health
- [ ] Document rollback procedure if issues occur
- [ ] Verify all API routes use `await` with Prisma queries
- [ ] Review and optimize slow queries identified in testing

## Environment-Specific Configuration

### Development (Localhost)

```env
DATABASE_URL="postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement?schema=public&connection_limit=5&pool_timeout=10&connect_timeout=5"
```

- Lower limits OK (single developer)
- Faster timeouts for quicker feedback

### Production (Vercel)

```env
DATABASE_URL="postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

- Higher limits to handle concurrent requests
- Longer timeouts to avoid false failures

### Load Testing Environment

```env
DATABASE_URL="postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement?schema=public&connection_limit=15&pool_timeout=30&connect_timeout=15"
```

- Higher limits to test maximum capacity
- Monitor actual usage to fine-tune production values

## Troubleshooting Guide

### Quick Diagnosis Steps:

1. **Check health endpoint**: `curl https://mobile.openplp.com/api/health/database`
2. **Review Vercel logs**: Check for connection errors in function logs
3. **Query database**: Check active connections from PostgreSQL
4. **Review recent deployments**: Did connection issues start after a deployment?

### Emergency Actions:

If connection pool is exhausted:

1. **Immediate**: Reduce `connection_limit` in Vercel environment variables
2. **Short-term**: Restart Vercel functions (redeploy or use Vercel dashboard)
3. **Long-term**: Identify and fix root cause (slow queries, connection leaks)

## Additional Resources

- [Prisma Connection Pool Docs](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-pool)
- [Vercel Serverless Functions Limits](https://vercel.com/docs/functions/serverless-functions/runtimes)
- [PostgreSQL Connection Management](https://www.postgresql.org/docs/current/runtime-config-connection.html)

## Maintenance Schedule

**Weekly**:
- Review `/api/health/database` metrics
- Check for connection pool warnings

**Monthly**:
- Analyze slow query logs
- Review and optimize database indexes
- Test connection pool under load

**Quarterly**:
- Review and update connection limits based on traffic growth
- Evaluate need for dedicated connection pooler (PgBouncer)

---

**Last Updated**: 2025-10-27
**Maintained By**: Development Team
**Contact**: For questions about connection pooling, refer to this document or check `/api/health/database` endpoint.
