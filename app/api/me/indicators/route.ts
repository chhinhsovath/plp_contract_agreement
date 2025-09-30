import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const contractType = searchParams.get('contractType')

    let whereClause: any = {}

    // Filter based on user role and contract type
    if (user.role === UserRole.PARTNER && user.contract_type) {
      // Partners only see their contract type indicators
      whereClause.contract_type = user.contract_type
    } else if (contractType) {
      // Admin/others can filter by contract type
      whereClause.contract_type = parseInt(contractType)
    }

    // Fetch indicators with latest data collection
    const indicators = await prisma.me_indicators.findMany({
      where: whereClause,
      include: {
        data_collections: {
          orderBy: { collection_date: 'desc' },
          take: 1
        },
        activities: {
          select: {
            id: true,
            activity_code: true,
            activity_name_khmer: true,
            status: true
          }
        }
      },
      orderBy: { indicator_code: 'asc' }
    })

    // Calculate progress for each indicator
    const indicatorsWithProgress = indicators.map(indicator => {
      const latestData = indicator.data_collections[0]
      const current = latestData?.value_numeric || indicator.baseline_value || 0

      let progress = 0
      if (indicator.baseline_value === 0 || indicator.baseline_value === null) {
        progress = Math.round((current / indicator.target_value) * 100)
      } else {
        progress = Math.round(
          ((current - indicator.baseline_value) /
           (indicator.target_value - indicator.baseline_value)) * 100
        )
      }

      // Determine status based on progress
      let status = 'on-track'
      if (progress >= 100) {
        status = 'achieved'
      } else if (progress < 50) {
        status = 'at-risk'
      } else if (progress < 75) {
        status = 'delayed'
      }

      return {
        ...indicator,
        current,
        progress,
        status
      }
    })

    return NextResponse.json({
      indicators: indicatorsWithProgress,
      total: indicatorsWithProgress.length
    })
  } catch (error) {
    console.error('Error fetching indicators:', error)
    return NextResponse.json(
      { error: 'Failed to fetch indicators' },
      { status: 500 }
    )
  }
}

// POST endpoint to add new indicator
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user has permission (ADMIN or SUPER_ADMIN)
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) }
    })

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    const indicator = await prisma.me_indicators.create({
      data: {
        indicator_code: body.indicator_code,
        indicator_name_khmer: body.indicator_name_khmer,
        indicator_name_english: body.indicator_name_english,
        indicator_type: body.indicator_type,
        measurement_unit: body.measurement_unit,
        baseline_value: body.baseline_value || 0,
        target_value: body.target_value,
        frequency: body.frequency,
        contract_type: body.contract_type,
        description: body.description
      }
    })

    return NextResponse.json({ indicator }, { status: 201 })
  } catch (error) {
    console.error('Error creating indicator:', error)
    return NextResponse.json(
      { error: 'Failed to create indicator' },
      { status: 500 }
    )
  }
}