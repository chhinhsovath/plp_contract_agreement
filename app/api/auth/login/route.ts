import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone_number, passcode } = body

    // Find user by phone number
    const user = await prisma.users.findUnique({
      where: { phone_number },
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        passcode: true,
        role: true,
        organization: true,
        position: true,
        email: true,
        is_active: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'គណនីរបស់អ្នកត្រូវបានផ្អាក' },
        { status: 401 }
      )
    }

    // Verify passcode (in production, compare hashed passwords)
    if (user.passcode !== passcode) {
      return NextResponse.json(
        { error: 'លេខសម្ងាត់មិនត្រឹមត្រូវ' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    })

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      phone_number: user.phone_number,
      full_name: user.full_name,
      role: user.role,
    })

    // Set auth cookie
    const response = NextResponse.json({
      message: 'ចូលប្រើប្រាស់បានជោគជ័យ',
      user: {
        id: user.id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        role: user.role,
        organization: user.organization,
        position: user.position,
        email: user.email,
      },
    })

    // Set the auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'កំហុសក្នុងការចូលប្រើប្រាស់' },
      { status: 500 }
    )
  }
}