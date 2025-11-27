import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { UserRole, hasPermission, canManageUser } from '@/lib/roles'

export async function DELETE(request: Request) {
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

    const currentUserRole = payload.role as UserRole

    // Check if user has delete permission
    if (!hasPermission(currentUserRole, 'users.delete')) {
      return NextResponse.json({ error: 'Insufficient permissions to delete users' }, { status: 403 })
    }

    const body = await request.json()
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Invalid user IDs provided' }, { status: 400 })
    }

    // Get all target users
    const targetUsers = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, role: true, phone_number: true, full_name: true },
    })

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: 'No users found with provided IDs' }, { status: 404 })
    }

    // Filter out users that cannot be deleted
    const undeletableUsers: string[] = []
    const deletableUserIds: number[] = []

    for (const user of targetUsers) {
      // Cannot delete super admin
      if (user.phone_number === '077806680') {
        undeletableUsers.push(`${user.full_name} (Super Admin - cannot delete)`)
        continue
      }

      // Cannot delete self
      if (payload.userId === user.id) {
        undeletableUsers.push(`${user.full_name} (Cannot delete your own account)`)
        continue
      }

      // Cannot delete users with equal or higher role
      if (!canManageUser(currentUserRole, user.role as UserRole)) {
        undeletableUsers.push(`${user.full_name} (Insufficient permissions)`)
        continue
      }

      deletableUserIds.push(user.id)
    }

    // Delete allowed users
    let deletedCount = 0
    if (deletableUserIds.length > 0) {
      const result = await prisma.users.deleteMany({
        where: { id: { in: deletableUserIds } },
      })
      deletedCount = result.count
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      totalRequested: userIds.length,
      undeletableUsers,
      message: `Successfully deleted ${deletedCount} user(s)${undeletableUsers.length > 0 ? `, ${undeletableUsers.length} user(s) could not be deleted` : ''}`
    })
  } catch (error: any) {
    console.error('Error deleting users:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete users',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
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

    // Check permissions
    const userRole = payload.role as UserRole
    if (!hasPermission(userRole, 'users.read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch all users
    const users = await prisma.users.findMany({
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
        last_login: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}