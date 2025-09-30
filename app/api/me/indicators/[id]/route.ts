import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { UserRole } from '@/lib/roles'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) }
    })

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()

    const indicator = await prisma.me_indicators.update({
      where: { id },
      data: {
        indicator_code: body.indicator_code,
        indicator_name_khmer: body.indicator_name_khmer,
        indicator_name_english: body.indicator_name_english,
        indicator_type: body.indicator_type,
        measurement_unit: body.measurement_unit,
        baseline_value: body.baseline_value,
        target_value: body.target_value,
        frequency: body.frequency,
        contract_type: body.contract_type,
        description: body.description
      }
    })

    return NextResponse.json({ indicator })
  } catch (error) {
    console.error('Error updating indicator:', error)
    return NextResponse.json(
      { error: 'Failed to update indicator' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
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
      return NextResponse.json({ error: 'Unauthorized - Only Super Admin can delete' }, { status: 403 })
    }

    const params = await context.params
    const id = parseInt(params.id)

    // Delete related data collections first
    await prisma.me_data_collection.deleteMany({
      where: { indicator_id: id }
    })

    // Delete related activities
    await prisma.me_activities.deleteMany({
      where: { indicator_id: id }
    })

    // Delete the indicator
    await prisma.me_indicators.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting indicator:', error)
    return NextResponse.json(
      { error: 'Failed to delete indicator' },
      { status: 500 }
    )
  }
}