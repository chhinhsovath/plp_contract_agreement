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

    // Determine which contract type to filter by
    let effectiveContractType = null
    if (user.role === UserRole.PARTNER && user.contract_type) {
      // Partners only see their contract type indicators
      effectiveContractType = user.contract_type
    } else if (contractType) {
      // Admin/others can filter by contract type
      effectiveContractType = parseInt(contractType)
    }

    // Build where clause for me_indicators
    let meIndicatorsWhere: any = {}

    // Filter by contract type if specified
    if (effectiveContractType) {
      meIndicatorsWhere.contract_type = effectiveContractType
    }

    // Fetch indicators from me_indicators table
    const meIndicators = await prisma.me_indicators.findMany({
      where: meIndicatorsWhere,
      orderBy: { indicator_code: 'asc' }
    })

    // Map indicators with progress calculation
    const indicatorsWithProgress = meIndicators.map(indicator => {
      const baseline = indicator.baseline_value || 0
      const target = indicator.target_value || 100
      const current = baseline // For now, use baseline (later connect to actual progress)

      // Calculate progress (assuming higher is better for now)
      let progress = 0
      if (baseline !== null && target !== null && target > baseline) {
        progress = Math.round(((current - baseline) / (target - baseline)) * 100)
      }

      // Clamp progress between 0-100
      progress = Math.max(0, Math.min(100, progress))

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
        id: indicator.id,
        indicator_code: indicator.indicator_code,
        indicator_name_khmer: indicator.indicator_name_khmer,
        indicator_name_english: indicator.indicator_name_english,
        indicator_type: indicator.indicator_type || 'output',
        measurement_unit: indicator.measurement_unit || 'ភាគរយ',
        baseline_value: baseline,
        target_value: target,
        current_value: current,
        progress,
        status,
        frequency: indicator.frequency,
        contract_type: indicator.contract_type,
        description: indicator.description
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

/**
 * POST /api/me/indicators
 * Create a new indicator
 * SUPER_ADMIN only
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const {
      indicator_code,
      indicator_name_khmer,
      indicator_name_english,
      indicator_type,
      measurement_unit,
      baseline_value,
      target_value,
      frequency,
      contract_type,
      description
    } = body

    // Validate required fields
    if (!indicator_code || !indicator_name_khmer || !contract_type) {
      return NextResponse.json(
        { error: 'Missing required fields: indicator_code, indicator_name_khmer, contract_type' },
        { status: 400 }
      )
    }

    // Create new indicator
    const newIndicator = await prisma.me_indicators.create({
      data: {
        indicator_code,
        indicator_name_khmer,
        indicator_name_english,
        indicator_type: indicator_type || 'output',
        measurement_unit: measurement_unit || 'ភាគរយ',
        baseline_value: baseline_value !== undefined && baseline_value !== null && baseline_value !== ''
          ? parseFloat(baseline_value)
          : 0,
        target_value: target_value !== undefined && target_value !== null && target_value !== ''
          ? parseFloat(target_value)
          : 100,
        frequency: frequency || 'monthly',
        contract_type: parseInt(contract_type),
        description
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Indicator created successfully',
      indicator: newIndicator
    })
  } catch (error: any) {
    console.error('Error creating indicator:', error)
    return NextResponse.json(
      {
        error: 'Failed to create indicator',
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}