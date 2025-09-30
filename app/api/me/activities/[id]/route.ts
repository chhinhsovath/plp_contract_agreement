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

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()

    const activity = await prisma.me_activities.update({
      where: { id },
      data: {
        activity_code: body.activity_code,
        activity_name_khmer: body.activity_name_khmer,
        activity_name_english: body.activity_name_english,
        indicator_id: body.indicator_id,
        planned_start: new Date(body.planned_start),
        planned_end: new Date(body.planned_end),
        actual_start: body.actual_start ? new Date(body.actual_start) : null,
        actual_end: body.actual_end ? new Date(body.actual_end) : null,
        status: body.status,
        budget_allocated: body.budget_allocated,
        budget_spent: body.budget_spent,
        responsible_person: body.responsible_person,
        location: body.location
      }
    })

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
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

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const params = await context.params
    const id = parseInt(params.id)

    // Delete related milestones first
    await prisma.me_milestones.deleteMany({
      where: { activity_id: id }
    })

    // Delete the activity
    await prisma.me_activities.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
}