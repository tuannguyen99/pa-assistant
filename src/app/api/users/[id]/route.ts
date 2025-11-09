import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if current user is authenticated
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Try to find user by employeeId first, then by database id
    let user = await prisma.user.findUnique({
      where: { employeeId: id },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        email: true,
        grade: true,
        department: true,
        jobTitle: true,
        employmentStatus: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            fullName: true,
            employeeId: true
          }
        },
        roles: true
      }
    })

    // If not found by employeeId, try by database id
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          employeeId: true,
          fullName: true,
          email: true,
          grade: true,
          department: true,
          jobTitle: true,
          employmentStatus: true,
          managerId: true,
          manager: {
            select: {
              id: true,
              fullName: true,
              employeeId: true
            }
          },
          roles: true
        }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse roles if needed
    let roles: string[] = []
    if (Array.isArray(user.roles)) {
      roles = user.roles as string[]
    } else if (typeof user.roles === 'string') {
      try {
        roles = JSON.parse(user.roles)
        if (!Array.isArray(roles)) {
          roles = []
        }
      } catch (e) {
        console.error('Failed to parse roles JSON:', e)
        roles = []
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        roles
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
