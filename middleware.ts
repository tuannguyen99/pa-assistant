import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from './src/lib/prisma'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  console.log('Middleware running for:', pathname)
  console.log('Token present:', !!token)

  // Protect dashboard routes - require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect admin routes - require HR Admin role
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has hr_admin role
    try {
      const user = await prisma.user.findUnique({
        where: { email: token.email as string },
        select: { roles: true }
      })

      if (!user?.roles || !(user.roles as unknown as string[]).includes('hr_admin')) {
        // Redirect to dashboard or show unauthorized
        const dashboardUrl = new URL('/dashboard', req.url)
        return NextResponse.redirect(dashboardUrl)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/admin/:path*'],
}
