import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PUT - Update content text
export async function PUT(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  const params = await context.params
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is COORDINATOR or higher
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - COORDINATOR access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { text_khmer, text_english, category, description } = body
    const key = decodeURIComponent(params.key)

    if (!text_khmer) {
      return NextResponse.json(
        { error: 'text_khmer is required' },
        { status: 400 }
      )
    }

    // Check if content exists
    const existing = await prisma.content_texts.findUnique({
      where: { key }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Content text not found' },
        { status: 404 }
      )
    }

    const text = await prisma.content_texts.update({
      where: { key },
      data: {
        text_khmer,
        text_english: text_english || null,
        category: category || existing.category,
        description: description !== undefined ? description : existing.description,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Content text updated successfully',
      text
    })
  } catch (error) {
    console.error('Update content text error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete content text
export async function DELETE(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  const params = await context.params
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is SUPER_ADMIN only
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - SUPER_ADMIN access required' },
        { status: 403 }
      )
    }

    const key = decodeURIComponent(params.key)

    // Soft delete by setting is_active to false
    const text = await prisma.content_texts.update({
      where: { key },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Content text deleted successfully',
      text
    })
  } catch (error) {
    console.error('Delete content text error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
