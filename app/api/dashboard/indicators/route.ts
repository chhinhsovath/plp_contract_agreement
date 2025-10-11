import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/dashboard/indicators
 * Get indicator performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const indicators = await prisma.indicators.findMany({
      where: { is_active: true },
      orderBy: { indicator_number: 'asc' },
      include: {
        contract_indicators: {
          include: {
            milestones: {
              select: {
                achievement_percentage: true,
                overall_status: true,
                contract_id: true
              }
            }
          }
        }
      }
    })

    const indicator_performance = indicators.map(indicator => {
      const all_milestones = indicator.contract_indicators.flatMap(ci => ci.milestones)
      const total_milestones = all_milestones.length
      const completed_milestones = all_milestones.filter(m => m.overall_status === 'completed').length
      const on_track_count = all_milestones.filter(m => m.achievement_percentage >= 75).length

      // Calculate average achievement
      const average_achievement = total_milestones > 0
        ? all_milestones.reduce((sum, m) => sum + m.achievement_percentage, 0) / total_milestones
        : 0

      // Get unique partners working on this indicator
      const unique_partners = new Set(all_milestones.map(m => m.contract_id))
      const partners_working_on = unique_partners.size

      // Calculate baseline and target averages
      const baseline_average = indicator.contract_indicators.length > 0
        ? indicator.contract_indicators.reduce((sum, ci) => sum + ci.baseline_percentage, 0) / indicator.contract_indicators.length
        : indicator.baseline_percentage

      const target_average = indicator.contract_indicators.length > 0
        ? indicator.contract_indicators.reduce((sum, ci) => sum + ci.target_percentage, 0) / indicator.contract_indicators.length
        : indicator.target_percentage

      return {
        indicator_id: indicator.id,
        indicator_code: indicator.indicator_code,
        indicator_number: indicator.indicator_number,
        indicator_name_km: indicator.indicator_name_km,
        indicator_name_en: indicator.indicator_name_en,
        standard_baseline: indicator.baseline_percentage,
        standard_target: indicator.target_percentage,
        is_reduction_target: indicator.is_reduction_target,
        implementation_period: `${indicator.implementation_start} - ${indicator.implementation_end}`,
        total_milestones,
        partners_working_on,
        average_achievement: Math.round(average_achievement * 10) / 10,
        baseline_average: Math.round(baseline_average * 10) / 10,
        target_average: Math.round(target_average * 10) / 10,
        on_track_count,
        completed_count: completed_milestones
      }
    })

    return NextResponse.json({
      success: true,
      data: indicator_performance
    })
  } catch (error: any) {
    console.error('Error fetching indicator performance:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch indicator performance',
        message: error.message
      },
      { status: 500 }
    )
  }
}
