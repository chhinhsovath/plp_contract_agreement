import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

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
    const { html } = body

    if (!html) {
      return NextResponse.json({ error: 'HTML content required' }, { status: 400 })
    }

    // Get contract to verify ownership
    const contract = await prisma.contracts.findUnique({
      where: { id: contractId },
      select: { created_by_id: true }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Check permissions
    const userId = Number(session.userId)
    const isOwner = contract.created_by_id === userId

    if (!isOwner) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (!user || !['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Save HTML to contract
    await prisma.contracts.update({
      where: { id: contractId },
      data: {
        contract_html: html,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'បានរក្សាទុកឯកសារ'
    })
  } catch (error) {
    console.error('Save HTML error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
