import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateTarget } from '@/lib/services/target-calculation'

/**
 * GET /api/contracts/[id]/indicators
 * Get all indicators selected for a contract
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contract_id = parseInt(id)

    const contract_indicators = await prisma.contract_indicators.findMany({
      where: { contract_id },
      include: {
        indicator: true
      },
      orderBy: { created_at: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: contract_indicators,
      count: contract_indicators.length
    })
  } catch (error: any) {
    console.error('Error fetching contract indicators:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contract indicators',
        message: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/contracts/[id]/indicators
 * Add indicator to contract with auto-target calculation
 *
 * Body: {
 *   indicator_id: number,
 *   baseline_percentage: number,
 *   baseline_source?: string,
 *   baseline_date: string (ISO date),
 *   baseline_notes?: string,
 *   target_date: string (ISO date),
 *   use_custom_target?: boolean,
 *   custom_target_percentage?: number,
 *   custom_target_justification?: string,
 *   justification_km?: string,
 *   justification_en?: string,
 *   selected_by?: string,
 *   selected_rule?: number (1, 2, or 3 - which calculation rule partner selected)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contract_id = parseInt(id)
    const body = await request.json()

    const {
      indicator_id,
      baseline_percentage,
      baseline_source,
      baseline_date,
      baseline_notes,
      target_date,
      use_custom_target,
      custom_target_percentage,
      custom_target_justification,
      justification_km,
      justification_en,
      selected_by,
      selected_rule
    } = body

    // Validation
    if (!indicator_id || baseline_percentage === undefined || !baseline_date || !target_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'indicator_id, baseline_percentage, baseline_date, and target_date are required'
        },
        { status: 400 }
      )
    }

    // Check if indicator already selected for this contract (UNIQUE CONSTRAINT)
    const existing = await prisma.contract_indicators.findUnique({
      where: {
        contract_id_indicator_id: {
          contract_id,
          indicator_id
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Indicator already selected',
          message: 'Each indicator can only be selected once per contract',
          error_code: 'DUPLICATE_INDICATOR'
        },
        { status: 409 }
      )
    }

    // Fetch indicator
    const indicator = await prisma.indicators.findUnique({
      where: { id: indicator_id }
    })

    if (!indicator) {
      return NextResponse.json(
        {
          success: false,
          error: 'Indicator not found',
          message: `Indicator with ID ${indicator_id} does not exist`
        },
        { status: 404 }
      )
    }

    // Calculate target
    const calculation_result = calculateTarget({
      indicator: indicator as any,
      partner_baseline: baseline_percentage
    })

    // Determine final target
    const final_target = use_custom_target && custom_target_percentage
      ? custom_target_percentage
      : calculation_result.calculated_target

    const calculation_method = use_custom_target ? 'custom' : 'based_on_baseline'

    // Create contract indicator
    const contract_indicator = await prisma.contract_indicators.create({
      data: {
        contract_id,
        indicator_id,
        baseline_percentage,
        baseline_source,
        baseline_date: new Date(baseline_date),
        baseline_notes,
        target_percentage: final_target,
        target_date: new Date(target_date),
        calculation_method,
        selected_rule,
        custom_target_justification: use_custom_target ? custom_target_justification : null,
        justification_km,
        justification_en,
        selected_by
      },
      include: {
        indicator: true
      }
    })

    return NextResponse.json({
      success: true,
      data: contract_indicator,
      calculation_info: {
        calculated_target: calculation_result.calculated_target,
        final_target,
        explanation_km: calculation_result.calculation_explanation_km,
        explanation_en: calculation_result.calculation_explanation_en,
        rule_applied: calculation_result.rule_applied
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding contract indicator:', error)

    // Handle unique constraint violation from database
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Indicator already selected',
          message: 'Each indicator can only be selected once per contract',
          error_code: 'DUPLICATE_INDICATOR'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add contract indicator',
        message: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/contracts/[id]/indicators?indicator_id=xxx
 * Remove indicator from contract
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contract_id = parseInt(id)
    const searchParams = request.nextUrl.searchParams
    const indicator_id = parseInt(searchParams.get('indicator_id') || '')

    if (!indicator_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing indicator_id',
          message: 'indicator_id query parameter is required'
        },
        { status: 400 }
      )
    }

    const deleted = await prisma.contract_indicators.delete({
      where: {
        contract_id_indicator_id: {
          contract_id,
          indicator_id
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Indicator removed from contract',
      data: deleted
    })
  } catch (error: any) {
    console.error('Error deleting contract indicator:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Indicator not found',
          message: 'This indicator was not selected for this contract'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove contract indicator',
        message: error.message
      },
      { status: 500 }
    )
  }
}
