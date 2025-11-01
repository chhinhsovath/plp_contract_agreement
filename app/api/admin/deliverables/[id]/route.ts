import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PUT - Update deliverable
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

    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const deliverableId = parseInt(params.id)

    const deliverable = await prisma.contract_deliverables.update({
      where: { id: deliverableId },
      data: {
        deliverable_title_khmer: body.deliverable_title_khmer,
        deliverable_title_english: body.deliverable_title_english || null,
        timeline: body.timeline,
        activities_text: body.activities_text || null,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, deliverable })
  } catch (error) {
    console.error('Update deliverable error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete deliverable
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'SUPER_ADMIN access required' }, { status: 403 })
    }

    const deliverableId = parseInt(params.id)

    await prisma.contract_deliverables.update({
      where: { id: deliverableId },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, message: 'Deliverable deleted' })
  } catch (error) {
    console.error('Delete deliverable error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
