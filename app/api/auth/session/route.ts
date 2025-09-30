import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get fresh user data from database
    const user = await prisma.users.findUnique({
      where: { id: Number(session.userId) },
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        role: true,
        contract_type: true,
        organization: true,
        position: true,
        email: true,
        is_active: true,
        contract_signed: true,
        contract_signed_date: true,
        signature_data: true,  // Include signature data
        contract_read_time: true,
        ip_address_signed: true,
      },
    })

    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Session check failed' },
      { status: 500 }
    )
  }
}