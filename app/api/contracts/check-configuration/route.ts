import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/contracts/check-configuration
 * Check if a user's contract has deliverable selections (for Contract Type 4 & 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Find user's contract
    const contract = await prisma.contracts.findFirst({
      where: {
        created_by_id: parseInt(userId),
        status: 'signed'
      },
      include: {
        deliverable_selections: true,
        contract_indicators: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    if (!contract) {
      // No contract found - this is handled elsewhere
      return NextResponse.json({
        hasConfiguration: true // Don't show error if no contract
      })
    }

    // Check if contract has deliverable selections
    const hasDeliverableSelections = contract.deliverable_selections.length > 0
    const hasContractIndicators = contract.contract_indicators.length > 0

    return NextResponse.json({
      hasConfiguration: hasDeliverableSelections && hasContractIndicators,
      contractId: contract.id,
      selectionsCount: contract.deliverable_selections.length,
      indicatorsCount: contract.contract_indicators.length
    })
  } catch (error: any) {
    console.error('Error checking configuration:', error)
    return NextResponse.json(
      { error: 'Failed to check configuration', message: error.message },
      { status: 500 }
    )
  }
}
