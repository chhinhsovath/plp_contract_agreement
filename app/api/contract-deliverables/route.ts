import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/contract-deliverables?contract_type=4
 * Get all deliverables and their options for a contract type
 * Used by partners to configure their contract selections
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contract_type = searchParams.get('contract_type')

    if (!contract_type) {
      return NextResponse.json(
        { error: 'contract_type is required' },
        { status: 400 }
      )
    }

    const contractTypeNum = parseInt(contract_type)

    // Only allow Contract 4 & 5 (DoE-District and DoE-School)
    if (contractTypeNum !== 4 && contractTypeNum !== 5) {
      return NextResponse.json(
        { error: 'Only Contract Type 4 and 5 are supported for configuration' },
        { status: 400 }
      )
    }

    // Fetch deliverables with their options
    const deliverables = await prisma.contract_deliverables.findMany({
      where: {
        contract_type: contractTypeNum,
        is_active: true
      },
      include: {
        deliverable_options: {
          where: {
            is_active: true
          },
          orderBy: {
            option_number: 'asc'
          }
        }
      },
      orderBy: {
        deliverable_number: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      contract_type: contractTypeNum,
      deliverables: deliverables.map(d => ({
        id: d.id,
        deliverable_number: d.deliverable_number,
        deliverable_title_khmer: d.deliverable_title_khmer,
        deliverable_title_english: d.deliverable_title_english,
        timeline: d.timeline,
        activities_text: d.activities_text,
        options: d.deliverable_options.map(opt => ({
          id: opt.id,
          option_number: opt.option_number,
          option_text_khmer: opt.option_text_khmer,
          option_text_english: opt.option_text_english,
          condition_type: opt.condition_type,
          baseline_percentage: opt.baseline_percentage,
          target_percentage: opt.target_percentage
        }))
      })),
      total: deliverables.length
    })
  } catch (error: any) {
    console.error('Error fetching contract deliverables:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch contract deliverables',
        message: error.message
      },
      { status: 500 }
    )
  }
}
