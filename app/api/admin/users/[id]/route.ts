import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { UserRole, hasPermission, canManageUser } from '@/lib/roles'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from cookies
    const token = request.headers.get('cookie')?.match(/auth-token=([^;]+)/)?.[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const params = await context.params
    const userId = parseInt(params.id)
    const body = await request.json()
    const currentUserRole = payload.role as UserRole

    // Get target user
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, phone_number: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent modification of super admin
    if (targetUser.phone_number === '077806680' && payload.phone_number !== '077806680') {
      return NextResponse.json({ error: 'Cannot modify super admin' }, { status: 403 })
    }

    // Check if current user can manage target user
    if (body.role && !canManageUser(currentUserRole, targetUser.role as UserRole)) {
      return NextResponse.json({ error: 'Cannot manage user with equal or higher role' }, { status: 403 })
    }

    // Check permissions for different update types
    if (body.role && !hasPermission(currentUserRole, 'users.manage_roles')) {
      return NextResponse.json({ error: 'Insufficient permissions to manage roles' }, { status: 403 })
    }

    if (body.is_active !== undefined && !hasPermission(currentUserRole, 'users.update')) {
      return NextResponse.json({ error: 'Insufficient permissions to update user status' }, { status: 403 })
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(body.role && { role: body.role }),
        ...(body.is_active !== undefined && { is_active: body.is_active }),
      },
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        role: true,
        organization: true,
        position: true,
        email: true,
        is_active: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}