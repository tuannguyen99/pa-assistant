import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  console.log('=== MIDDLEWARE CALLED ===')
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  console.log('Middleware running for:', pathname)
  console.log('Token present:', !!token)
  if (token) {
    console.log('Token roles:', token.roles)
  }

  // Protect dashboard routes - require authentication
  if (pathname.startsWith('/dashboard')) {
    console.log('Dashboard route detected, token:', !!token)
    if (!token) {
      console.log('No token, redirecting to login')
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    console.log('Token found, allowing access')
  }

  // Protect admin routes - require HR Admin role
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check if token has hr_admin role
    const roles = token.roles as string[] | undefined
    console.log('Admin route - user roles:', roles)
    
    if (!roles || !Array.isArray(roles) || !roles.includes('hr_admin')) {
      console.log('User does not have hr_admin role, redirecting to dashboard')
      const dashboardUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(dashboardUrl)
    }
    
    console.log('User has hr_admin role, allowing access')
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
