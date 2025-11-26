import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

/**
 * GET /api/admin/indicators
 * Fetch all indicators with calculation rules
 * SUPER_ADMIN only
 */
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) }
    })

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. SUPER_ADMIN access required.' },
        { status: 403 }
      )
    }

    // Fetch all indicators
    const indicators = await prisma.indicators.findMany({
      orderBy: { indicator_number: 'asc' }
    })

    return NextResponse.json({
      success: true,
      indicators: indicators
    })
  } catch (error: any) {
    console.error('Error fetching indicators:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch indicators',
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}
