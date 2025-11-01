import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, readTime } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user to mark contract as read
    await prisma.users.update({
      where: { id: userId },
      data: {
        contract_read: true,
        contract_read_time: readTime || 0,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contract marked as read'
    })
  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
