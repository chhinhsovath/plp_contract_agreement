import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/roles'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, phone_number, passcode, organization, position, email } = body

    // Check if phone number already exists
    const existingUser = await prisma.users.findUnique({
      where: { phone_number },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'លេខទូរស័ព្ទនេះត្រូវបានប្រើប្រាស់រួចហើយ' },
        { status: 400 }
      )
    }

    // Determine role based on phone number
    // 077806680 is the SUPER_ADMIN
    let role = UserRole.VIEWER // Default role
    if (phone_number === '077806680') {
      role = UserRole.SUPER_ADMIN
    }

    // Create new user
    const user = await prisma.users.create({
      data: {
        full_name,
        phone_number,
        passcode, // In production, this should be hashed
        role,
        organization,
        position,
        email,
      },
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        role: true,
        organization: true,
        position: true,
        email: true,
      },
    })

    return NextResponse.json({
      message: 'ការចុះឈ្មោះបានជោគជ័យ',
      user,
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'កំហុសក្នុងការចុះឈ្មោះ' },
      { status: 500 }
    )
  }
}