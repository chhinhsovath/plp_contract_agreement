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

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const contractType = searchParams.get('contractType')
    const province = searchParams.get('province')
    const district = searchParams.get('district')
    const commune = searchParams.get('commune')
    const school = searchParams.get('school')

    // Build where clause for filtering
    const where: any = {}

    // Filter by contract type
    if (contractType) {
      where.contract_type_id = parseInt(contractType)
    }

    // Filter by geographic location (from user data)
    if (province || district || commune || school) {
      where.created_by_user = {}

      if (province) {
        where.created_by_user.province_name = province
      }
      if (district) {
        where.created_by_user.district_name = district
      }
      if (commune) {
        where.created_by_user.commune_name = commune
      }
      if (school) {
        where.created_by_user.school_name = school
      }
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize
    const take = pageSize

    // Fetch contracts with filters and pagination
    const [contracts, totalCount] = await Promise.all([
      prisma.contracts.findMany({
        where,
        include: {
          created_by_user: {
            select: {
              id: true,
              phone_number: true,
              full_name: true,
              email: true,
              role: true,
              province_name: true,
              district_name: true,
              commune_name: true,
              village_name: true,
              school_name: true,
            }
          },
          contract_type: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take,
      }),
      prisma.contracts.count({ where })
    ])

    return NextResponse.json({
      success: true,
      contracts,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    return handleApiError(error, '/api/contracts/all')
  }
}
