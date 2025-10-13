import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * GET /api/contracts/print/[id]
 * Fetch contract data with deliverable selections for PDF printing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const contractId = parseInt(id)

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

    // Verify user has access to this contract
    if (contract.created_by_id !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Format deliverables with selected indicators
    const deliverables = contract.deliverable_selections.map((selection) => {
      const deliverable = selection.deliverable
      const selectedOption = selection.selected_option

      // Build indicator text with baseline and target
      let indicatorText = selectedOption.option_text_khmer

      // Add baseline and target if available
      if (selectedOption.baseline_percentage !== null && selectedOption.target_percentage !== null) {
        indicatorText += ` ហើយមាន ${selectedOption.baseline_percentage}% លើទិន្នន័យមូលដ្ឋាន ត្រឹម ${selectedOption.target_percentage}%`
      }

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
      contract_id: contract.id,
      contract_number: contract.contract_number,
      contract_type_id: contract.contract_type_id,
      contract_type_name: contract.contract_type.type_name_khmer,
      party_a_name: contract.party_a_name,
      party_b_name: contract.party_b_name,
      party_b_organization: contract.party_b_organization,
      start_date: contract.start_date,
      end_date: contract.end_date,
      signed_date: contract.party_b_signed_date,
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
