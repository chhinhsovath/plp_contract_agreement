import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/contracts/reset-incomplete
 * Delete incomplete contract and reset user's contract_signed flag
 * For users who signed Contract Type 4 or 5 without proper configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, contractType } = body

    if (!userId || !contractType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Only allow Contract Type 4 & 5
    if (contractType !== 4 && contractType !== 5) {
      return NextResponse.json(
        { error: 'Only Contract Type 4 and 5 can be reset' },
        { status: 400 }
      )
    }

    // Find user's incomplete contract
    const contract = await prisma.contracts.findFirst({
      where: {
        created_by_id: parseInt(userId),
        contract_type_id: contractType,
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
      return NextResponse.json(
        { error: 'No contract found for this user' },
        { status: 404 }
      )
    }

    // Only delete if contract has no deliverable selections (incomplete)
    if (contract.deliverable_selections.length === 0 || contract.contract_indicators.length === 0) {
      // Delete the incomplete contract (cascade will delete related records)
      await prisma.contracts.delete({
        where: { id: contract.id }
      })

      // Reset user's contract_signed flag
      await prisma.users.update({
        where: { id: parseInt(userId) },
        data: {
          contract_signed: false,
          contract_signed_date: null,
          signature_data: null
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Incomplete contract deleted, user can reconfigure',
        contractId: contract.id
      })
    } else {
      // Contract is complete, don't delete
      return NextResponse.json(
        { error: 'Contract has configuration, cannot reset' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error resetting incomplete contract:', error)
    return NextResponse.json(
      { error: 'Failed to reset contract', message: error.message },
      { status: 500 }
    )
  }
}
