import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateTarget, validateCustomTarget } from '@/lib/services/target-calculation'

/**
 * POST /api/indicators/calculate-target
 * Calculate target based on partner's baseline and indicator rules
 *
 * Body: {
 *   indicator_code: string,
 *   partner_baseline: number,
 *   custom_target?: number  // Optional: for validation
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { indicator_code, partner_baseline, custom_target } = body

    // Validation
    if (!indicator_code || partner_baseline === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'indicator_code and partner_baseline are required'
        },
        { status: 400 }
      )
    }

    if (partner_baseline < 0 || partner_baseline > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid baseline',
          message: 'partner_baseline must be between 0 and 100'
        },
        { status: 400 }
      )
    }

    // Fetch indicator
    const indicator = await prisma.indicators.findUnique({
      where: { indicator_code }
    })

    if (!indicator) {
      return NextResponse.json(
        {
          success: false,
          error: 'Indicator not found',
          message: `Indicator with code ${indicator_code} does not exist`
        },
        { status: 404 }
      )
    }

    // Calculate target
    const calculation_result = calculateTarget({
      indicator: indicator as any,
      partner_baseline
    })

    // Validate custom target if provided
    let custom_target_validation = null
    if (custom_target !== undefined) {
      custom_target_validation = validateCustomTarget(
        calculation_result.calculated_target,
        custom_target,
        indicator.is_reduction_target
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        indicator_code,
        indicator_name_km: indicator.indicator_name_km,
        indicator_name_en: indicator.indicator_name_en,
        partner_baseline,
        calculated_target: calculation_result.calculated_target,
        rule_applied: calculation_result.rule_applied,
        explanation_km: calculation_result.calculation_explanation_km,
        explanation_en: calculation_result.calculation_explanation_en,
        is_auto_calculated: calculation_result.is_auto_calculated,
        custom_target_validation
      }
    })
  } catch (error: any) {
    console.error('Error calculating target:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate target',
        message: error.message
      },
      { status: 500 }
    )
  }
}
