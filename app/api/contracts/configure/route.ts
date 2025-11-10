import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPartyASignatureBase64 } from '@/lib/defaultPartyA'

/**
 * POST /api/contracts/configure
 * Create contract with user's selected deliverable options
 * Supports Contract Types 1-5
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, contractType, selections, signature } = body

    // Validate input
    if (!userId || !contractType || !selections || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Allow Contract Types 1-5
    if (contractType < 1 || contractType > 5) {
      return NextResponse.json(
        { error: 'Invalid contract type. Supported types: 1-5' },
        { status: 400 }
      )
    }

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate contract number
    const timestamp = Date.now()
    const contract_number = `PLP-${contractType}-${timestamp}`

    // Get party A details based on contract type
    const partyANames: any = {
      1: 'គណៈកម្មាធិការគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ (គបស)',
      2: 'គណៈកម្មាធិការគ្រប់គ្រងគម្រោងថ្នាក់ក្រោមជាតិ (គបក)',
      3: 'ប្រធានគម្រោង',
      4: 'នាយកដ្ឋានបឋមសិក្សា',
      5: 'នាយកដ្ឋានបឋមសិក្សា'
    }

    // Get Party A signature as base64
    const partyASignature = await getPartyASignatureBase64()

    // Create contract with 1-year duration
    const today = new Date()
    const nextYear = new Date(today)
    nextYear.setFullYear(today.getFullYear() + 1)

    const contract = await prisma.contracts.create({
      data: {
        contract_number,
        contract_type_id: contractType,
        party_a_name: partyANames[contractType],
        party_a_signature: partyASignature,
        party_a_signed_date: today,
        party_b_name: user.full_name,
        party_b_signature: signature,
        start_date: today,
        end_date: nextYear,
        status: 'signed',
        party_b_signed_date: today,
        created_by_id: parseInt(userId)
      }
    })

    // Create deliverable selections
    const selectionPromises = selections.map((selection: any) =>
      prisma.contract_deliverable_selections.create({
        data: {
          contract_id: contract.id,
          deliverable_id: selection.deliverable_id,
          selected_option_id: selection.selected_option_id,
          baseline_percentage: selection.baseline_percentage || 0,
          baseline_source: selection.baseline_source || '',
          baseline_date: selection.baseline_date ? new Date(selection.baseline_date) : today,
          baseline_notes: selection.baseline_notes || null
        }
      })
    )

    await Promise.all(selectionPromises)

    // Get selected options with their baseline/target values
    const selectedOptions = await Promise.all(
      selections.map(async (selection: any) => {
        const option = await prisma.deliverable_options.findUnique({
          where: { id: selection.selected_option_id },
          include: {
            deliverable: {
              include: {
                _count: {
                  select: { options: true }
                }
              }
            }
          }
        })
        return option
      })
    )

    // Get indicators for this contract type
    // Indicators are organized by type: 101-105 (Type 1), 201-205 (Type 2), 301-305 (Type 3), etc.
    const indicatorRanges: any = {
      1: { min: 101, max: 105 },
      2: { min: 201, max: 205 },
      3: { min: 301, max: 305 },
      4: { min: 1, max: 5 },     // Existing indicators
      5: { min: 1, max: 5 }       // Existing indicators
    }

    const range = indicatorRanges[contractType] || { min: 1, max: 5 }

    const indicators = await prisma.indicators.findMany({
      where: {
        is_active: true,
        indicator_number: {
          gte: range.min,
          lte: range.max
        }
      },
      orderBy: {
        indicator_number: 'asc'
      },
      take: 5
    })

    // Create contract_indicators linkages with baseline/target from selected options
    const indicatorPromises = indicators.map((indicator, index) => {
      const selectedOption = selectedOptions[index]
      if (!selectedOption) return null

      return prisma.contract_indicators.create({
        data: {
          contract_id: contract.id,
          indicator_id: indicator.id,
          baseline_percentage: selectedOption.baseline_percentage || indicator.baseline_percentage,
          baseline_date: today,
          target_percentage: selectedOption.target_percentage || indicator.target_percentage,
          target_date: nextYear,
          selected_rule: selectedOption.option_number
        }
      })
    })

    await Promise.all(indicatorPromises.filter(p => p !== null))

    // Update user's contract_signed flag
    await prisma.users.update({
      where: { id: parseInt(userId) },
      data: {
        contract_signed: true,
        contract_type: contractType
      }
    })

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        contract_number: contract.contract_number,
        contract_type_id: contract.contract_type_id,
        status: contract.status
      },
      message: 'Contract created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating contract:', error)
    return NextResponse.json(
      {
        error: 'Failed to create contract',
        message: error.message
      },
      { status: 500 }
    )
  }
}
