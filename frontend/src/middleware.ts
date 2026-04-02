import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')
  const { pathname } = request.nextUrl

  // List of public auth routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password')

  if (!authToken && !isAuthRoute) {
    // Redirect to login if unauthenticated user tries to access a protected route
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authToken && isAuthRoute) {
    // Redirect to dashboard if authenticated user tries to access an auth route
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
