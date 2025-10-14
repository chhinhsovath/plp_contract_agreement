import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error-handler'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSession()

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    // Get user details to check role
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: {
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    // Only allow SUPER_ADMIN and ADMIN to access this endpoint
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Only administrators can access all contracts'
        },
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
