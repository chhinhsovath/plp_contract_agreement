import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getPartyASignatureBase64 } from '@/lib/defaultPartyA'

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
    let contract = await prisma.contracts.findFirst({
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

    // If no contract exists, create one (for new workflow where configuration happens before signing)
    if (!contract) {
      // Generate contract number
      const timestamp = Date.now()
      const contract_number = `PLP-${user.contract_type}-${timestamp}`

      // Get party A name based on contract type
      const partyANames: any = {
        4: 'នាយកដ្ឋានអប់រំយុវជន និងកីឡាខេត្ត/រាជធានី',
        5: 'នាយកដ្ឋានអប់រំយុវជន និងកីឡាខេត្ត/រាជធានី'
      }

      // Get user's full details for contract creation
      const fullUser = await prisma.users.findUnique({
        where: { id: user.id },
        select: {
          full_name: true,
          signature_data: true,
          contract_signed_date: true
        }
      })

      // Get Party A signature as base64
      const partyASignature = await getPartyASignatureBase64()

      // Create contract
      // Status depends on whether user has signed
      const contractStatus = user.contract_signed ? 'signed' : 'draft'
      const signedDate = user.contract_signed ? (fullUser?.contract_signed_date || new Date()) : new Date()
      const endDate = new Date(signedDate)
      endDate.setFullYear(endDate.getFullYear() + 1)

      contract = await prisma.contracts.create({
        data: {
          contract_number,
          contract_type_id: user.contract_type,
          party_a_name: partyANames[user.contract_type] || 'នាយកដ្ឋានអប់រំយុវជន និងកីឡាខេត្ត/រាជធានី',
          party_a_signature: partyASignature,
          party_a_signed_date: user.contract_signed ? signedDate : null,
          party_b_name: fullUser?.full_name || 'Unknown',
          party_b_signature: fullUser?.signature_data || '',
          start_date: signedDate,
          end_date: endDate,
          status: contractStatus,
          party_b_signed_date: user.contract_signed ? signedDate : null,
          created_by_id: user.id
        },
        select: {
          id: true,
          status: true
        }
      })
    }


    // Delete existing selections for this contract
    await prisma.contract_deliverable_selections.deleteMany({
      where: {
        contract_id: contract.id
      }
    })

    // For Type 5, fetch deliverables to know which ones are 2 & 3 (for Yes/No handling)
    let deliverableMap: Map<number, any> = new Map()
    if (user.contract_type === 5) {
      const typeDeliverables = await prisma.contract_deliverables.findMany({
        where: {
          contract_type: 5,
          is_active: true
        },
        select: {
          id: true,
          deliverable_number: true
        }
      })
      typeDeliverables.forEach(d => deliverableMap.set(d.id, d))
    }

    // Insert new selections
    const selectionsData = selections.map((s: any) => {
      // For Type 5 deliverables 2 & 3: store yes_no_answer in baseline_source
      const deliverable = deliverableMap.get(s.deliverable_id)
      const isType5Deliverable2Or3 = user.contract_type === 5 && deliverable && (deliverable.deliverable_number === 2 || deliverable.deliverable_number === 3)

      return {
        contract_id: contract.id,
        deliverable_id: s.deliverable_id,
        selected_option_id: s.selected_option_id,
        baseline_percentage: isType5Deliverable2Or3 ? null : (s.baseline_percentage || null),
        baseline_source: isType5Deliverable2Or3 ? (s.yes_no_answer ? (s.yes_no_answer === 'yes' ? 'Yes' : 'No') : null) : (s.baseline_source || null),
        baseline_date: isType5Deliverable2Or3 ? null : (s.baseline_date ? new Date(s.baseline_date) : new Date()),
        baseline_notes: isType5Deliverable2Or3 ? null : (s.baseline_notes || null),
        selected_by: String(user.id),
        selected_at: new Date()
      }
    })

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
          code: error.code || 'SAVE_SELECTIONS_ERROR',
          meta: {
            errorMessage: error.message,
            errorCode: error.code,
            errorMeta: error.meta,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          }
        }
      },
      { status: 500 }
    )
  }
}
