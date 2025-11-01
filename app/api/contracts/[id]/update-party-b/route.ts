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
    const { party_b_name, party_b_organization, party_b_position } = body

    // Get the contract to verify ownership
    const contract = await prisma.contracts.findUnique({
      where: { id: contractId },
      select: { created_by_id: true }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Only allow the contract owner to edit their info
    const userId = Number(session.userId)
    if (contract.created_by_id !== userId) {
      // Allow SUPER_ADMIN and ADMIN to edit any contract
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
        return NextResponse.json(
          { error: 'You can only edit your own contract information' },
          { status: 403 }
        )
      }
    }

    // Update Party B information
    const updated = await prisma.contracts.update({
      where: { id: contractId },
      data: {
        party_b_name: party_b_name || undefined,
        party_b_organization: party_b_organization || undefined,
        party_b_position: party_b_position || undefined,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានដោយជោគជ័យ',
      contract: updated
    })
  } catch (error) {
    console.error('Update party B error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
