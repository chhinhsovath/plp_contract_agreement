import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/milestones
 * Get milestones with optional filters
 * Query params: contract_id, indicator_id, status, health_indicator
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contract_id = searchParams.get('contract_id')
    const indicator_id = searchParams.get('indicator_id')
    const status = searchParams.get('status')
    const health_indicator = searchParams.get('health_indicator')

    const where: any = {}

    if (contract_id) where.contract_id = parseInt(contract_id)
    if (indicator_id) where.indicator_id = parseInt(indicator_id)
    if (status) where.overall_status = status
    if (health_indicator) where.health_indicator = health_indicator

    const milestones = await prisma.milestones.findMany({
      where,
      include: {
        indicator: {
          select: {
            indicator_code: true,
            indicator_name_km: true,
            indicator_name_en: true
          }
        },
        contract: {
          select: {
            id: true,
            contract_number: true,
            party_b_name: true
          }
        },
        activities: {
          orderBy: { start_date: 'asc' }
        },
        deliverables: {
          orderBy: { due_date: 'asc' }
        },
        progress_reports: {
          orderBy: { reporting_date: 'desc' },
          take: 3 // Latest 3 reports
        }
      },
      orderBy: { planned_start_date: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: milestones,
      count: milestones.length
    })
  } catch (error: any) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch milestones',
        message: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/milestones
 * Create a new milestone
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      contract_id,
      indicator_id,
      contract_indicator_id,
      milestone_name_km,
      milestone_name_en,
      milestone_description_km,
      milestone_description_en,
      planned_start_date,
      planned_end_date,
      baseline_value,
      target_value,
      milestone_type,
      milestone_category
    } = body

    // Validation
    if (!contract_id || !indicator_id || !contract_indicator_id || !milestone_name_km) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'contract_id, indicator_id, contract_indicator_id, and milestone_name_km are required'
        },
        { status: 400 }
      )
    }

    // Generate milestone code
    const count = await prisma.milestones.count()
    const milestone_code = `MS-${String(count + 1).padStart(3, '0')}`

    // Calculate duration
    const start = new Date(planned_start_date)
    const end = new Date(planned_end_date)
    const duration_days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    const milestone = await prisma.milestones.create({
      data: {
        milestone_code,
        contract_id,
        indicator_id,
        contract_indicator_id,
        milestone_name_km,
        milestone_name_en,
        milestone_description_km,
        milestone_description_en,
        milestone_type: milestone_type || 'quantitative',
        milestone_category,
        planned_start_date: new Date(planned_start_date),
        planned_end_date: new Date(planned_end_date),
        milestone_duration_days: duration_days,
        baseline_value,
        target_value,
        is_reduction_target: body.is_reduction_target || false
      },
      include: {
        indicator: true,
        contract: true
      }
    })

    return NextResponse.json({
      success: true,
      data: milestone,
      message: 'Milestone created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating milestone:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create milestone',
        message: error.message
      },
      { status: 500 }
    )
  }
}
