import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error-handler'
import { verifySession } from '@/lib/session'
import { UserRole } from '@/lib/roles'

export async function GET(request: Request) {
  try {
    // Verify user session and check if user is SUPER_ADMIN or ADMIN
    const session = await verifySession(request)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow SUPER_ADMIN and ADMIN to access this endpoint
    if (session.role !== UserRole.SUPER_ADMIN && session.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can access all contracts' },
        { status: 403 }
      )
    }

    // Fetch all contracts with user information
    const contracts = await prisma.contracts.findMany({
      include: {
        user: {
          select: {
            id: true,
            phone_number: true,
            full_name: true,
            email: true,
            role: true,
          }
        },
        contract_type: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      contracts,
      count: contracts.length
    })
  } catch (error) {
    return handleApiError(error, '/api/contracts/all')
  }
}
