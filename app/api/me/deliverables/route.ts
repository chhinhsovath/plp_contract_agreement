/**
 * API endpoint for fetching current user's contract deliverable selections
 * GET /api/me/deliverables
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
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
          success: true,
          data: {
            hasDeliverables: false,
            message: 'Deliverables are only for Agreement Types 4 and 5'
          }
        },
        { status: 200 }
      )
    }

    // Find the user's contract (latest one for their contract type)
    const contract = await prisma.contracts.findFirst({
      where: {
        contract_type_id: user.contract_type,
        OR: [
          { created_by: user.id.toString() },
          { party_a_name: { contains: user.id.toString() } },
          { party_b_name: { contains: user.id.toString() } }
        ]
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        contract_type_id: true
      }
    })

    if (!contract) {
      return NextResponse.json(
        {
          success: true,
          data: {
            hasDeliverables: false,
            message: 'No contract found for this user'
          }
        },
        { status: 200 }
      )
    }

    // Fetch all deliverables for this contract type with ALL options
    const deliverables = await prisma.contract_deliverables.findMany({
      where: {
        contract_type: contract.contract_type_id,
        is_active: true
      },
      include: {
        options: {
          where: { is_active: true },
          orderBy: { option_number: 'asc' }
        }
      },
      orderBy: {
        deliverable_number: 'asc'
      }
    })

    // Fetch user's selections
    const selections = await prisma.contract_deliverable_selections.findMany({
      where: {
        contract_id: contract.id
      },
      select: {
        deliverable_id: true,
        selected_option_id: true
      }
    })

    // Map selections for quick lookup
    const selectionMap = new Map(
      selections.map(s => [s.deliverable_id, s.selected_option_id])
    )

    // Add selection info to deliverables
    const deliverablesWithSelections = deliverables.map(d => ({
      ...d,
      selected_option_id: selectionMap.get(d.id) || null
    }))

    return NextResponse.json(
      {
        success: true,
        data: {
          hasDeliverables: true,
          contractId: contract.id,
          contractType: contract.contract_type_id,
          deliverables: deliverablesWithSelections,
          total: deliverables.length
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error fetching user deliverables:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch deliverables',
          code: 'FETCH_DELIVERABLES_ERROR',
          meta: {
            error: error.message
          }
        }
      },
      { status: 500 }
    )
  }
}
