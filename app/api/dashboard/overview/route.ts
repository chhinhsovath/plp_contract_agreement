import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/dashboard/overview
 * Get dashboard overview metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get total contracts
    const total_contracts = await prisma.contracts.count()
    const active_contracts = await prisma.contracts.count({
      where: { status: 'signed' }
    })

    // Get total milestones with status breakdown
    const total_milestones = await prisma.milestones.count()
    const completed_milestones = await prisma.milestones.count({
      where: { overall_status: 'completed' }
    })
    const in_progress_milestones = await prisma.milestones.count({
      where: { overall_status: 'in_progress' }
    })
    const delayed_milestones = await prisma.milestones.count({
      where: { overall_status: 'delayed' }
    })
    const not_started_milestones = await prisma.milestones.count({
      where: { overall_status: 'not_started' }
    })

    // Get milestones by health indicator
    const on_track_milestones = await prisma.milestones.count({
      where: { health_indicator: 'on_track' }
    })
    const at_risk_milestones = await prisma.milestones.count({
      where: { health_indicator: 'at_risk' }
    })
    const critical_milestones = await prisma.milestones.count({
      where: { health_indicator: 'critical' }
    })

    // Calculate overall achievement rate
    const all_milestones = await prisma.milestones.findMany({
      select: { achievement_percentage: true }
    })
    const overall_achievement_rate = all_milestones.length > 0
      ? all_milestones.reduce((sum, m) => sum + m.achievement_percentage, 0) / all_milestones.length
      : 0

    // Get total partners (unique party_b from contracts)
    const partners = await prisma.contracts.groupBy({
      by: ['party_b_name'],
      _count: true
    })
    const total_partners = partners.length

    // Get partners at risk (those with critical or at-risk milestones)
    const partners_at_risk = await prisma.milestones.groupBy({
      by: ['contract_id'],
      where: {
        OR: [
          { health_indicator: 'at_risk' },
          { health_indicator: 'critical' }
        ]
      },
      _count: true
    })

    return NextResponse.json({
      success: true,
      data: {
        contracts: {
          total: total_contracts,
          active: active_contracts,
          draft: total_contracts - active_contracts
        },
        milestones: {
          total: total_milestones,
          completed: completed_milestones,
          in_progress: in_progress_milestones,
          delayed: delayed_milestones,
          not_started: not_started_milestones,
          by_health: {
            on_track: on_track_milestones,
            at_risk: at_risk_milestones,
            critical: critical_milestones
          }
        },
        performance: {
          overall_achievement_rate: Math.round(overall_achievement_rate * 10) / 10,
          total_partners,
          partners_at_risk: partners_at_risk.length
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching dashboard overview:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard overview',
        message: error.message
      },
      { status: 500 }
    )
  }
}
