import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized Prisma Client for Vercel Serverless with Connection Pooling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

    // Connection pool configuration optimized for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Store globally in development to prevent multiple instances during hot-reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown handler for serverless functions
// This ensures connections are properly closed when function terminates
if (typeof process !== 'undefined') {
  const cleanup = async () => {
    try {
      await prisma.$disconnect()
      console.log('Prisma disconnected gracefully')
    } catch (error) {
      console.error('Error during Prisma disconnect:', error)
    }
  }

  // Handle different termination signals
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('exit', cleanup)
}

// Connection health check utility
export async function checkDatabaseConnection(): Promise<{
  isConnected: boolean
  latency?: number
  error?: string
}> {
  try {
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - startTime

    return {
      isConnected: true,
      latency,
    }
  } catch (error: any) {
    return {
      isConnected: false,
      error: error.message,
    }
  }
}

// Connection pool metrics
export async function getConnectionMetrics() {
  try {
    // Query to get connection stats from PostgreSQL
    const result = await prisma.$queryRaw<Array<{
      total_connections: bigint
      active_connections: bigint
      idle_connections: bigint
      max_connections: bigint
    }>>`
      SELECT
        (SELECT count(*) FROM pg_stat_activity) as total_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
    `

    if (result && result[0]) {
      return {
        total: Number(result[0].total_connections),
        active: Number(result[0].active_connections),
        idle: Number(result[0].idle_connections),
        max: Number(result[0].max_connections),
        usage_percentage: (Number(result[0].total_connections) / Number(result[0].max_connections)) * 100,
      }
    }

    return null
  } catch (error: any) {
    console.error('Error fetching connection metrics:', error)
    return null
  }
}

export default prisma