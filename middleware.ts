import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isUser = token?.role === 'USER'

    const pathname = req.nextUrl.pathname

    // Redirect based on user role
    if (pathname === '/' || pathname === '/login') {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      if (isUser) {
        return NextResponse.redirect(new URL('/user/dashboard', req.url))
      }
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/user/dashboard', req.url))
    }

    // Protect user routes
    if (pathname.startsWith('/user') && !isUser) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/user/:path*',
  ]
}
