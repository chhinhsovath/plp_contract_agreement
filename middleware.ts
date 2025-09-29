import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const payload = await verifyToken(token.value)

  if (!payload) {
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Check role-based access for PARTNER users
  if (payload.role === 'PARTNER') {
    // Partners can only access contract forms and their own profile
    const allowedPartnerPaths = [
      '/contracts/new',
      '/contracts/edit',
      '/profile',
      '/api/contracts',
      '/api/auth/logout',
      '/api/auth/session'
    ]

    const isAllowed = allowedPartnerPaths.some(allowed => path.startsWith(allowed))

    if (!isAllowed && path !== '/') {
      // Redirect partners to contracts page if trying to access restricted areas
      return NextResponse.redirect(new URL('/contracts/new', request.url))
    }
  }

  // Add user info to headers for API routes
  if (path.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', String(payload.userId))
    requestHeaders.set('x-user-phone', String(payload.phone_number))
    requestHeaders.set('x-user-role', String(payload.role))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}