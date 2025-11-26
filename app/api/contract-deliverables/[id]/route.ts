import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * PUT /api/contract-deliverables/[id]
 * Update a deliverable's title, timeline, and activities
 * SUPER_ADMIN only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. SUPER_ADMIN access required.' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const deliverableId = parseInt(resolvedParams.id)

    if (isNaN(deliverableId)) {
      return NextResponse.json(
        { error: 'Invalid deliverable ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { deliverable_title_khmer, deliverable_title_english, timeline, activities_text } = body

    // Validate required fields
    if (!deliverable_title_khmer || !deliverable_title_english || !timeline) {
      return NextResponse.json(
        { error: 'Missing required fields: deliverable_title_khmer, deliverable_title_english, timeline' },
        { status: 400 }
      )
    }

    // Check if deliverable exists
    const existing = await prisma.contract_deliverables.findUnique({
      where: { id: deliverableId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Deliverable not found' },
        { status: 404 }
      )
    }

    // Update deliverable
    const updated = await prisma.contract_deliverables.update({
      where: { id: deliverableId },
      data: {
        deliverable_title_khmer,
        deliverable_title_english,
        timeline,
        activities_text: activities_text || null,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Deliverable updated successfully',
      deliverable: {
        id: updated.id,
        deliverable_number: updated.deliverable_number,
        deliverable_title_khmer: updated.deliverable_title_khmer,
        deliverable_title_english: updated.deliverable_title_english,
        timeline: updated.timeline,
        activities_text: updated.activities_text
      }
    })
  } catch (error: any) {
    console.error('Error updating deliverable:', error)
    return NextResponse.json(
      {
        error: 'Failed to update deliverable',
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}
