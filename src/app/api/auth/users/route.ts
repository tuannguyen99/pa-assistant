import { NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'

export async function GET() {
  try {
    // Check if current user is HR Admin
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isHRAdmin = await AuthService.isHRAdmin(currentUser.id)
    if (!isHRAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - HR Admin access required' },
        { status: 403 }
      )
    }

    // Get all users
    const users = await AuthService.getAllUsers()

    // Remove sensitive fields from response
    const usersWithoutPasswords = users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      grade: user.grade,
      department: user.department,
      employeeId: user.employeeId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return NextResponse.json({ users: usersWithoutPasswords }, { status: 200 })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}