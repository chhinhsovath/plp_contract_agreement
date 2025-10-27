import { NextResponse } from 'next/server'
import { checkDatabaseConnection, getConnectionMetrics } from '@/lib/prisma'

/**
 * GET /api/health/database
 * Database health check and connection pool monitoring endpoint
 *
 * Returns:
 * - Connection status (healthy/unhealthy)
 * - Connection latency
 * - Pool metrics (total, active, idle connections)
 * - Pool usage percentage
 */
export async function GET() {
  try {
    // Check basic connection health
    const healthCheck = await checkDatabaseConnection()

    if (!healthCheck.isConnected) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: {
            connected: false,
            error: healthCheck.error,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 } // Service Unavailable
      )
    }

    // Get connection pool metrics
    const metrics = await getConnectionMetrics()

    // Determine health status based on pool usage
    let poolStatus = 'healthy'
    let warnings: string[] = []

    if (metrics) {
      const { usage_percentage, active, total, max } = metrics

      // Warning thresholds
      if (usage_percentage > 90) {
        poolStatus = 'critical'
        warnings.push(`Connection pool at ${usage_percentage.toFixed(1)}% capacity (${total}/${max})`)
      } else if (usage_percentage > 75) {
        poolStatus = 'warning'
        warnings.push(`Connection pool at ${usage_percentage.toFixed(1)}% capacity (${total}/${max})`)
      }

      // Check for too many idle connections (possible leak)
      const idlePercentage = (metrics.idle / total) * 100
      if (idlePercentage > 50 && total > 20) {
        warnings.push(`High idle connection ratio: ${idlePercentage.toFixed(1)}% (${metrics.idle}/${total})`)
      }
    }

    return NextResponse.json({
      status: poolStatus,
      database: {
        connected: true,
        latency_ms: healthCheck.latency,
      },
      connection_pool: metrics ? {
        total_connections: metrics.total,
        active_connections: metrics.active,
        idle_connections: metrics.idle,
        max_connections: metrics.max,
        usage_percentage: parseFloat(metrics.usage_percentage.toFixed(2)),
      } : null,
      warnings: warnings.length > 0 ? warnings : undefined,
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations(metrics, warnings),
    })
  } catch (error: any) {
    console.error('Health check error:', error)

    return NextResponse.json(
      {
        status: 'error',
        database: {
          connected: false,
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Generate recommendations based on connection metrics
 */
function generateRecommendations(
  metrics: any,
  warnings: string[]
): string[] | undefined {
  if (!metrics || warnings.length === 0) {
    return undefined
  }

  const recommendations: string[] = []

  // High usage recommendations
  if (metrics.usage_percentage > 75) {
    recommendations.push('Consider increasing DATABASE_URL connection_limit parameter')
    recommendations.push('Review and optimize long-running queries')
    recommendations.push('Implement query caching for frequently accessed data')
  }

  // High idle connections
  const idlePercentage = (metrics.idle / metrics.total) * 100
  if (idlePercentage > 50 && metrics.total > 20) {
    recommendations.push('Possible connection leak detected - review API routes for missing prisma.$disconnect()')
    recommendations.push('Check for long-lived connections in serverless functions')
  }

  return recommendations.length > 0 ? recommendations : undefined
}
