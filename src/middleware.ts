import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

// Add CORS headers for network access
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Public routes that don't need authentication
    const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/api/auth', '/unauthorized']
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      const response = NextResponse.next()
      return addCorsHeaders(response)
    }

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Role-based access control
    const userRole = token.role as UserRole

    // SuperAdmin routes
    if (pathname.startsWith('/superadmin')) {
      if (userRole !== UserRole.SUPERADMIN) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Admin/Owner routes
    if (pathname.startsWith('/admin')) {
      if (userRole !== UserRole.OWNER && userRole !== UserRole.ADMIN && userRole !== UserRole.SUPERADMIN) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Kasir routes
    if (pathname.startsWith('/kasir')) {
      if (userRole !== UserRole.KASIR && userRole !== UserRole.OWNER && userRole !== UserRole.SUPERADMIN) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    const response = NextResponse.next()
    return addCorsHeaders(response)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes without token
        const pathname = req.nextUrl.pathname
        const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/api/auth', '/unauthorized']
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/superadmin/:path*',
    '/admin/:path*',
    '/kasir/:path*',
    '/dashboard/:path*'
  ]
}
