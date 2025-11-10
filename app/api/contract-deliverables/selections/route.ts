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

    // If no contract exists but user has signed, create a contract record
    // This handles the case where user signed before configuring deliverables
    if (!contract && user.contract_signed) {
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

      // Create contract with 1-year duration
      const signedDate = fullUser?.contract_signed_date || new Date()
      const endDate = new Date(signedDate)
      endDate.setFullYear(endDate.getFullYear() + 1)

      contract = await prisma.contracts.create({
        data: {
          contract_number,
          contract_type_id: user.contract_type,
          party_a_name: partyANames[user.contract_type] || 'នាយកដ្ឋានអប់រំយុវជន និងកីឡាខេត្ត/រាជធានី',
          party_a_signature: partyASignature,
          party_a_signed_date: signedDate,
          party_b_name: fullUser?.full_name || 'Unknown',
          party_b_signature: fullUser?.signature_data || '',
          start_date: signedDate,
          end_date: endDate,
          status: 'signed',
          party_b_signed_date: signedDate,
          created_by_id: user.id
        },
        select: {
          id: true,
          status: true
        }
      })
    }

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
              suggestion: 'User needs to sign the contract before configuring deliverables.'
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
      baseline_percentage: s.baseline_percentage,
      baseline_source: s.baseline_source,
      baseline_date: s.baseline_date ? new Date(s.baseline_date) : new Date(),
      baseline_notes: s.baseline_notes || null,
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
