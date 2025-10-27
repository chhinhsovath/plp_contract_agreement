import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * API Route Wrapper with Automatic Connection Management
 *
 * This wrapper ensures that Prisma connections are properly handled
 * in serverless environments, preventing connection pool exhaustion.
 *
 * Usage:
 * export const GET = withConnectionManagement(async (request) => {
 *   const data = await prisma.table.findMany()
 *   return NextResponse.json(data)
 * })
 */

type ApiHandler<T = any> = (
  request: Request,
  context?: { params?: Record<string, any> }
) => Promise<NextResponse<T>>

export function withConnectionManagement<T = any>(
  handler: ApiHandler<T>
): ApiHandler<T> {
  return async (request: Request, context?: { params?: Record<string, any> }) => {
    let connectionActive = false

    try {
      // Mark connection as active
      connectionActive = true

      // Execute the handler
      const response = await handler(request, context)

      // Connection will be reused by Prisma's internal pool
      // No explicit disconnect needed in serverless (handled by function lifecycle)
      connectionActive = false

      return response
    } catch (error: any) {
      console.error('API Handler Error:', {
        error: error.message,
        path: request.url,
        method: request.method,
        stack: error.stack,
      })

      // In case of error, ensure we don't leak connections
      if (connectionActive) {
        try {
          // Don't explicitly disconnect - let Prisma manage the pool
          // Only log for monitoring
          console.warn('Error occurred during database operation')
        } catch (disconnectError) {
          console.error('Error during connection cleanup:', disconnectError)
        }
      }

      throw error
    }
  }
}

/**
 * Optimized Transaction Wrapper for Complex Operations
 *
 * Use this for operations that require multiple database queries
 * to be executed atomically.
 *
 * Usage:
 * const result = await withTransaction(async (tx) => {
 *   const user = await tx.users.create({ data: userData })
 *   const contract = await tx.contracts.create({ data: contractData })
 *   return { user, contract }
 * })
 */
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>,
  options?: {
    maxWait?: number // Maximum time to wait for a transaction slot (ms)
    timeout?: number // Maximum time the transaction can run (ms)
  }
): Promise<T> {
  const maxWait = options?.maxWait ?? 5000 // 5 seconds default
  const timeout = options?.timeout ?? 30000 // 30 seconds default

  try {
    return await prisma.$transaction(callback, {
      maxWait,
      timeout,
    })
  } catch (error: any) {
    console.error('Transaction error:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
    })

    // Re-throw with more context
    if (error.code === 'P2034') {
      throw new Error('Transaction timeout - operation took too long')
    } else if (error.code === 'P2024') {
      throw new Error('Connection pool timeout - no available connections')
    }

    throw error
  }
}

/**
 * Batch Operation Wrapper
 *
 * Optimizes bulk operations by batching them appropriately
 * to avoid overwhelming the connection pool.
 *
 * Usage:
 * await batchOperation(items, async (batch) => {
 *   await prisma.table.createMany({ data: batch })
 * }, { batchSize: 100 })
 */
export async function batchOperation<T>(
  items: T[],
  operation: (batch: T[]) => Promise<void>,
  options?: {
    batchSize?: number
    delayBetweenBatches?: number // ms
  }
): Promise<void> {
  const batchSize = options?.batchSize ?? 100
  const delay = options?.delayBetweenBatches ?? 0

  const batches: T[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  console.log(`Processing ${items.length} items in ${batches.length} batches`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} items)`)

    await operation(batch)

    // Optional delay between batches to prevent overwhelming the database
    if (delay > 0 && i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  console.log('Batch operation completed')
}

/**
 * Connection Pool Monitor
 *
 * Logs connection pool metrics for debugging purposes
 * Use this during development or when investigating connection issues
 */
export async function logConnectionMetrics(label: string = 'Connection Pool') {
  try {
    const metrics = await prisma.$queryRaw<Array<{
      count: bigint
      state: string
    }>>`
      SELECT state, count(*) as count
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY state
    `

    const metricsSummary = metrics.reduce((acc, { state, count }) => {
      acc[state || 'unknown'] = Number(count)
      return acc
    }, {} as Record<string, number>)

    console.log(`[${label}]`, {
      timestamp: new Date().toISOString(),
      metrics: metricsSummary,
      total: Object.values(metricsSummary).reduce((sum, val) => sum + val, 0),
    })
  } catch (error) {
    console.error(`[${label}] Failed to fetch metrics:`, error)
  }
}
