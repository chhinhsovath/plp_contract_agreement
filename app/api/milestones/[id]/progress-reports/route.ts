import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/milestones/[id]/progress-reports
 * Get all progress reports for a milestone
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const milestone_id = parseInt(id)

    const reports = await prisma.progress_reports.findMany({
      where: { milestone_id },
      orderBy: { reporting_date: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length
    })
  } catch (error: any) {
    console.error('Error fetching progress reports:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress reports',
        message: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/milestones/[id]/progress-reports
 * Submit a new progress report
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const milestone_id = parseInt(id)
    const body = await request.json()

    const {
      reporting_period,
      reported_value,
      narrative_report_km,
      narrative_report_en,
      challenges_km,
      challenges_en,
      next_steps_km,
      next_steps_en,
      supporting_documents
    } = body

    // Validation
    if (!reporting_period || reported_value === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'reporting_period and reported_value are required'
        },
        { status: 400 }
      )
    }

    // Get milestone to calculate progress
    const milestone = await prisma.milestones.findUnique({
      where: { id: milestone_id }
    })

    if (!milestone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Milestone not found',
          message: `Milestone with ID ${milestone_id} does not exist`
        },
        { status: 404 }
      )
    }

    // Calculate cumulative progress
    const baseline = milestone.baseline_value
    const target = milestone.target_value
    const current = reported_value

    let cumulative_progress = 0
    if (milestone.is_reduction_target) {
      // For reduction targets: progress = (baseline - current) / (baseline - target) * 100
      if (baseline !== target) {
        cumulative_progress = ((baseline - current) / (baseline - target)) * 100
      }
    } else {
      // For increase targets: progress = (current - baseline) / (target - baseline) * 100
      if (target !== baseline) {
        cumulative_progress = ((current - baseline) / (target - baseline)) * 100
      }
    }

    // Cap progress at 100%
    cumulative_progress = Math.min(Math.max(cumulative_progress, 0), 100)

    // Generate report code
    const count = await prisma.progress_reports.count()
    const report_code = `RPT-${String(count + 1).padStart(3, '0')}`

    // Create progress report
    const report = await prisma.progress_reports.create({
      data: {
        report_code,
        milestone_id,
        reporting_date: new Date(),
        reporting_period,
        reported_value,
        cumulative_progress,
        narrative_report_km,
        narrative_report_en,
        challenges_km,
        challenges_en,
        next_steps_km,
        next_steps_en,
        supporting_documents
      }
    })

    // Update milestone progress
    const achievement_percentage = cumulative_progress

    // Determine health indicator
    let health_indicator = 'on_track'
    let overall_status = milestone.overall_status

    if (achievement_percentage >= 75) {
      health_indicator = 'on_track'
    } else if (achievement_percentage >= 50) {
      health_indicator = 'at_risk'
    } else {
      health_indicator = 'critical'
    }

    // Check if delayed
    const now = new Date()
    const planned_end = new Date(milestone.planned_end_date)
    const is_delayed = now > planned_end && achievement_percentage < 100
    const days_delayed = is_delayed
      ? Math.ceil((now.getTime() - planned_end.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Update overall status
    if (achievement_percentage >= 100) {
      overall_status = 'completed'
    } else if (is_delayed) {
      overall_status = 'delayed'
    } else if (achievement_percentage > 0) {
      overall_status = 'in_progress'
    }

    await prisma.milestones.update({
      where: { id: milestone_id },
      data: {
        current_value: reported_value,
        achievement_percentage,
        health_indicator,
        overall_status,
        is_delayed,
        days_delayed,
        last_updated: new Date(),
        completion_date: achievement_percentage >= 100 ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: report,
      milestone_update: {
        achievement_percentage,
        health_indicator,
        overall_status,
        is_delayed,
        days_delayed
      },
      message: 'Progress report submitted successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error submitting progress report:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit progress report',
        message: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/milestones/[id]/progress-reports?report_id=xxx
 * Verify a progress report
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params // Consume params to satisfy Next.js
    const searchParams = request.nextUrl.searchParams
    const report_id = parseInt(searchParams.get('report_id') || '')
    const body = await request.json()

    const { verified, verified_by, verification_notes } = body

    if (!report_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing report_id',
          message: 'report_id query parameter is required'
        },
        { status: 400 }
      )
    }

    const updated_report = await prisma.progress_reports.update({
      where: { id: report_id },
      data: {
        verified,
        verified_by,
        verified_date: verified ? new Date() : null,
        verification_notes
      }
    })

    return NextResponse.json({
      success: true,
      data: updated_report,
      message: verified ? 'Report verified successfully' : 'Report verification updated'
    })
  } catch (error: any) {
    console.error('Error verifying progress report:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify progress report',
        message: error.message
      },
      { status: 500 }
    )
  }
}
