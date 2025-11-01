import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (!reviewerNotes || !reviewerNotes.trim()) {
      return NextResponse.json(
        { error: 'Reviewer notes are required for rejection' },
        { status: 400 }
      )
    }

    // Get the request
    const reconfigRequest = await prisma.reconfiguration_requests.findUnique({
      where: { id: requestId }
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

    // Update request status
    await prisma.reconfiguration_requests.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        reviewed_by_id: user.id,
        reviewed_at: new Date(),
        reviewer_notes: reviewerNotes
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Request rejected successfully'
    })
  } catch (error) {
    console.error('Reject request error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
