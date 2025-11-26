import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

/**
 * PUT /api/me/indicators/[id]
 * Update an indicator
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

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. SUPER_ADMIN access required.' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const indicatorId = parseInt(resolvedParams.id)

    if (isNaN(indicatorId)) {
      return NextResponse.json(
        { error: 'Invalid indicator ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      indicator_code,
      indicator_name_khmer,
      indicator_name_english,
      indicator_type,
      measurement_unit,
      baseline_value,
      target_value,
      frequency,
      contract_type,
      description
    } = body

    // Validate required fields
    if (!indicator_code || !indicator_name_khmer) {
      return NextResponse.json(
        { error: 'Missing required fields: indicator_code, indicator_name_khmer' },
        { status: 400 }
      )
    }

    // Check if indicator exists
    const existing = await prisma.me_indicators.findUnique({
      where: { id: indicatorId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Indicator not found' },
        { status: 404 }
      )
    }

    // Update indicator
    const updated = await prisma.me_indicators.update({
      where: { id: indicatorId },
      data: {
        indicator_code,
        indicator_name_khmer,
        indicator_name_english,
        indicator_type,
        measurement_unit,
        baseline_value: baseline_value !== undefined && baseline_value !== null && baseline_value !== ''
          ? parseFloat(baseline_value)
          : undefined,
        target_value: target_value !== undefined && target_value !== null && target_value !== ''
          ? parseFloat(target_value)
          : undefined,
        frequency,
        contract_type: contract_type ? parseInt(contract_type) : undefined,
        description,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Indicator updated successfully',
      indicator: updated
    })
  } catch (error: any) {
    console.error('Error updating indicator:', error)
    return NextResponse.json(
      {
        error: 'Failed to update indicator',
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/me/indicators/[id]
 * Delete an indicator
 * SUPER_ADMIN only
 */
export async function DELETE(
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

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. SUPER_ADMIN access required.' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const indicatorId = parseInt(resolvedParams.id)

    if (isNaN(indicatorId)) {
      return NextResponse.json(
        { error: 'Invalid indicator ID' },
        { status: 400 }
      )
    }

    // Check if indicator exists
    const existing = await prisma.me_indicators.findUnique({
      where: { id: indicatorId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Indicator not found' },
        { status: 404 }
      )
    }

    // Delete indicator
    await prisma.me_indicators.delete({
      where: { id: indicatorId }
    })

    return NextResponse.json({
      success: true,
      message: 'Indicator deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting indicator:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete indicator',
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/me/indicators/[id]
 * Update indicator name only (inline editing)
 * SUPER_ADMIN only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) }
    })

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. SUPER_ADMIN access required.' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const indicatorId = parseInt(resolvedParams.id)

    const body = await request.json()
    const { indicator_name_khmer, indicator_name_english } = body

    if (!indicator_name_khmer) {
      return NextResponse.json(
        { error: 'indicator_name_khmer is required' },
        { status: 400 }
      )
    }

    const updated = await prisma.me_indicators.update({
      where: { id: indicatorId },
      data: {
        indicator_name_khmer,
        indicator_name_english: indicator_name_english || null,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      indicator: updated
    })
  } catch (error: any) {
    console.error('Error updating indicator:', error)
    return NextResponse.json(
      { error: 'Failed to update indicator', message: error.message },
      { status: 500 }
    )
  }
}
