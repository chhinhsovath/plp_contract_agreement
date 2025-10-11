import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/dashboard/partners
 * Get partner performance ranking
 */
export async function GET(request: NextRequest) {
  try {
    // Get all contracts with their milestones and latest progress reports
    const contracts = await prisma.contracts.findMany({
      where: { status: 'signed' },
      include: {
        milestones: {
          select: {
            achievement_percentage: true,
            overall_status: true,
            health_indicator: true,
            planned_end_date: true,
            progress_reports: {
              orderBy: { reporting_date: 'desc' },
              take: 1,
              select: {
                reporting_date: true
              }
            }
          }
        }
      }
    })

    const partner_performance = contracts.map(contract => {
      const total_milestones = contract.milestones.length
      const completed_milestones = contract.milestones.filter(m => m.overall_status === 'completed').length

      // Calculate achievement rate
      const achievement_rate = total_milestones > 0
        ? contract.milestones.reduce((sum, m) => sum + m.achievement_percentage, 0) / total_milestones
        : 0

      // Determine overall health
      let overall_health = 'green'
      const critical_count = contract.milestones.filter(m => m.health_indicator === 'critical').length
      const at_risk_count = contract.milestones.filter(m => m.health_indicator === 'at_risk').length

      if (critical_count > 0 || achievement_rate < 50) {
        overall_health = 'red'
      } else if (at_risk_count > 0 || achievement_rate < 75) {
        overall_health = 'yellow'
      }

      // Get last report date from all milestones' progress reports
      const all_reports = contract.milestones.flatMap(m => m.progress_reports)
      const last_report_date = all_reports.length > 0
        ? all_reports.sort((a, b) => new Date(b.reporting_date).getTime() - new Date(a.reporting_date).getTime())[0].reporting_date
        : null

      // Find next milestone due
      const upcoming_milestones = contract.milestones
        .filter(m => m.overall_status !== 'completed' && new Date(m.planned_end_date) >= new Date())
        .sort((a, b) => new Date(a.planned_end_date).getTime() - new Date(b.planned_end_date).getTime())

      const next_milestone_due = upcoming_milestones[0]?.planned_end_date || null

      return {
        partner_id: contract.id,
        partner_name: contract.party_b_name,
        organization: contract.party_b_organization || contract.location,
        location: contract.location,
        contract_number: contract.contract_number,
        contract_type_id: contract.contract_type_id,
        total_milestones,
        completed_milestones,
        achievement_rate: Math.round(achievement_rate * 10) / 10,
        overall_health,
        last_report_date,
        next_milestone_due,
        critical_milestones_count: critical_count,
        at_risk_milestones_count: at_risk_count
      }
    })

    // Sort by achievement rate (descending)
    partner_performance.sort((a, b) => b.achievement_rate - a.achievement_rate)

    // Add ranking
    const ranked_partners = partner_performance.map((partner, index) => ({
      ...partner,
      rank: index + 1
    }))

    return NextResponse.json({
      success: true,
      data: ranked_partners,
      count: ranked_partners.length
    })
  } catch (error: any) {
    console.error('Error fetching partner performance:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partner performance',
        message: error.message
      },
      { status: 500 }
    )
  }
}
