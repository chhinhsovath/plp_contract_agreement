import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register', '/demo-login', '/api/demo/reset']

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

  // Role-based access control
  const userRole = payload.role as string

  // Define restricted paths and their allowed roles
  const restrictedPaths: Record<string, string[]> = {
    '/activities': [], // HIDDEN: Activities page - blocked for all roles
    '/milestones': [], // HIDDEN: Milestones page - blocked for all roles
    '/contracts': ['SUPER_ADMIN', 'ADMIN'], // Contract list view
    '/admin/users': ['SUPER_ADMIN'], // User management - SUPER_ADMIN only
    '/admin/reconfiguration-requests': ['SUPER_ADMIN'], // Reconfiguration requests - SUPER_ADMIN only
    '/admin/indicators-rules': ['SUPER_ADMIN'], // Indicator calculation rules - SUPER_ADMIN only
    '/admin/content-management': ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'], // Content management - COORDINATOR can access
    '/admin/deliverables-management': ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'], // Deliverables management - COORDINATOR can access
    '/api/admin/users': ['SUPER_ADMIN'], // User API - SUPER_ADMIN only
    '/api/admin/reconfiguration-requests': ['SUPER_ADMIN'], // Reconfig API - SUPER_ADMIN only
    '/api/admin/indicators': ['SUPER_ADMIN'], // Indicators API - SUPER_ADMIN only
    '/api/admin/deliverables': ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'], // Deliverables API - COORDINATOR can access
    '/api/admin/deliverable-options': ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'], // Options API - COORDINATOR can access
  }

  // Check if current path is restricted
  for (const [restrictedPath, allowedRoles] of Object.entries(restrictedPaths)) {
    if (path.startsWith(restrictedPath)) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect unauthorized users to home page
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // Special handling for PARTNER users
  if (userRole === 'PARTNER') {
    // Partners can access contract workflow pages and their own profile
    const allowedPartnerPaths = [
      '/contracts/new',
      '/contract/edit',
      '/contract/sign',        // Step 1: Read contract
      '/contract/configure',   // Step 2: Configure indicators
      '/contract/submit',      // Step 3: Sign and submit
      '/dashboard',         // Dashboard after completion
      '/indicators',        // Dedicated indicators page
      // '/activities',        // HIDDEN: Activities page
      // '/milestones',        // HIDDEN: Milestones page
      '/contracts',         // Dedicated contracts page
      '/profile',
      '/api/contracts',
      '/api/contract-deliverables',
      '/api/me',
      '/api/auth/logout',
      '/api/auth/session',
      '/'
    ]

    const isAllowed = allowedPartnerPaths.some(allowed => path.startsWith(allowed))

    if (!isAllowed) {
      // Redirect partners to home page if trying to access restricted areas
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Restrict other roles as needed
  const roleHierarchy: Record<string, string[]> = {
    'VIEWER': ['/', '/contracts/new', '/contract/edit', '/dashboard', '/indicators', '/contracts', '/profile', '/api/contracts', '/api/auth'],
    'OFFICER': ['/', '/contracts/new', '/contract/edit', '/dashboard', '/indicators', '/contracts', '/profile', '/api/contracts', '/api/auth'],
    'COORDINATOR': ['/', '/contracts/new', '/contract/edit', '/dashboard', '/indicators', '/contracts', '/profile', '/api/contracts', '/api/auth'],
    'MANAGER': ['/', '/contracts/new', '/contract/edit', '/dashboard', '/indicators', '/contracts', '/profile', '/api/contracts', '/api/auth'],
  }

  if (userRole in roleHierarchy) {
    const allowedPaths = roleHierarchy[userRole]
    const isAllowed = allowedPaths.some(allowed => path.startsWith(allowed))

    if (!isAllowed && path !== '/') {
      // Redirect to home page for unauthorized access
      return NextResponse.redirect(new URL('/', request.url))
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