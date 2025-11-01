import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * GET /api/contracts/print/[id]
 * Fetch contract data with deliverable selections for PDF printing
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const contractId = parseInt(params.id)

    // Fetch contract with all related data
    const contract = await prisma.contracts.findUnique({
      where: { id: contractId },
      include: {
        contract_type: true,
        deliverable_selections: {
          include: {
            deliverable: true,
            selected_option: true
          },
          orderBy: {
            deliverable: {
              deliverable_number: 'asc'
            }
          }
        },
        contract_indicators: {
          include: {
            indicator: true
          },
          orderBy: {
            indicator: {
              indicator_number: 'asc'
            }
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Verify user has access to this contract (allow owner or admins)
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    const isOwner = contract.created_by_id === Number(session.userId)
    const isAdmin = user && ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user.role)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Format deliverables with selected indicators
    const deliverables = contract.deliverable_selections.map((selection) => {
      const deliverable = selection.deliverable
      const selectedOption = selection.selected_option

      // Use only the selected option text as it appears in the milestone table
      const indicatorText = selectedOption.option_text_khmer

      return {
        deliverable_number: deliverable.deliverable_number,
        deliverable_title_khmer: deliverable.deliverable_title_khmer,
        deliverable_title_english: deliverable.deliverable_title_english,
        timeline: deliverable.timeline,
        activities_text: deliverable.activities_text,
        selected_option_number: selectedOption.option_number,
        selected_indicator_text: indicatorText,
        baseline_percentage: selectedOption.baseline_percentage,
        target_percentage: selectedOption.target_percentage
      }
    })

    // Format response
    const printData = {
      id: contract.id,
      contract_id: contract.id,
      created_by_id: contract.created_by_id,
      contract_number: contract.contract_number,
      contract_type_id: contract.contract_type_id,
      contract_type_name: contract.contract_type.type_name_khmer,
      party_a_name: contract.party_a_name,
      party_a_signature: contract.party_a_signature,
      party_a_signed_date: contract.party_a_signed_date,
      party_b_name: contract.party_b_name,
      party_b_signature: contract.party_b_signature,
      party_b_signed_date: contract.party_b_signed_date,
      party_b_organization: contract.party_b_organization,
      party_b_position: contract.party_b_position,
      start_date: contract.start_date,
      end_date: contract.end_date,
      signed_date: contract.party_b_signed_date,
      section_order: contract.section_order,
      contract_html: contract.contract_html,
      download_count: contract.download_count,
      deliverables: deliverables,
      indicators: contract.contract_indicators.map(ci => ({
        indicator_code: ci.indicator.indicator_code,
        indicator_name_km: ci.indicator.indicator_name_km,
        baseline_percentage: ci.baseline_percentage,
        target_percentage: ci.target_percentage,
        selected_rule: ci.selected_rule
      }))
    }

    return NextResponse.json(printData)
  } catch (error: any) {
    console.error('Error fetching contract for print:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract', message: error.message },
      { status: 500 }
    )
  }
}
