import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * POST /api/contract-deliverables/selections
 * Save deliverable selections for a user's contract
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const session = await getSession()

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { selections } = body

    if (!selections || !Array.isArray(selections)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'selections array is required',
            code: 'INVALID_INPUT'
          }
        },
        { status: 400 }
      )
    }

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: {
        id: true,
        contract_type: true,
        contract_signed: true
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    // Check if user has Type 4 or 5 contract
    if (user.contract_type !== 4 && user.contract_type !== 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Only Contract Type 4 and 5 users can save deliverable selections',
            code: 'INVALID_CONTRACT_TYPE'
          }
        },
        { status: 400 }
      )
    }

    // Find the user's contract (latest one for their contract type - signed or draft)
    const contract = await prisma.contracts.findFirst({
      where: {
        contract_type_id: user.contract_type,
        created_by_id: user.id
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        status: true
      }
    })

    if (!contract) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No contract found for this user. Please sign the contract first, then configure deliverables.',
            code: 'CONTRACT_NOT_FOUND',
            meta: {
              userContractSigned: user.contract_signed,
              contractType: user.contract_type,
              suggestion: 'User has contract_signed flag but no contract record. This is a data inconsistency.'
            }
          }
        },
        { status: 404 }
      )
    }

    // Delete existing selections for this contract
    await prisma.contract_deliverable_selections.deleteMany({
      where: {
        contract_id: contract.id
      }
    })

    // Insert new selections
    const selectionsData = selections.map((s: any) => ({
      contract_id: contract.id,
      deliverable_id: s.deliverable_id,
      selected_option_id: s.selected_option_id,
      selected_by: String(user.id),
      selected_at: new Date()
    }))

    await prisma.contract_deliverable_selections.createMany({
      data: selectionsData
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Deliverable selections saved successfully',
        data: {
          contractId: contract.id,
          selectionsCount: selections.length
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error saving deliverable selections:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to save deliverable selections',
          code: 'SAVE_SELECTIONS_ERROR',
          meta: {
            error: error.message
          }
        }
      },
      { status: 500 }
    )
  }
}
