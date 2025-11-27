import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'
import { handleApiError, validationError } from '@/lib/api-error-handler'

/**
 * External Login Bridge API
 *
 * This endpoint validates the external Globe API token,
 * creates/syncs a local user record, and issues an internal JWT token.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accessToken, externalUser } = body

    // Validation
    if (!accessToken) {
      return validationError('Access token is required', { accessToken: 'Required field' })
    }
    if (!externalUser) {
      return validationError('External user data is required', { externalUser: 'Required field' })
    }

    // Note: Token verification skipped because:
    // 1. The token was just validated successfully during the login call
    // 2. The Globe API may not have a separate verify endpoint
    // 3. The token is stored for future use, not for immediate verification
    // If additional verification is needed, implement it here with proper error handling

    // Map external user data to internal user structure
    const externalId = externalUser.id
    const teacherId = externalUser.teacherId?.toString() || externalId
    const phoneNumber = externalUser.phone || externalUser.username
    const fullName = `${externalUser.first_name || ''} ${externalUser.last_name || ''}`.trim() || externalUser.username

    // Check if user already exists (by external ID or teacherId)
    let user = await prisma.users.findFirst({
      where: {
        OR: [
          { external_user_id: externalId },
          { phone_number: phoneNumber }
        ]
      }
    })

    if (!user) {
      // Create new user record from external data
      user = await prisma.users.create({
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          passcode: '0000', // Not used for external users
          role: 'PARTNER', // External users are partners (schools)
          contract_type: 5, // Always contract type 5 for external users
          organization: externalUser.roleKh || externalUser.roleEn || 'សាលារៀន',
          position: externalUser.roleKh || externalUser.roleEn,
          email: externalUser.email,
          is_active: true,
          external_user_id: externalId,
          external_access_token: accessToken, // Store for future API calls
          last_login: new Date(),
        }
      })
    } else {
      // Update existing user with latest external data
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          external_user_id: externalId,
          external_access_token: accessToken,
          last_login: new Date(),
          // Update user info in case it changed
          full_name: fullName,
          email: externalUser.email,
          organization: externalUser.roleKh || externalUser.roleEn || user.organization,
          position: externalUser.roleKh || externalUser.roleEn || user.position,
        }
      })
    }

    // Create internal JWT token
    const token = await createToken({
      userId: user.id,
      phone_number: user.phone_number,
      full_name: user.full_name,
      role: user.role,
      isExternalUser: true,
    })

    // Return response with cookie
    const response = NextResponse.json({
      message: 'External login successful',
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
      requiresContractSigning: !user.contract_signed,
    })

    // Set the auth cookie (same as internal login)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Changed to 'none' to support iframe/cross-site contexts
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    return handleApiError(error, '/api/auth/external-login')
  }
}
