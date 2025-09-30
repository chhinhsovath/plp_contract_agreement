import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, contractType, signature, readTime, agreed } = body

    // Verify user ID matches session
    if (Number(session.userId) !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get IP address
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Update user record with signing information
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        contract_signed: true,
        contract_signed_date: new Date(),
        signature_data: signature,
        contract_read_time: readTime,
        ip_address_signed: ip
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contract signed successfully',
      signedDate: updatedUser.contract_signed_date
    })
  } catch (error) {
    console.error('Error signing contract:', error)
    return NextResponse.json(
      { error: 'Failed to sign contract' },
      { status: 500 }
    )
  }
}