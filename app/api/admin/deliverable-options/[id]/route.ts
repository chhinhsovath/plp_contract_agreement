import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PUT - Update deliverable option
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
    const optionId = parseInt(params.id)

    const option = await prisma.deliverable_options.update({
      where: { id: optionId },
      data: {
        option_text_khmer: body.option_text_khmer,
        option_text_english: body.option_text_english || null,
        baseline_percentage: body.baseline_percentage ? parseFloat(body.baseline_percentage) : null,
        target_percentage: body.target_percentage ? parseFloat(body.target_percentage) : null,
        condition_type: body.condition_type,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, option })
  } catch (error) {
    console.error('Update option error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
