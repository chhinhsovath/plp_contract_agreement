import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * PUT /api/deliverable-options/[id]
 * Update a deliverable option's text (Khmer and English)
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
    const optionId = parseInt(resolvedParams.id)

    if (isNaN(optionId)) {
      return NextResponse.json(
        { error: 'Invalid option ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { option_text_khmer, option_text_english, baseline_percentage, target_percentage } = body

    // Validate required fields
    if (!option_text_khmer || !option_text_english) {
      return NextResponse.json(
        { error: 'Missing required fields: option_text_khmer, option_text_english' },
        { status: 400 }
      )
    }

    // Parse percentages (allow null)
    const parsedBaseline = baseline_percentage !== undefined && baseline_percentage !== null && baseline_percentage !== ''
      ? parseFloat(baseline_percentage)
      : null
    const parsedTarget = target_percentage !== undefined && target_percentage !== null && target_percentage !== ''
      ? parseFloat(target_percentage)
      : null

    // Check if option exists
    const existing = await prisma.deliverable_options.findUnique({
      where: { id: optionId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Deliverable option not found' },
        { status: 404 }
      )
    }

    // Update option
    const updated = await prisma.deliverable_options.update({
      where: { id: optionId },
      data: {
        option_text_khmer,
        option_text_english,
        baseline_percentage: parsedBaseline,
        target_percentage: parsedTarget,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Deliverable option updated successfully',
      option: {
        id: updated.id,
        option_number: updated.option_number,
        option_text_khmer: updated.option_text_khmer,
        option_text_english: updated.option_text_english,
        baseline_percentage: updated.baseline_percentage,
        target_percentage: updated.target_percentage
      }
    })
  } catch (error: any) {
    console.error('Error updating deliverable option:', error)
    return NextResponse.json(
      {
        error: 'Failed to update deliverable option',
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}
