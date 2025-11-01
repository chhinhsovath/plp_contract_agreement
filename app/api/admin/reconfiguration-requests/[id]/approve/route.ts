import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
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

    // Check if user is SUPER_ADMIN
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true, id: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - SUPER_ADMIN access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { reviewerNotes } = body
    const requestId = parseInt(params.id)

    // Get the request
    const reconfigRequest = await prisma.reconfiguration_requests.findUnique({
      where: { id: requestId },
      include: {
        user: true
      }
    })

    if (!reconfigRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (reconfigRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been reviewed' },
        { status: 400 }
      )
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update request status
      await tx.reconfiguration_requests.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          reviewed_by_id: user.id,
          reviewed_at: new Date(),
          reviewer_notes: reviewerNotes || 'Approved'
        }
      })

      // Reset user's configuration_complete flag to allow reconfiguration
      await tx.users.update({
        where: { id: reconfigRequest.user_id },
        data: {
          configuration_complete: false,
          updated_at: new Date()
        }
      })

      // Delete existing contract deliverable selections for this user
      // First, get the user's contract to find their selections
      const userContract = await tx.contracts.findFirst({
        where: {
          created_by_id: reconfigRequest.user_id
        },
        select: {
          id: true
        }
      })

      if (userContract) {
        await tx.contract_deliverable_selections.deleteMany({
          where: {
            contract_id: userContract.id
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Request approved successfully. User can now reconfigure their indicators.'
    })
  } catch (error) {
    console.error('Approve request error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
