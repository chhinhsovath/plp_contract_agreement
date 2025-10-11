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

    // Fetch REAL 5 indicators from indicators table (NOT me_indicators!)
    // These are the 5 fixed performance indicators from PRD
    const indicators = await prisma.indicators.findMany({
      where: {
        is_active: true
      },
      orderBy: { indicator_number: 'asc' }
    })

    // Get user's contract to see their baseline/target values
    const userContract = await prisma.contracts.findFirst({
      where: {
        contract_type_id: user.contract_type || 4,
        OR: [
          { created_by: user.id.toString() },
          { party_b_name: { contains: user.full_name } }
        ]
      },
      include: {
        contract_indicators: {
          include: {
            indicator: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Map indicators with user's contract data
    const indicatorsWithProgress = indicators.map(indicator => {
      // Find if user has this indicator in their contract
      const contractIndicator = userContract?.contract_indicators.find(
        ci => ci.indicator_id === indicator.id
      )

      const baseline = contractIndicator?.baseline_percentage || indicator.baseline_percentage
      const target = contractIndicator?.target_percentage || indicator.target_percentage
      const current = baseline // For now, use baseline (later connect to actual progress)

      // Calculate progress
      let progress = 0
      if (baseline && target) {
        if (indicator.is_reduction_target) {
          // For reduction targets (lower is better)
          progress = Math.round(((baseline - current) / (baseline - target)) * 100)
        } else {
          // For increase targets (higher is better)
          progress = Math.round(((current - baseline) / (target - baseline)) * 100)
        }
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
        indicator_name_khmer: indicator.indicator_name_km,
        indicator_name_english: indicator.indicator_name_en,
        indicator_type: indicator.is_reduction_target ? 'REDUCTION' : 'OUTPUT',
        indicator_number: indicator.indicator_number,
        measurement_unit: 'percentage',
        baseline_value: baseline,
        target_value: target,
        current_value: current,
        progress,
        status,
        selected_rule: contractIndicator?.selected_rule || null
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

// POST endpoint removed - indicators are FIXED from PRD, not user-creatable