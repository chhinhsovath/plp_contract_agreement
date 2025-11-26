import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

/**
 * PATCH /api/admin/indicators/[id]/calculation-rules
 * Update calculation rules for an indicator
 * SUPER_ADMIN only
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const body = await request.json()
    const { calculation_rules } = body

    // Validate calculation_rules is an array with 3 items
    if (!Array.isArray(calculation_rules) || calculation_rules.length !== 3) {
      return NextResponse.json(
        { error: 'calculation_rules must be an array with exactly 3 items' },
        { status: 400 }
      )
    }

    // Validate each rule has required fields
    for (const rule of calculation_rules) {
      if (!rule.condition || !rule.description_km || !rule.description_en) {
        return NextResponse.json(
          { error: 'Each rule must have condition, description_km, and description_en' },
          { status: 400 }
        )
      }
    }

    // Update the me_indicator
    const updatedIndicator = await prisma.me_indicators.update({
      where: { id: Number(resolvedParams.id) },
      data: {
        calculation_rules: calculation_rules
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Calculation rules updated successfully',
      indicator: updatedIndicator
    })
  } catch (error: any) {
    console.error('Error updating calculation rules:', error)
    return NextResponse.json(
      {
        error: 'Failed to update calculation rules',
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}
