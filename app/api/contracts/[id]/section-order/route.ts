import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Prisma } from '@prisma/client'

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
    const { section_order } = body

    if (!section_order || !Array.isArray(section_order)) {
      return NextResponse.json({ error: 'Invalid section order' }, { status: 400 })
    }

    // Get the contract to verify ownership
    const contract = await prisma.contracts.findUnique({
      where: { id: contractId },
      select: { created_by_id: true }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Only allow contract owner or admins to reorder
    const userId = Number(session.userId)
    if (contract.created_by_id !== userId) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (!user || !['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Update section order
    const updated = await prisma.contracts.update({
      where: { id: contractId },
      data: {
        section_order: section_order as any,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'បានរក្សាទុករចនាសម្ព័ន្ធ',
      section_order: updated.section_order
    })
  } catch (error) {
    console.error('Update section order error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Reset to default order
export async function POST(
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

    // Reset to default by setting to null
    await prisma.contracts.update({
      where: { id: contractId },
      data: {
        section_order: Prisma.JsonNull,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'បានកំណត់រចនាសម្ព័ន្ធឡើងវិញ'
    })
  } catch (error) {
    console.error('Reset section order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
