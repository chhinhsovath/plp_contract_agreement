import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { UserRole, hasPermission } from '@/lib/roles'

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