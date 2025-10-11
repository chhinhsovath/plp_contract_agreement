import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/indicators
 * Get all active performance indicators
 */
export async function GET(request: NextRequest) {
  try {
    const indicators = await prisma.indicators.findMany({
      where: { is_active: true },
      orderBy: { indicator_number: 'asc' },
      select: {
        id: true,
        indicator_code: true,
        indicator_number: true,
        indicator_name_km: true,
        indicator_name_en: true,
        target_percentage: true,
        baseline_percentage: true,
        is_reduction_target: true,
        implementation_start: true,
        implementation_end: true,
        calculation_rules: true,
        description_km: true,
        description_en: true
      }
    })

    return NextResponse.json({
      success: true,
      data: indicators,
      count: indicators.length
    })
  } catch (error: any) {
    console.error('Error fetching indicators:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch indicators',
        message: error.message
      },
      { status: 500 }
    )
  }
}
