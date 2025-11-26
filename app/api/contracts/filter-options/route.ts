import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

/**
 * GET /api/contracts/filter-options
 * Get unique filter options for contracts page
 * Returns distinct provinces, districts, communes, and schools from users who created contracts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    if (!user || (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse optional filter parameters for cascading
    const { searchParams } = new URL(request.url)
    const province = searchParams.get('province')
    const district = searchParams.get('district')
    const commune = searchParams.get('commune')

    // Get all users who have created contracts
    const usersWithContracts = await prisma.users.findMany({
      where: {
        contracts_created: {
          some: {}
        }
      },
      select: {
        province_name: true,
        district_name: true,
        commune_name: true,
        school_name: true
      }
    })

    // Extract unique values with cascading filter
    let filteredUsers = usersWithContracts

    // Apply cascading filters
    if (province) {
      filteredUsers = filteredUsers.filter(u => u.province_name === province)
    }
    if (district) {
      filteredUsers = filteredUsers.filter(u => u.district_name === district)
    }
    if (commune) {
      filteredUsers = filteredUsers.filter(u => u.commune_name === commune)
    }

    const provinces = Array.from(new Set(
      usersWithContracts
        .map(u => u.province_name)
        .filter(Boolean)
    )).sort()

    const districts = Array.from(new Set(
      filteredUsers
        .map(u => u.district_name)
        .filter(Boolean)
    )).sort()

    const communes = Array.from(new Set(
      filteredUsers
        .map(u => u.commune_name)
        .filter(Boolean)
    )).sort()

    const schools = Array.from(new Set(
      filteredUsers
        .map(u => u.school_name)
        .filter(Boolean)
    )).sort()

    return NextResponse.json({
      success: true,
      provinces,
      districts,
      communes,
      schools
    })
  } catch (error: any) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter options', message: error.message },
      { status: 500 }
    )
  }
}
