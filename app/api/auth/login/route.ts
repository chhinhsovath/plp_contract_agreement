import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'
import { handleApiError, unauthorizedError, validationError, forbiddenError } from '@/lib/api-error-handler'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone_number, passcode } = body

    // Validation
    if (!phone_number) {
      return validationError('Phone number is required', { phone_number: 'Required field' })
    }
    if (!passcode) {
      return validationError('Passcode is required', { passcode: 'Required field' })
    }

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
        contract_type: true,
        contract_signed: true,
        contract_signed_date: true,
      },
    })

    if (!user) {
      return unauthorizedError('លេខទូរស័ព្ទមិនត្រឹមត្រូវ')
    }

    // Check if user is active
    if (!user.is_active) {
      return forbiddenError('គណនីរបស់អ្នកត្រូវបានផ្អាក')
    }

    // Verify passcode (in production, compare hashed passwords)
    if (user.passcode !== passcode) {
      return unauthorizedError('លេខសម្ងាត់មិនត្រឹមត្រូវ')
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
        contract_type: user.contract_type,
        contract_signed: user.contract_signed,
        contract_signed_date: user.contract_signed_date,
      },
      requiresContractSigning: user.role === 'PARTNER' && !user.contract_signed,
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
    return handleApiError(error, '/api/auth/login')
  }
}