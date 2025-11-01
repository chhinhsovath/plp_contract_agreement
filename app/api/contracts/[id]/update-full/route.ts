import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const contractId = parseInt(params.id)
    const body = await request.json()

    // Get contract to verify ownership
    const contract = await prisma.contracts.findUnique({
      where: { id: contractId },
      select: { created_by_id: true }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Check permissions
    const userId = Number(session.userId)
    const isOwner = contract.created_by_id === userId

    if (!isOwner) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (!user || !['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Update contract basic info
    const updated = await prisma.contracts.update({
      where: { id: contractId },
      data: {
        party_a_name: body.party_a_name,
        party_b_name: body.party_b_name,
        party_b_organization: body.party_b_organization || null,
        party_b_position: body.party_b_position || null,
        start_date: body.start_date ? new Date(body.start_date) : undefined,
        end_date: body.end_date ? new Date(body.end_date) : undefined,
        updated_at: new Date()
      }
    })

    // Update deliverables if provided
    if (body.deliverables && Array.isArray(body.deliverables)) {
      for (const deliverable of body.deliverables) {
        // Find the selection record
        const selection = await prisma.contract_deliverable_selections.findFirst({
          where: {
            contract_id: contractId,
            deliverable: {
              deliverable_number: deliverable.deliverable_number
            }
          },
          include: {
            deliverable: true,
            selected_option: true
          }
        })

        if (selection) {
          // Update deliverable title
          await prisma.contract_deliverables.update({
            where: { id: selection.deliverable_id },
            data: {
              deliverable_title_khmer: deliverable.deliverable_title_khmer,
              deliverable_title_english: deliverable.deliverable_title_english || null,
              timeline: deliverable.timeline,
              updated_at: new Date()
            }
          })

          // Update selected option text and percentages
          await prisma.deliverable_options.update({
            where: { id: selection.selected_option_id },
            data: {
              option_text_khmer: deliverable.selected_indicator_text,
              baseline_percentage: deliverable.baseline_percentage,
              target_percentage: deliverable.target_percentage,
              updated_at: new Date()
            }
          })
        }
      }
    }

    // Update indicators if provided
    if (body.indicators && Array.isArray(body.indicators)) {
      for (const indicator of body.indicators) {
        const contractIndicator = await prisma.contract_indicators.findFirst({
          where: {
            contract_id: contractId,
            indicator: {
              indicator_code: indicator.indicator_code
            }
          },
          include: {
            indicator: true
          }
        })

        if (contractIndicator) {
          // Update indicator
          await prisma.indicators.update({
            where: { id: contractIndicator.indicator_id },
            data: {
              indicator_name_km: indicator.indicator_name_km,
              updated_at: new Date()
            }
          })

          // Update contract indicator baseline/target
          await prisma.contract_indicators.update({
            where: { id: contractIndicator.id },
            data: {
              baseline_percentage: indicator.baseline_percentage,
              target_percentage: indicator.target_percentage,
              updated_at: new Date()
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'បានធ្វើបច្ចុប្បន្នភាពទាំងអស់',
      contract: updated
    })
  } catch (error) {
    console.error('Update full contract error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
